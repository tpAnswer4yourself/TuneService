from fastapi.security import OAuth2PasswordBearer
from models import User as DbUser
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from jose import jwt, JWTError

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")

scheme_auth = OAuth2PasswordBearer(tokenUrl="login")

def create_access_token(username: str):
    
    if ACCESS_TOKEN_EXPIRE_MINUTES is None:
        raise ValueError("FAIL: access token exp minutes (from .env) is NONE!!! ")
    
    start_time = datetime.now()
    end_time = start_time + timedelta(minutes=int(ACCESS_TOKEN_EXPIRE_MINUTES))
    
    payload = {
        "sub": username, #юзернейм из бдшки
        "iat": start_time, # время выдачи токена
        "exp": end_time # время конца действия токена
    }
    print("Токен .env:", ACCESS_TOKEN_EXPIRE_MINUTES)
    print("Токен start_time:", start_time)
    print("Токен end_time:", end_time)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

#функция написана, для авторизированных пользователей (можно в будущем для ролей юзать, внутри других функций (типо удалять могут только авторизированные юзеры))
def get_current_user(token: str = Depends(scheme_auth), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=ALGORITHM)
        exp_time = payload.get("exp")
        print("с токеном все ок, он жив")
        if exp_time is None or exp_time < datetime.utcnow().timestamp():
            raise HTTPException(status_code=401, detail="Token has expired")
        
    except JWTError:
        print("токен МЕРТВ")
        raise HTTPException(status_code=401, detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})
    
    username_from_payload = payload.get("sub")
     
    if username_from_payload is None:
        raise HTTPException(status_code=401, detail="EMPTY USERNAME IN PAYLOAD", headers={"WWW-Authenticate": "Bearer"})
    
    user = db.query(DbUser).filter(DbUser.username == username_from_payload).first()
    
    if user is None:
        raise HTTPException(status_code=401, detail="User not found!", headers={"WWW-Authenticate": "Bearer"})
    
    return user

def get_current_admin(token: str = Depends(scheme_auth), db: Session = Depends(get_db)):
    current_user = get_current_user(token, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Доступ запрещен! Требуются права администратора", headers={"WWW-Authenticate": "Bearer"})
    return current_user