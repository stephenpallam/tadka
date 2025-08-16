from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from models.auth_models import RegisterRequest, LoginRequest, Token, UserResponse
from auth import (
    authenticate_user,
    create_access_token,
    get_password_hash,
    users_collection,
    get_current_active_user,
    require_admin,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=dict)
async def register_user(user_data: RegisterRequest):
    """Register a new user"""
    # Check if passwords match
    if user_data.password != user_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    # Check if username already exists
    existing_user = await users_collection.find_one({"username": user_data.username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user_doc = {
        "username": user_data.username,
        "hashed_password": hashed_password,
        "password": user_data.password,  # Keep for model compatibility
        "roles": ["Viewer"],  # Default role
        "created_at": datetime.utcnow(),
        "is_active": True
    }
    
    result = await users_collection.insert_one(user_doc)
    if result.inserted_id:
        return {
            "message": "User registered successfully",
            "username": user_data.username,
            "roles": ["Viewer"]
        }
    
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to create user"
    )

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login user and return JWT token"""
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "roles": user.roles},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(
            username=user.username,
            roles=user.roles,
            created_at=user.created_at,
            is_active=user.is_active
        )
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: UserResponse = Depends(get_current_active_user)):
    """Get current user information"""
    return current_user

@router.get("/users", response_model=list)
async def get_all_users(current_user: UserResponse = Depends(require_admin)):
    """Get all users (Admin only)"""
    users = []
    async for user in users_collection.find({}, {"hashed_password": 0, "password": 0}):
        user["_id"] = str(user["_id"])
        users.append(user)
    return users

@router.put("/users/{username}/role")
async def update_user_role(
    username: str, 
    new_roles: list,
    current_user: UserResponse = Depends(require_admin)
):
    """Update user roles (Admin only)"""
    valid_roles = ["Viewer", "Author", "Publisher", "Admin"]
    if not all(role in valid_roles for role in new_roles):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role specified"
        )
    
    result = await users_collection.update_one(
        {"username": username},
        {"$set": {"roles": new_roles}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": f"User {username} roles updated to {new_roles}"}

@router.delete("/users/{username}")
async def delete_user(
    username: str,
    current_user: UserResponse = Depends(require_admin)
):
    """Delete user (Admin only)"""
    if username == "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete admin user"
        )
    
    result = await users_collection.delete_one({"username": username})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": f"User {username} deleted successfully"}