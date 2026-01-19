from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List

class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str | None = None
    password_hash: str
    
class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str
    new_password_confirm: str
    
class ChangePasswordResponse(BaseModel):
    message: str
    
    
class TrackCreate(BaseModel):
    title: str
    artist: str
    user_id: int
    
class Track(TrackCreate):
    id: int
    title: str
    artist: str
    user_id: int
    file_path: str
    created_at: datetime
    duration: int
    
    class Config:
        from_attributes = True
        