"""
Authentication routes:
- Register
- Email OTP verification
- Resend OTP
- Login
- OAuth2 token
- Current user
- Profile update
- Password change
"""

import random
import re
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user
from app.email_service import send_verification_email


router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)


# ---------------------------------------------------------
# AUTH HELPERS
# ---------------------------------------------------------

from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
    validate_password,
)


# ---------------------------------------------------------
# HELPER: Generate 6-digit OTP
# ---------------------------------------------------------

def generate_otp() -> str:

    return str(
        random.randint(
            100000,
            999999
        )
    )


# ---------------------------------------------------------
# REGISTER
# ---------------------------------------------------------

@router.post(
    "/register",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
)
def register(
    user_in: schemas.UserRegister,
    db: Session = Depends(get_db),
):

    # -----------------------------------------------------
    # Only Gmail addresses
    # -----------------------------------------------------

    email = (
        str(user_in.email)
        .lower()
        .strip()
    )

    if not email.endswith("@gmail.com"):

        raise HTTPException(
            status_code=400,
            detail=(
                "Please use a valid Gmail address "
                "ending with @gmail.com"
            ),
        )


    # -----------------------------------------------------
    # Check duplicate email
    # -----------------------------------------------------

    existing = (
        db.query(models.User)
        .filter(
            models.User.email == email
        )
        .first()
    )

    if existing:

        raise HTTPException(
            status_code=400,
            detail=(
                "This Gmail address is already registered."
            ),
        )


    # -----------------------------------------------------
    # Validate password
    # -----------------------------------------------------

    valid, message = validate_password(
        user_in.password
    )

    if not valid:

        raise HTTPException(
            status_code=400,
            detail=message,
        )


    # -----------------------------------------------------
    # Generate OTP
    # -----------------------------------------------------

    otp = generate_otp()


    # -----------------------------------------------------
    # OTP valid for 10 minutes
    # -----------------------------------------------------

    otp_expiry = (
        datetime.utcnow()
        + timedelta(minutes=10)
    )


    # -----------------------------------------------------
    # Create user
    #
    # IMPORTANT:
    # There is NO role here.
    # Every registered user can:
    # - List equipment
    # - Rent equipment
    # -----------------------------------------------------

    user = models.User(
        name=user_in.name.strip(),
        email=email,
        phone=user_in.phone.strip(),
        password_hash=hash_password(
            user_in.password
        ),
        is_email_verified=False,
        verification_code=otp,
        verification_expires_at=otp_expiry,
    )


    db.add(user)

    db.commit()

    db.refresh(user)


    # -----------------------------------------------------
    # Send OTP email
    # -----------------------------------------------------

    try:

        send_verification_email(
            email,
            otp
        )

    except Exception as e:

        print(
            "EMAIL ERROR:",
            repr(e)
        )

        # Remove user if email could not be sent
        db.delete(user)

        db.commit()

        raise HTTPException(
            status_code=500,
            detail=f"Email error: {str(e)}",
        )


    return {
        "message": (
            "Registration successful. "
            "Please check your Gmail "
            "for the verification OTP."
        ),
        "email": email,
    }


# ---------------------------------------------------------
# VERIFY EMAIL
# ---------------------------------------------------------

@router.post(
    "/verify-email"
)
def verify_email(
    verification: schemas.VerifyOTP,
    db: Session = Depends(get_db),
):

    email = (
        str(verification.email)
        .lower()
        .strip()
    )


    user = (
        db.query(models.User)
        .filter(
            models.User.email == email
        )
        .first()
    )


    if not user:

        raise HTTPException(
            status_code=404,
            detail="Account not found.",
        )


    if user.is_email_verified:

        raise HTTPException(
            status_code=400,
            detail="Email is already verified.",
        )


    if not user.verification_code:

        raise HTTPException(
            status_code=400,
            detail=(
                "No verification OTP found. "
                "Please request a new OTP."
            ),
        )


    if user.verification_expires_at is None:

        raise HTTPException(
            status_code=400,
            detail=(
                "Verification OTP has expired. "
                "Please request a new OTP."
            ),
        )


    if (
        datetime.utcnow()
        > user.verification_expires_at
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Verification OTP has expired. "
                "Please request a new OTP."
            ),
        )


    if (
        verification.otp.strip()
        != user.verification_code
    ):

        raise HTTPException(
            status_code=400,
            detail="Invalid OTP.",
        )


    # -----------------------------------------------------
    # Verify email
    # -----------------------------------------------------

    user.is_email_verified = True

    user.verification_code = None

    user.verification_expires_at = None


    db.commit()

    db.refresh(user)


    # -----------------------------------------------------
    # Create login token
    # -----------------------------------------------------

    token = create_access_token({
        "sub": str(user.id)
    })


    return {
        "message": (
            "Email verified successfully."
        ),
        "access_token": token,
        "token_type": "bearer",
        "user": user,
    }


# ---------------------------------------------------------
# RESEND OTP
# ---------------------------------------------------------

@router.post(
    "/resend-otp"
)
def resend_otp(
    verification: schemas.ResendOTP,
    db: Session = Depends(get_db),
):

    email = (
        str(verification.email)
        .lower()
        .strip()
    )


    user = (
        db.query(models.User)
        .filter(
            models.User.email == email
        )
        .first()
    )


    if not user:

        raise HTTPException(
            status_code=404,
            detail="Account not found.",
        )


    if user.is_email_verified:

        raise HTTPException(
            status_code=400,
            detail="Email is already verified.",
        )


    new_otp = generate_otp()


    user.verification_code = new_otp

    user.verification_expires_at = (
        datetime.utcnow()
        + timedelta(minutes=10)
    )


    db.commit()


    try:

        send_verification_email(
            email,
            new_otp
        )

    except Exception as e:

        print(
            "RESEND OTP EMAIL ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to send verification email."
            )
        )


    return {
        "message": (
            "A new verification OTP "
            "has been sent to your Gmail."
        )
    }


# ---------------------------------------------------------
# LOGIN
# ---------------------------------------------------------

@router.post(
    "/login",
    response_model=schemas.Token
)
def login(
    credentials: schemas.UserLogin,
    db: Session = Depends(get_db),
):

    email = (
        str(credentials.email)
        .lower()
        .strip()
    )


    user = (
        db.query(models.User)
        .filter(
            models.User.email == email
        )
        .first()
    )


    if (
        not user
        or not verify_password(
            credentials.password,
            user.password_hash
        )
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )


    # -----------------------------------------------------
    # Gmail must be verified
    # -----------------------------------------------------

    if not user.is_email_verified:

        raise HTTPException(
            status_code=403,
            detail=(
                "Please verify your Gmail address "
                "before logging in."
            ),
        )


    token = create_access_token({
        "sub": str(user.id)
    })


    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
    }


# ---------------------------------------------------------
# SWAGGER / OAUTH2 TOKEN
# ---------------------------------------------------------

@router.post(
    "/token",
    response_model=schemas.Token
)
def token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):

    email = (
        form_data.username
        .lower()
        .strip()
    )


    user = (
        db.query(models.User)
        .filter(
            models.User.email == email
        )
        .first()
    )


    if (
        not user
        or not verify_password(
            form_data.password,
            user.password_hash
        )
    ):

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )


    if not user.is_email_verified:

        raise HTTPException(
            status_code=403,
            detail=(
                "Please verify your Gmail address "
                "before logging in."
            ),
        )


    access_token = create_access_token({
        "sub": str(user.id)
    })


    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


# ---------------------------------------------------------
# CURRENT USER
# ---------------------------------------------------------

@router.get(
    "/me",
    response_model=schemas.UserOut
)
def get_me(
    current_user: models.User = Depends(
        get_current_user
    ),
):

    return current_user


# ---------------------------------------------------------
# UPDATE PROFILE
# ---------------------------------------------------------

@router.put(
    "/profile",
    response_model=schemas.UserOut
)
def update_profile(
    user_in: schemas.UserUpdate,

    db: Session = Depends(get_db),

    current_user: models.User = Depends(
        get_current_user
    ),
):

    if user_in.name is not None:

        if not user_in.name.strip():

            raise HTTPException(
                status_code=400,
                detail="Name cannot be empty.",
            )

        current_user.name = (
            user_in.name.strip()
        )


    if user_in.phone is not None:

        if not user_in.phone.strip():

            raise HTTPException(
                status_code=400,
                detail="Phone number cannot be empty.",
            )

        current_user.phone = (
            user_in.phone.strip()
        )


    db.commit()

    db.refresh(current_user)


    return current_user


# ---------------------------------------------------------
# CHANGE PASSWORD
# ---------------------------------------------------------

@router.put(
    "/change-password"
)
def change_password(
    password_data: schemas.PasswordChange,

    db: Session = Depends(get_db),

    current_user: models.User = Depends(
        get_current_user
    ),
):

    # -----------------------------------------------------
    # Check current password
    # -----------------------------------------------------

    if not verify_password(
        password_data.current_password,
        current_user.password_hash
    ):

        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect.",
        )


    # -----------------------------------------------------
    # Check new password confirmation
    # -----------------------------------------------------

    if (
        password_data.new_password
        != password_data.confirm_password
    ):

        raise HTTPException(
            status_code=400,
            detail="New passwords do not match.",
        )


    # -----------------------------------------------------
    # Validate new password
    # -----------------------------------------------------

    valid, message = validate_password(
        password_data.new_password
    )


    if not valid:

        raise HTTPException(
            status_code=400,
            detail=message,
        )


    # -----------------------------------------------------
    # Prevent same password
    # -----------------------------------------------------

    if verify_password(
        password_data.new_password,
        current_user.password_hash
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "New password must be different "
                "from your current password."
            ),
        )


    current_user.password_hash = (
        hash_password(
            password_data.new_password
        )
    )


    db.commit()


    return {
        "message": (
            "Password changed successfully."
        )
    }