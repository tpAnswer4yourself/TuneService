from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    id: int
    username: str
    email: EmailStr
    full_name: str | None = None
    password_hash: str
    
class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    
    class Config:
        from_attributes = True
    