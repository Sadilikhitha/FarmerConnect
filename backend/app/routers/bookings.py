"""
Booking routes: create rental request, list mine, list received, approve/reject.
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user, require_farmer, require_owner

router = APIRouter(prefix="/bookings", tags=["Bookings"])


def _to_out(booking: models.Booking) -> schemas.BookingOut:
    out = schemas.BookingOut.model_validate(booking)
    out.equipment_name = booking.equipment.name if booking.equipment else None
    out.farmer_name = booking.farmer.name if booking.farmer else None
    return out


@router.post("", response_model=schemas.BookingOut, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_in: schemas.BookingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_farmer),
):
    equipment = (
        db.query(models.Equipment)
        .filter(models.Equipment.id == booking_in.equipment_id)
        .first()
    )
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")

    if not equipment.available:
        raise HTTPException(status_code=400, detail="Equipment is not available")

    if booking_in.end_date <= booking_in.start_date:
        raise HTTPException(
            status_code=400, detail="End date must be after start date"
        )

    days = (booking_in.end_date - booking_in.start_date).days or 1
    total_price = days * equipment.price_per_day

    booking = models.Booking(
        equipment_id=equipment.id,
        farmer_id=current_user.id,
        owner_id=equipment.owner_id,
        start_date=booking_in.start_date,
        end_date=booking_in.end_date,
        total_price=total_price,
        status=models.StatusEnum.Pending,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return _to_out(booking)


@router.get("/my", response_model=List[schemas.BookingOut])
def my_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_farmer),
):
    bookings = (
        db.query(models.Booking)
        .filter(models.Booking.farmer_id == current_user.id)
        .order_by(models.Booking.created_at.desc())
        .all()
    )
    return [_to_out(b) for b in bookings]


@router.get("/owner", response_model=List[schemas.BookingOut])
def owner_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_owner),
):
    bookings = (
        db.query(models.Booking)
        .filter(models.Booking.owner_id == current_user.id)
        .order_by(models.Booking.created_at.desc())
        .all()
    )
    return [_to_out(b) for b in bookings]


def _get_owned_booking(booking_id: int, db: Session, current_user: models.User) -> models.Booking:
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.owner_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="You cannot modify this booking"
        )
    return booking


@router.put("/{booking_id}/approve", response_model=schemas.BookingOut)
def approve_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_owner),
):
    booking = _get_owned_booking(booking_id, db, current_user)
    booking.status = models.StatusEnum.Approved
    db.commit()
    db.refresh(booking)
    return _to_out(booking)


@router.put("/{booking_id}/reject", response_model=schemas.BookingOut)
def reject_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_owner),
):
    booking = _get_owned_booking(booking_id, db, current_user)
    booking.status = models.StatusEnum.Rejected
    db.commit()
    db.refresh(booking)
    return _to_out(booking)
