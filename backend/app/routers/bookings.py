"""
Booking routes:

- Create rental request
- View my rentals
- View rental requests for my equipment
- Approve rental
- Reject rental
- Cancel rental

Every registered user can:
- Rent equipment from another user
- List their own equipment
- Receive rental requests
- Approve/reject requests
- Cancel pending or approved bookings

A user cannot rent their own equipment.
Approved bookings cannot overlap for the same equipment.
"""

from typing import List

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user


router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"]
)


# =========================================================
# OUTPUT HELPER
# =========================================================

def _to_out(
    booking: models.Booking
) -> schemas.BookingOut:

    out = schemas.BookingOut.model_validate(
        booking
    )

    out.equipment_name = (
        booking.equipment.name
        if booking.equipment
        else None
    )

    out.farmer_name = (
        booking.farmer.name
        if booking.farmer
        else None
    )

    return out


# =========================================================
# CREATE RENTAL REQUEST
# =========================================================

@router.post(
    "",
    response_model=schemas.BookingOut,
    status_code=status.HTTP_201_CREATED
)
def create_booking(
    booking_in: schemas.BookingCreate,

    db: Session = Depends(get_db),

    current_user: models.User = Depends(
        get_current_user
    ),
):

    # -----------------------------------------------------
    # FIND EQUIPMENT
    # -----------------------------------------------------

    equipment = (
        db.query(models.Equipment)
        .filter(
            models.Equipment.id
            == booking_in.equipment_id
        )
        .first()
    )

    if not equipment:
        raise HTTPException(
            status_code=404,
            detail="Equipment not found"
        )

    # -----------------------------------------------------
    # USER CANNOT RENT OWN EQUIPMENT
    # -----------------------------------------------------

    if equipment.owner_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot rent your own equipment."
        )

    # -----------------------------------------------------
    # CHECK MANUAL AVAILABILITY
    # -----------------------------------------------------

    if not equipment.available:
        raise HTTPException(
            status_code=400,
            detail="Equipment is not available."
        )

    # -----------------------------------------------------
    # CHECK DATES
    # -----------------------------------------------------

    if (
        booking_in.end_date
        <= booking_in.start_date
    ):
        raise HTTPException(
            status_code=400,
            detail="End date must be after start date."
        )

    # -----------------------------------------------------
    # CHECK APPROVED BOOKING OVERLAP
    #
    # Example:
    #
    # Existing:
    # Oct 1 - Oct 5
    #
    # New:
    # Oct 3 - Oct 7
    #
    # Result:
    # ❌ Not allowed
    # -----------------------------------------------------

    overlapping_booking = (
        db.query(models.Booking)
        .filter(
            models.Booking.equipment_id
            == equipment.id,

            models.Booking.status
            == models.StatusEnum.Approved,

            models.Booking.start_date
            < booking_in.end_date,

            models.Booking.end_date
            > booking_in.start_date,
        )
        .first()
    )

    if overlapping_booking:
        raise HTTPException(
            status_code=400,
            detail=(
                "This equipment is already booked "
                "for the selected dates."
            )
        )

    # -----------------------------------------------------
    # CALCULATE RENTAL DAYS
    # -----------------------------------------------------

    days = (
        booking_in.end_date
        - booking_in.start_date
    ).days or 1

    total_price = (
        days * equipment.price_per_day
    )

    # -----------------------------------------------------
    # CREATE BOOKING
    # -----------------------------------------------------

    booking = models.Booking(
        equipment_id=equipment.id,

        # This represents the user renting
        # the equipment.
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


# =========================================================
# MY RENTAL REQUESTS
# =========================================================

@router.get(
    "/my",
    response_model=List[schemas.BookingOut]
)
def my_bookings(
    db: Session = Depends(get_db),

    current_user: models.User = Depends(
        get_current_user
    ),
):

    bookings = (
        db.query(models.Booking)
        .filter(
            models.Booking.farmer_id
            == current_user.id
        )
        .order_by(
            models.Booking.created_at.desc()
        )
        .all()
    )

    return [
        _to_out(booking)
        for booking in bookings
    ]


# =========================================================
# REQUESTS RECEIVED FOR MY EQUIPMENT
# =========================================================

@router.get(
    "/owner",
    response_model=List[schemas.BookingOut]
)
def owner_bookings(
    db: Session = Depends(get_db),

    current_user: models.User = Depends(
        get_current_user
    ),
):

    bookings = (
        db.query(models.Booking)
        .filter(
            models.Booking.owner_id
            == current_user.id
        )
        .order_by(
            models.Booking.created_at.desc()
        )
        .all()
    )

    return [
        _to_out(booking)
        for booking in bookings
    ]


# =========================================================
# GET BOOKING OWNED BY CURRENT USER
#
# Used for APPROVE and REJECT.
# Only the equipment owner can approve/reject.
# =========================================================

def _get_owned_booking(
    booking_id: int,
    db: Session,
    current_user: models.User
):

    booking = (
        db.query(models.Booking)
        .filter(
            models.Booking.id == booking_id
        )
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    if booking.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You cannot modify this booking."
        )

    return booking


# =========================================================
# APPROVE RENTAL REQUEST
# =========================================================

@router.put(
    "/{booking_id}/approve",
    response_model=schemas.BookingOut
)
def approve_booking(
    booking_id: int,

    db: Session = Depends(get_db),

    current_user: models.User = Depends(
        get_current_user
    ),
):

    booking = _get_owned_booking(
        booking_id,
        db,
        current_user
    )

    # -----------------------------------------------------
    # ONLY PENDING REQUESTS CAN BE APPROVED
    # -----------------------------------------------------

    if booking.status != models.StatusEnum.Pending:
        raise HTTPException(
            status_code=400,
            detail=(
                "Only pending requests "
                "can be approved."
            )
        )

    # -----------------------------------------------------
    # CHECK FOR OVERLAPPING APPROVED BOOKING
    #
    # This check is necessary even though we checked
    # during request creation.
    #
    # Example:
    #
    # User A requests Oct 1-5
    # User B requests Oct 2-4
    #
    # Both are initially Pending.
    #
    # Owner approves A.
    # A becomes Approved.
    #
    # Owner then tries to approve B.
    #
    # B must be rejected because the dates overlap.
    # -----------------------------------------------------

    overlapping_booking = (
        db.query(models.Booking)
        .filter(
            models.Booking.equipment_id
            == booking.equipment_id,

            # Don't compare the booking with itself.
            models.Booking.id != booking.id,

            models.Booking.status
            == models.StatusEnum.Approved,

            models.Booking.start_date
            < booking.end_date,

            models.Booking.end_date
            > booking.start_date,
        )
        .first()
    )

    if overlapping_booking:
        raise HTTPException(
            status_code=400,
            detail=(
                "This equipment is already booked "
                "for these dates. "
                "This request cannot be approved."
            )
        )

    # -----------------------------------------------------
    # APPROVE
    # -----------------------------------------------------

    booking.status = models.StatusEnum.Approved

    db.commit()

    db.refresh(booking)

    return _to_out(booking)


# =========================================================
# REJECT RENTAL REQUEST
# =========================================================

@router.put(
    "/{booking_id}/reject",
    response_model=schemas.BookingOut
)
def reject_booking(
    booking_id: int,

    db: Session = Depends(get_db),

    current_user: models.User = Depends(
        get_current_user
    ),
):

    booking = _get_owned_booking(
        booking_id,
        db,
        current_user
    )

    # -----------------------------------------------------
    # ONLY PENDING REQUESTS CAN BE REJECTED
    # -----------------------------------------------------

    if booking.status != models.StatusEnum.Pending:
        raise HTTPException(
            status_code=400,
            detail=(
                "Only pending requests "
                "can be rejected."
            )
        )

    # -----------------------------------------------------
    # REJECT
    # -----------------------------------------------------

    booking.status = models.StatusEnum.Rejected

    db.commit()

    db.refresh(booking)

    return _to_out(booking)


# =========================================================
# CANCEL BOOKING
# =========================================================
#
# BOTH SIDES CAN CANCEL:
#
# 1. Person who requested equipment
# 2. Owner of equipment
#
# Can cancel:
# - Pending
# - Approved
#
# Cannot cancel:
# - Rejected
# - Already Cancelled
# =========================================================

@router.put(
    "/{booking_id}/cancel",
    response_model=schemas.BookingOut
)
def cancel_booking(
    booking_id: int,

    db: Session = Depends(get_db),

    current_user: models.User = Depends(
        get_current_user
    ),
):

    # -----------------------------------------------------
    # FIND BOOKING
    # -----------------------------------------------------

    booking = (
        db.query(models.Booking)
        .filter(
            models.Booking.id == booking_id
        )
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    # -----------------------------------------------------
    # CHECK USER PERMISSION
    #
    # User can cancel if they are:
    #
    # - The person who requested the equipment
    # OR
    # - The owner of the equipment
    # -----------------------------------------------------

    is_requester = (
        booking.farmer_id
        == current_user.id
    )

    is_owner = (
        booking.owner_id
        == current_user.id
    )

    if not is_requester and not is_owner:
        raise HTTPException(
            status_code=403,
            detail=(
                "You cannot cancel this booking."
            )
        )

    # -----------------------------------------------------
    # CHECK CURRENT STATUS
    # -----------------------------------------------------

    if booking.status not in [
        models.StatusEnum.Pending,
        models.StatusEnum.Approved,
    ]:
        raise HTTPException(
            status_code=400,
            detail=(
                "This booking cannot be cancelled "
                "because it is already "
                f"{booking.status.value}."
            )
        )

    # -----------------------------------------------------
    # CANCEL
    # -----------------------------------------------------

    booking.status = (
        models.StatusEnum.Cancelled
    )

    db.commit()

    db.refresh(booking)

    return _to_out(booking)