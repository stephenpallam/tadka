from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class RegisterRequest(BaseModel):
    username: str
    password: str
    confirm_password: str

class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: "UserResponse"

class UserResponse(BaseModel):
    username: str
    roles: List[str]
    is_active: bool
    created_at: Optional[datetime] = None

class UserInDB(BaseModel):
    username: str
    hashed_password: str
    roles: List[str]
    is_active: bool
    created_at: Optional[datetime] = None