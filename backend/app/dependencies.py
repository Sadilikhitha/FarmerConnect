"""
Reusable FastAPI dependencies: get current user, require a specific role.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.auth import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception

    return user


def require_owner(current_user: models.User = Depends(get_current_user)) -> models.User:
    if current_user.role != models.RoleEnum.owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only equipment owners can perform this action",
        )
    return current_user


def require_farmer(current_user: models.User = Depends(get_current_user)) -> models.User:
    if current_user.role != models.RoleEnum.farmer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only farmers can perform this action",
        )
    return current_user
