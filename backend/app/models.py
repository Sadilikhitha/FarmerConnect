"""
SQLAlchemy ORM models: User, Equipment, Booking.
"""

import enum
from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    ForeignKey,
    DateTime,
    Enum,
    Text,
)
from sqlalchemy.orm import relationship

from app.database import Base


class RoleEnum(str, enum.Enum):
    farmer = "farmer"
    owner = "owner"


class StatusEnum(str, enum.Enum):
    Pending = "Pending"
    Approved = "Approved"
    Rejected = "Rejected"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    equipment = relationship(
        "Equipment", back_populates="owner", cascade="all, delete-orphan"
    )
    bookings_as_farmer = relationship(
        "Booking",
        back_populates="farmer",
        foreign_keys="Booking.farmer_id",
        cascade="all, delete-orphan",
    )
    bookings_as_owner = relationship(
        "Booking",
        back_populates="owner",
        foreign_keys="Booking.owner_id",
        cascade="all, delete-orphan",
    )


class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    price_per_day = Column(Float, nullable=False)
    location = Column(String(150), nullable=False)
    image_url = Column(String(500), nullable=False)
    available = Column(Boolean, default=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="equipment")
    bookings = relationship(
        "Booking", back_populates="equipment", cascade="all, delete-orphan"
    )


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id"), nullable=False)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    total_price = Column(Float, nullable=False)
    status = Column(Enum(StatusEnum), default=StatusEnum.Pending)
    created_at = Column(DateTime, default=datetime.utcnow)

    equipment = relationship("Equipment", back_populates="bookings")
    farmer = relationship(
        "User", back_populates="bookings_as_farmer", foreign_keys=[farmer_id]
    )
    owner = relationship(
        "User", back_populates="bookings_as_owner", foreign_keys=[owner_id]
    )
