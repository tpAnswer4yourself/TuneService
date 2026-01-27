from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
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
    
class Track(TrackCreate):
    id: int
    user_id: int
    file_path: str
    cover_path: Optional[str] = None
    created_at: datetime
    duration: int
    
    class Config:
        from_attributes = True
        
class FavoriteCreate(BaseModel):
    track_id: int
    
class Favorite(FavoriteCreate):
    user_id: int
    created_at: datetime
    id: int
    
    class Config:
        from_attributes = True