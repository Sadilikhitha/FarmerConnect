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

from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user, require_owner

router = APIRouter(prefix="/equipment", tags=["Equipment"])


def _to_out(item: models.Equipment) -> schemas.EquipmentOut:
    out = schemas.EquipmentOut.model_validate(item)
    out.owner_name = item.owner.name if item.owner else None
    out.owner_phone = item.owner.phone if item.owner else None
    return out


@router.get("", response_model=List[schemas.EquipmentOut])
def list_equipment(
    search: Optional[str] = None,
    category: Optional[str] = None,
    location: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Equipment)

    if search:
        query = query.filter(models.Equipment.name.ilike(f"%{search}%"))
    if category:
        query = query.filter(models.Equipment.category.ilike(f"%{category}%"))
    if location:
        query = query.filter(models.Equipment.location.ilike(f"%{location}%"))

    items = query.order_by(models.Equipment.created_at.desc()).all()
    return [_to_out(item) for item in items]


@router.get("/owner/mine", response_model=List[schemas.EquipmentOut])
def list_my_equipment(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_owner),
):
    items = (
        db.query(models.Equipment)
        .filter(models.Equipment.owner_id == current_user.id)
        .order_by(models.Equipment.created_at.desc())
        .all()
    )
    return [_to_out(item) for item in items]


@router.get("/{equipment_id}", response_model=schemas.EquipmentOut)
def get_equipment(equipment_id: int, db: Session = Depends(get_db)):
    item = db.query(models.Equipment).filter(models.Equipment.id == equipment_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return _to_out(item)


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
    # Check image type
    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/jpg",
    }

    if image.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, JPEG, PNG, and WEBP images are allowed.",
        )

    # Create uploads directory
    upload_dir = Path("uploads")
    upload_dir.mkdir(parents=True, exist_ok=True)

    # Generate unique filename
    file_extension = Path(image.filename).suffix.lower()

    filename = f"equipment_{current_user.id}_{os.urandom(8).hex()}{file_extension}"

    file_path = upload_dir / filename

    # Save image
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    # Store URL/path in database
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

@router.put("/{equipment_id}", response_model=schemas.EquipmentOut)
def update_equipment(
    equipment_id: int,
    equipment_in: schemas.EquipmentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_owner),
):
    item = db.query(models.Equipment).filter(models.Equipment.id == equipment_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Equipment not found")
    if item.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not own this equipment")

    for field, value in equipment_in.model_dump(exclude_unset=True).items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return _to_out(item)


@router.delete("/{equipment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_equipment(
    equipment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_owner),
):
    item = db.query(models.Equipment).filter(models.Equipment.id == equipment_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Equipment not found")
    if item.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not own this equipment")

    db.delete(item)
    db.commit()
    return None
