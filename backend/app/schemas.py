"""
Pydantic schemas used for request validation and response serialization.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict

from app.models import RoleEnum, StatusEnum


# ---------- USER / AUTH ----------

class EquipmentPublicOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category: str
    description: Optional[str] = None
    price_per_day: float
    location: str
    image_url: Optional[str] = None
    created_at: datetime

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    role: RoleEnum


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class VerifyOTP(BaseModel):
    email: EmailStr
    otp: str

class ResendOTP(BaseModel):
    email: EmailStr

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    phone: str
    role: RoleEnum
    is_email_verified: bool
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- EQUIPMENT ----------


class EquipmentCreate(BaseModel):
    name: str
    category: str
    description: Optional[str] = None
    price_per_day: float
    location: str
    available: bool = True


class EquipmentUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    price_per_day: Optional[float] = None
    location: Optional[str] = None
    image_url: Optional[str] = None
    available: Optional[bool] = None


class EquipmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category: str
    description: Optional[str] = None
    price_per_day: float
    location: str
    image_url: Optional[str] = None
    available: bool
    owner_id: int
    created_at: datetime
    owner_name: Optional[str] = None
    owner_phone: Optional[str] = None


# ---------- BOOKING ----------

class BookingCreate(BaseModel):
    equipment_id: int
    start_date: datetime
    end_date: datetime


class BookingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    equipment_id: int
    farmer_id: int
    owner_id: int
    start_date: datetime
    end_date: datetime
    total_price: float
    status: StatusEnum
    created_at: datetime
    equipment_name: Optional[str] = None
    farmer_name: Optional[str] = None
