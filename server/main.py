from fastapi import FastAPI, Depends, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import engine, get_db, Base
import os

from typing import List
from models import User as DbUser
from schemas import User, UserCreate, PasswordChangeRequest, PasswordChangeResponse

import bcrypt

from auth import scheme_auth, create_access_token, get_current_user
from fastapi.security import OAuth2PasswordRequestForm


app = FastAPI(title="RegService API")
router = APIRouter(prefix="/users", tags=["users"])
router_auth = APIRouter(prefix="/cabinet", tags="cabinet")

Base.metadata.create_all(bind=engine) # создание таблиц

list_origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=list_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
    )

@app.get("/")
def root():
    return {
        "message": "Server is alive!",
        "database_url": os.getenv("DATABASE_URL")
    }

@app.get("/test-db")
def test_database(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT 1"))
        value = result.scalar_one()
        return {
            "status": "success",
            "message": "Соединение с базой данных работает",
            "test_value": value  # будет 1
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка соединения с бд: {str(e)}")
    
@router.get("/", response_model=List[User])
def get_users(db: Session = Depends(get_db)):
    return db.query(DbUser).all()

@router.post("/registrate", response_model=User, status_code=201)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(DbUser).filter(DbUser.username == user.username).first():
        raise HTTPException(400, "Username already exists")
    
    if db.query(DbUser).filter(DbUser.email == user.email).first():
        raise HTTPException(400, "Email already exists")
    
    hashed = bcrypt.hashpw(user.password_hash.encode('utf-8'), bcrypt.gensalt())
    
    
    db_user = DbUser(
        username = user.username,
        email = user.email,
        full_name = user.full_name,
        password_hash = hashed.decode('utf-8')
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/get/{user_id}", response_model=User)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(DbUser).filter(DbUser.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    return user

@router.delete("/delete/{user_id}", status_code=204)
def delete_user(user_id: int, current_user: DbUser = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(DbUser).filter(DbUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found", headers={"WWW-Authenticate": "Bearer"})
    
    if user.id != DbUser.id:
        raise HTTPException(status_code=403, detail="You can only delete own account!", headers={"WWW-Authenticate": "Bearer"})
    
    db.delete(user)
    db.commit()
    return None

@router.post("/login", response_model=dict)
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):  
    base_user = db.query(DbUser).filter(DbUser.username == form_data.username).first()
    if base_user is None:
        raise HTTPException(status_code=401, detail="User is not found in database", headers={"WWW-Authenticate": "Bearer"})
    
    if not bcrypt.checkpw(form_data.password.encode('utf-8'), base_user.password_hash.encode('utf-8')):
        raise HTTPException(status_code=401, detail="Failed password!", headers={"WWW-Authenticate": "Bearer"})
    
    generated_token = create_access_token(username=base_user.username)
    return {"access_token": generated_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
def get_current_user_profile(current_user: DbUser = Depends(get_current_user)):
    return current_user

@router.post("/change-password", status_code=200)
def change_password(
    password_data: PasswordChangeRequest,
    current_user: DbUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    #проверки на стороне сервера
    if not bcrypt.checkpw(password_data.old_password.encode('utf-8'), current_user.password_hash.encode('utf-8')):
        raise HTTPException(status_code=401, detail="Неверный старый пароль!", headers={"WWW-Authenticate": "Bearer"})
    if password_data.new_password != password_data.new_password_confirm:
        raise HTTPException(status_code=400, detail="Новые пароли не совпадают!", headers={"WWW-Authenticate": "Bearer"})
    #хэширование
    hashed_new_pass = bcrypt.hashpw(password_data.new_password.encode('utf-8'), bcrypt.gensalt())
    current_user.password_hash = hashed_new_pass.decode('utf-8')
    db.commit()
    db.refresh(current_user)
    return {"message": "Пароль успешно изменен!"}

app.include_router(router)