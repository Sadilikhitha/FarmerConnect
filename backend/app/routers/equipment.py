"""
Equipment routes:
- List equipment
- View equipment
- Add equipment
- Update equipment
- Delete equipment
- View my listed equipment

Every registered user can manage their own equipment.
"""

from typing import List, Optional
import os
import shutil
from pathlib import Path

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    UploadFile,
    File,
    Form,
)

from fastapi.security import OAuth2PasswordBearer

from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.auth import decode_access_token
from app.dependencies import get_current_user


router = APIRouter(
    prefix="/equipment",
    tags=["Equipment"]
)


# =========================================================
# OPTIONAL AUTH
# Used when logged-out users view equipment.
# =========================================================

optional_oauth2 = OAuth2PasswordBearer(
    tokenUrl="/auth/token",
    auto_error=False,
)


def get_optional_user(
    token: Optional[str] = Depends(optional_oauth2),
    db: Session = Depends(get_db),
):

    if not token:
        return None

    payload = decode_access_token(token)

    if not payload:
        return None

    user_id = payload.get("sub")

    if not user_id:
        return None

    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        return None

    return (
        db.query(models.User)
        .filter(models.User.id == user_id)
        .first()
    )


# =========================================================
# OUTPUT HELPERS
# =========================================================

def _to_out(
    item: models.Equipment
) -> schemas.EquipmentOut:

    out = schemas.EquipmentOut.model_validate(item)

    out.owner_name = (
        item.owner.name
        if item.owner
        else None
    )

    out.owner_phone = (
        item.owner.phone
        if item.owner
        else None
    )

    return out


def _to_public_out(
    item: models.Equipment
) -> schemas.EquipmentPublicOut:

    return schemas.EquipmentPublicOut.model_validate(item)


# =========================================================
# LIST ALL EQUIPMENT
# Public endpoint
# =========================================================

@router.get(
    "",
    response_model=List[schemas.EquipmentPublicOut]
)
def list_equipment(
    search: Optional[str] = None,
    category: Optional[str] = None,
    location: Optional[str] = None,
    db: Session = Depends(get_db)
):

    query = db.query(models.Equipment)

    if search:
        query = query.filter(
            models.Equipment.name.ilike(
                f"%{search}%"
            )
        )

    if category:
        query = query.filter(
            models.Equipment.category.ilike(
                f"%{category}%"
            )
        )

    if location:
        query = query.filter(
            models.Equipment.location.ilike(
                f"%{location}%"
            )
        )

    items = (
        query
        .order_by(
            models.Equipment.created_at.desc()
        )
        .all()
    )

    return [
        _to_public_out(item)
        for item in items
    ]


# =========================================================
# MY EQUIPMENT
# Logged-in user only
# =========================================================

@router.get(
    "/mine",
    response_model=List[schemas.EquipmentOut]
)
def list_my_equipment(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):

    items = (
        db.query(models.Equipment)
        .filter(
            models.Equipment.owner_id
            == current_user.id
        )
        .order_by(
            models.Equipment.created_at.desc()
        )
        .all()
    )

    return [
        _to_out(item)
        for item in items
    ]


# =========================================================
# GET SINGLE EQUIPMENT
# Logged out -> public details
# Logged in -> full details
# =========================================================

@router.get(
    "/{equipment_id}"
)
def get_equipment(
    equipment_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(
        get_optional_user
    ),
):

    item = (
        db.query(models.Equipment)
        .filter(
            models.Equipment.id == equipment_id
        )
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Equipment not found"
        )

    if current_user:
        return _to_out(item)

    return _to_public_out(item)


# =========================================================
# CREATE EQUIPMENT
# Every logged-in user can list equipment
# =========================================================

@router.post(
    "",
    response_model=schemas.EquipmentOut,
    status_code=status.HTTP_201_CREATED
)
def create_equipment(
    name: str = Form(...),
    category: str = Form(...),
    description: Optional[str] = Form(None),
    price_per_day: float = Form(...),
    location: str = Form(...),
    available: bool = Form(True),
    image: UploadFile = File(...),

    db: Session = Depends(get_db),

    current_user: models.User = Depends(
        get_current_user
    ),
):

    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/jpg",
    }

    if image.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=(
                "Only JPG, JPEG, PNG, "
                "and WEBP images are allowed."
            )
        )

    upload_dir = Path("uploads")
    upload_dir.mkdir(
        parents=True,
        exist_ok=True
    )

    file_extension = (
        Path(image.filename).suffix.lower()
    )

    filename = (
        f"equipment_"
        f"{current_user.id}_"
        f"{os.urandom(8).hex()}"
        f"{file_extension}"
    )

    file_path = upload_dir / filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            image.file,
            buffer
        )

    image_url = f"/uploads/{filename}"

    item = models.Equipment(
        name=name,
        category=category,
        description=description,
        price_per_day=price_per_day,
        location=location,
        image_url=image_url,
        available=available,
        owner_id=current_user.id,
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return _to_out(item)


# =========================================================
# UPDATE EQUIPMENT
# Only the person who listed it can edit it
# =========================================================

@router.put(
    "/{equipment_id}",
    response_model=schemas.EquipmentOut
)
def update_equipment(
    equipment_id: int,
    equipment_in: schemas.EquipmentUpdate,

    db: Session = Depends(get_db),

    current_user: models.User = Depends(
        get_current_user
    ),
):

    item = (
        db.query(models.Equipment)
        .filter(
            models.Equipment.id == equipment_id
        )
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Equipment not found"
        )

    if item.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail=(
                "You do not own this equipment"
            )
        )

    update_data = equipment_in.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)

    return _to_out(item)


# =========================================================
# DELETE EQUIPMENT
# Only owner of listing can delete
# =========================================================

@router.delete(
    "/{equipment_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_equipment(
    equipment_id: int,

    db: Session = Depends(get_db),

    current_user: models.User = Depends(
        get_current_user
    ),
):

    item = (
        db.query(models.Equipment)
        .filter(
            models.Equipment.id == equipment_id
        )
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Equipment not found"
        )

    if item.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail=(
                "You do not own this equipment"
            )
        )

    db.delete(item)
    db.commit()

    return None