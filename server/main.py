from fastapi import FastAPI, Depends, HTTPException, APIRouter, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import engine, get_db, Base
import os
import uuid

from typing import List, Optional
from models import User as DbUser
from models import Track as DbTrack
from models import Favorite as DbFavorite
from schemas import User, UserCreate, ChangePasswordRequest, Track, TrackCreate, Favorite, FavoriteCreate # ChangePasswordResponse, TrackCreate
from save_files import save_upload_files, delete_upload_files
from cover_func import resize_cover

import bcrypt

from auth import create_access_token, get_current_user, get_current_admin #scheme_auth
from fastapi.security import OAuth2PasswordRequestForm


app = FastAPI(title="RegService API")
router = APIRouter(prefix="/users", tags=["users"])
tracks_router = APIRouter(prefix="/tracks", tags=["tracks"])
favorite_router = APIRouter(prefix="/favorite", tags=["favorites"])

#Base.metadata.create_all(bind=engine) # делаем с помощью alembic миграции БД

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
    
@router.get("/all", response_model=List[User])
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
        raise HTTPException(404, "User not found!")
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
    password_data: ChangePasswordRequest,
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

@router.get("/admin-panel", response_model=User)
def get_admin_panel(current_user: DbUser = Depends(get_current_admin)):
    return current_user

@tracks_router.post("/upload", response_model=Track, status_code=201)
async def upload_track(
    file: UploadFile = File(...),
    cover: Optional[UploadFile] = File(None),
    title: str = Form(...),
    artist: str = Form(...),
    current_user: DbUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Проверки и работа с аудио-файлом
    if file.filename == "":
        raise HTTPException(400, "File is not empty!!!")
    if not file.content_type in ["audio/mpeg", "audio/wav"]:
        raise HTTPException(400, "only audio")
    audio_ext = os.path.splitext(file.filename)[1].lower()
    ext_access = [".mp3", ".wav", ".ogg", ".flac"]
    if audio_ext not in ext_access:
        raise HTTPException(400, "Неподдерживаемый формат!")
    unique_name_audio = f"{uuid.uuid4().hex}{audio_ext}"
    audio_file_path=f"uploads/tracks/{unique_name_audio}"
    await save_upload_files(file, audio_file_path)
    
    # Проверки и работа с обложкой
    cover_path = None
    if cover and cover.filename:
        image_extensions = [".jpg", ".jpeg", ".png", ".webp"]
        # image_content_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
        
        cover_ext = os.path.splitext(cover.filename)[1].lower()
        if cover_ext not in image_extensions:
            if os.path.exists(audio_file_path):
                os.remove(audio_file_path)
            raise HTTPException(400, f"Unsupported image format!")
        unique_name_cover = f"{uuid.uuid4().hex}{cover_ext}"
        cover_file_path=f"uploads/covers/{unique_name_cover}"
        await save_upload_files(cover, cover_file_path)
        
        try:
            await resize_cover(cover_file_path, max_size=(800, 800))
        except Exception as e:
            print(f"Error resizing cover: {e}")
        
        cover_path = cover_file_path
        
    db_track = DbTrack(
        title = title,
        artist = artist,
        user_id = current_user.id,
        file_path = audio_file_path,
        cover_path = cover_path,
        duration = None
    )
    
    try:
        db.add(db_track)
        db.commit()
        db.refresh(db_track)
        return db_track
    except:
        os.remove(audio_file_path)
        if cover_path:
            os.remove(cover_file_path)
        raise HTTPException(400, "Не удалось добавить трек в базу данных")

@tracks_router.get("/search_id={track_id}", response_model=Track)
def get_track(track_id: int, db: Session = Depends(get_db)):
    track = db.query(DbTrack).filter(DbTrack.id == track_id).first()
    if not track:
        raise HTTPException(404, "Track not found!")
    return track

@tracks_router.get("/all", response_model=List[Track])
def get_all_tracks(db: Session = Depends(get_db)):
    return db.query(DbTrack).all()

@tracks_router.get("/stream/{track_id}")
async def stream_track(track_id: int, db: Session = Depends(get_db)):
    track = db.query(DbTrack).filter(DbTrack.id == track_id).first()
    if not track:
        raise HTTPException(404, "Трек не найден!")
    return FileResponse(track.file_path, media_type="audio/mpeg")

@tracks_router.get("/cover/{track_id}")
async def cover_track(track_id: int, db: Session = Depends(get_db)):
    track = db.query(DbTrack).filter(DbTrack.id == track_id).first()
    if not track:
        raise HTTPException(404, "Трек не найден!")
    if not track.cover_path:
        return None
    if not os.path.exists(track.cover_path):
        raise HTTPException(404, "Файла для обложки нет на сервере!")
    ext = os.path.splitext(track.cover_path)[1].lower()
    media_types = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.bmp': 'image/bmp'
    }
    media_type = media_types.get(ext, 'image/jpeg')
    return FileResponse(track.cover_path, media_type=media_type)

@tracks_router.delete("/delete/{track_id}", status_code=204)
def delete_track(track_id: int, db: Session = Depends(get_db)):
    track = db.query(DbTrack).filter(DbTrack.id == track_id).first()
    if not track:
        raise HTTPException(404, "Track not found!")
    
    delete_upload_files(track.file_path)
    if track.cover_path:
        delete_upload_files(track.cover_path)
    db.delete(track)
    db.commit()
    return None

@tracks_router.patch("/view/{track_id}", status_code=200)
def update_view_count(track_id: int, db: Session = Depends(get_db), current_user: DbUser = Depends(get_current_user)):
    track = db.query(DbTrack).filter(DbTrack.id == track_id).first()
    if not track:
        raise HTTPException(404, "Track not found!")
    track.views += 1
    # СДЕЛАТЬ ЛИМИТ ОТ ОДНОГО ЮЗЕРА НА ПРОСЛУШИВАНИЕ, ЛОГИКУ ЗАСЧИТЫВАНИЯ, ДОП.ПРОВЕРКИ НА СЕРВЕРЕ И ФРОНТЕ
    db.commit()
    db.refresh(track)
    return {"message": "+1 прослушивание"}

@favorite_router.get("/my-tracks", response_model=List[Track])
def get_my_favorite_tracks(current_user: DbUser = Depends(get_current_user), db: Session = Depends(get_db)):
    tracks = db.query(DbTrack)\
        .join(
            DbFavorite,
            DbFavorite.track_id == DbTrack.id
        )\
        .filter(DbFavorite.user_id == current_user.id)\
        .order_by(DbFavorite.created_at.desc())\
        .all()
    return tracks

@favorite_router.get("/track/{track_id}")
def get_my_favorite_track_by_id(track_id: int, current_user: DbUser = Depends(get_current_user), db: Session = Depends(get_db)):
    track = db.query(DbFavorite).filter(DbFavorite.user_id == current_user.id, DbFavorite.track_id == track_id).first()
    return {"is_favorite": track is not None}

@favorite_router.post("/add", response_model=Favorite, status_code=201)
def add_track_in_favorite(request: FavoriteCreate, current_user: DbUser = Depends(get_current_user), db: Session = Depends(get_db)):
    track_id = request.track_id
    track_exist = db.query(DbTrack).filter(DbTrack.id == track_id).first()
    if not track_exist:
        raise HTTPException(404, "Track not found!") #проверка на существование трека
    
    track_yet_added = db.query(DbFavorite).filter(DbFavorite.user_id == current_user.id, DbFavorite.track_id == track_id).first()
    if track_yet_added:
        raise HTTPException(409, "The track has already been added to favorites!") # был ли добавлен трек ранее
    
    db_favorite = DbFavorite(
        user_id = current_user.id,
        track_id = track_id
    )
    
    db.add(db_favorite)
    db.commit()
    db.refresh(db_favorite)
    return db_favorite

@favorite_router.delete("/delete/{track_id}", status_code=204)
def delete_track_in_favorite(track_id: int, current_user: DbUser = Depends(get_current_user), db: Session = Depends(get_db)):
    track = db.query(DbFavorite).filter(DbFavorite.user_id == current_user.id, DbFavorite.track_id == track_id).first()
    if not track:
        raise HTTPException(409, "The track has not already been added to favorites!") # был ли добавлен трек ранее
    
    db.delete(track)
    db.commit()
    return None




app.include_router(router)
app.include_router(tracks_router)
app.include_router(favorite_router)