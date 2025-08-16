import os
from datetime import datetime, timedelta
from typing import List
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from models.auth_models import UserInDB, UserResponse

# Configuration
SECRET_KEY = os.environ.get("SECRET_KEY", "tadka-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8 hours

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]
users_collection = db.users

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_user_by_username(username: str) -> UserInDB:
    """Get user from database by username"""
    user_data = await users_collection.find_one({"username": username})
    if user_data:
        user_data["_id"] = str(user_data["_id"])
        return UserInDB(**user_data)
    return None

async def authenticate_user(username: str, password: str) -> UserInDB:
    """Authenticate user with username and password"""
    user = await get_user_by_username(username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserResponse:
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await get_user_by_username(username)
    if user is None:
        raise credentials_exception
    
    return UserResponse(
        username=user.username,
        roles=user.roles,
        created_at=user.created_at,
        is_active=user.is_active
    )

async def get_current_active_user(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# Role-based access control
def require_roles(required_roles: List[str]):
    """Decorator to require specific roles"""
    async def role_checker(current_user: UserResponse = Depends(get_current_active_user)):
        if not any(role in current_user.roles for role in required_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Insufficient permissions"
            )
        return current_user
    return role_checker

# Role dependencies
require_admin = require_roles(["Admin"])
require_publisher = require_roles(["Publisher", "Admin"])
require_author = require_roles(["Author", "Publisher", "Admin"])
require_viewer = require_roles(["Viewer", "Author", "Publisher", "Admin"])

async def create_default_admin():
    """Create default admin user if it doesn't exist"""
    admin_exists = await users_collection.find_one({"username": "admin"})
    if not admin_exists:
        admin_user = {
            "username": "admin",
            "hashed_password": get_password_hash("admin123"),
            "roles": ["Admin"],
            "created_at": datetime.utcnow(),
            "is_active": True,
            "password": "admin123"  # This will be removed after hashing
        }
        del admin_user["password"]  # Remove plain password
        await users_collection.insert_one(admin_user)
        print("✅ Default admin user created: username='admin', password='admin123'")
        return True
    return False