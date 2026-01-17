from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str | None = None
    password_hash: str
    role: str | None = "user"
    
class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    role: str
    
    class Config:
        from_attributes = True

class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str
    new_password_confirm: str
    
class PasswordChangeResponse(BaseModel):
    message: str