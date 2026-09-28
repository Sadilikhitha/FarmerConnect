"""
Reusable FastAPI authentication dependencies.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.auth import decode_access_token


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/token"
)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.User:

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={
            "WWW-Authenticate": "Bearer"
        },
    )

    # Decode JWT
    payload = decode_access_token(token)

    if payload is None:
        print("JWT ERROR: Token could not be decoded")
        raise credentials_exception

    print("JWT PAYLOAD:", payload)

    # Get user ID from JWT
    user_id = payload.get("sub")

    if user_id is None:
        print("JWT ERROR: 'sub' missing from token")
        raise credentials_exception

    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        print("JWT ERROR: Invalid user ID:", user_id)
        raise credentials_exception

    # Find user
    user = (
        db.query(models.User)
        .filter(models.User.id == user_id)
        .first()
    )

    if user is None:
        print(
            "JWT ERROR: User not found for ID:",
            user_id
        )
        raise credentials_exception

    print(
        "AUTHENTICATED USER:",
        user.id,
        user.email
    )

    return user