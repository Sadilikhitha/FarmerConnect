"""
Equipment routes: list, view, add, update, delete.
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
from app.dependencies import require_owner


router = APIRouter(
    prefix="/equipment",
    tags=["Equipment"],
)


# Allows the equipment API to work for both:
# - logged-in users
# - logged-out users
optional_oauth2 = OAuth2PasswordBearer(
    tokenUrl="/auth/token",
    auto_error=False,
)


def get_optional_user(
    token: Optional[str] = Depends(optional_oauth2),
    db: Session = Depends(get_db),
):
    """
    Return the logged-in user if a valid token is provided.
    Return None for logged-out users.
    """

    if not token:
        return None

    payload = decode_access_token(token)

    if not payload:
        return None

    user_id = payload.get("sub")

    if not user_id:
        return None

    return (
        db.query(models.User)
        .filter(models.User.id == int(user_id))
        .first()
    )


def _to_out(item: models.Equipment) -> schemas.EquipmentOut:
    """
    Full equipment response for authenticated users.
    Includes owner details and availability.
    """

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
    item: models.Equipment,
) -> schemas.EquipmentPublicOut:
    """
    Public equipment response.

    Does NOT expose:
    - owner name
    - owner phone
    - availability
    - owner ID
    """

    return schemas.EquipmentPublicOut.model_validate(item)


# ---------------------------------------------------------
# PUBLIC EQUIPMENT LIST
# ---------------------------------------------------------

@router.get(
    "",
    response_model=List[schemas.EquipmentPublicOut],
)
def list_equipment(
    search: Optional[str] = None,
    category: Optional[str] = None,
    location: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    Anyone can browse equipment.

    Only public equipment information is returned.
    """

    query = db.query(models.Equipment)

    if search:
        query = query.filter(
            models.Equipment.name.ilike(f"%{search}%")
        )

    if category:
        query = query.filter(
            models.Equipment.category.ilike(f"%{category}%")
        )

    if location:
        query = query.filter(
            models.Equipment.location.ilike(f"%{location}%")
        )

    items = (
        query
        .order_by(models.Equipment.created_at.desc())
        .all()
    )

    return [
        _to_public_out(item)
        for item in items
    ]


# ---------------------------------------------------------
# OWNER'S OWN EQUIPMENT
# ---------------------------------------------------------

@router.get(
    "/owner/mine",
    response_model=List[schemas.EquipmentOut],
)
def list_my_equipment(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_owner),
):
    """
    Logged-in owner can see their complete equipment details.
    """

    items = (
        db.query(models.Equipment)
        .filter(
            models.Equipment.owner_id == current_user.id
        )
        .order_by(models.Equipment.created_at.desc())
        .all()
    )

    return [
        _to_out(item)
        for item in items
    ]


# ---------------------------------------------------------
# SINGLE EQUIPMENT DETAILS
# ---------------------------------------------------------

@router.get("/{equipment_id}")
def get_equipment(
    equipment_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(
        get_optional_user
    ),
):
    """
    Logged-out users:
        Can see only public equipment information.

    Logged-in users:
        Can see complete equipment information,
        including owner details and availability.
    """

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
            detail="Equipment not found",
        )

    # Logged-in user
    if current_user:
        return _to_out(item)

    # Logged-out user
    return _to_public_out(item)


# ---------------------------------------------------------
# ADD EQUIPMENT
# ---------------------------------------------------------

@router.post(
    "",
    response_model=schemas.EquipmentOut,
    status_code=status.HTTP_201_CREATED,
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
    current_user: models.User = Depends(require_owner),
):
    # Allowed image types
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
                "Only JPG, JPEG, PNG, and WEBP "
                "images are allowed."
            ),
        )

    # Create uploads directory
    upload_dir = Path("uploads")
    upload_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    # Generate unique filename
    file_extension = Path(
        image.filename
    ).suffix.lower()

    filename = (
        f"equipment_{current_user.id}_"
        f"{os.urandom(8).hex()}"
        f"{file_extension}"
    )

    file_path = upload_dir / filename

    # Save image
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            image.file,
            buffer,
        )

    # Store image URL
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


# ---------------------------------------------------------
# UPDATE EQUIPMENT
# ---------------------------------------------------------

@router.put(
    "/{equipment_id}",
    response_model=schemas.EquipmentOut,
)
def update_equipment(
    equipment_id: int,
    equipment_in: schemas.EquipmentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_owner),
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
            detail="Equipment not found",
        )

    if item.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You do not own this equipment",
        )

    for field, value in equipment_in.model_dump(
        exclude_unset=True
    ).items():
        setattr(
            item,
            field,
            value,
        )

    db.commit()
    db.refresh(item)

    return _to_out(item)


# ---------------------------------------------------------
# DELETE EQUIPMENT
# ---------------------------------------------------------

@router.delete(
    "/{equipment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_equipment(
    equipment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_owner),
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
            detail="Equipment not found",
        )

    if item.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You do not own this equipment",
        )

    db.delete(item)
    db.commit()

    return None
