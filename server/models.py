from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime, timezone

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="user", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    tracks = relationship("Track", back_populates="user", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    
    @property
    def favorite_tracks(self):
        return [fav.track for fav in self.favorites] # получение избранных треков напрямую
    
class Track(Base):
    __tablename__ = "tracks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    artist = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    file_path = Column(String, nullable=False)
    cover_path = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    duration = Column(Integer, nullable=True, default=0)
    
    user = relationship("User", back_populates="tracks")
    favorites = relationship("Favorite", back_populates="track", cascade="all, delete-orphan")
    
    @property
    def favorited_by_users(self):
        return [fav.user for fav in self.favorites] #получение пользователей лайкнувших трек
    
    @property
    def count_favorites(self):
        return len(self.favorites) #получение количества лайков на треке
    
class Favorite(Base):
    __tablename__ = "favorites"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    track_id = Column(Integer, ForeignKey("tracks.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    
    user = relationship("User", back_populates="favorites")
    track = relationship("Track", back_populates="favorites")
    
    __table_args__ = (
        UniqueConstraint('user_id', 'track_id', name='uq_favorite_user_track'),
    )