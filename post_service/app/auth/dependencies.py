from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from post_service.app.config import SECRET_KEY, ALGORITHM, USER_SERVICE_AUTH_TOKEN_URL

# В Swagger post_service появится форма username/password.
# Сам пароль уйдет в user_service, а post_service получит только Bearer token.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=USER_SERVICE_AUTH_TOKEN_URL)


def decode_access_token(token: str) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise credentials_exception

    # post_service принимает только access token; refresh token здесь недопустим.
    if payload.get("token_type") != "access":
        raise credentials_exception

    return payload


def get_current_user_id(token: str = Depends(oauth2_scheme)) -> int:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)

    # Роль приходит из JWT, который выпустил user_service.
    role = payload.get("role")

    if role not in ("user", "admin"):
        raise credentials_exception
    
    try:
        user_id = int(payload.get("sub"))
    except (TypeError, ValueError):
        raise credentials_exception

    return user_id


def get_current_admin(token: str = Depends(oauth2_scheme)) -> str:
    payload = decode_access_token(token)

    # Admin-only ручки разрешены только токенам с role=admin.
    role = payload.get("role")

    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    return role


def get_current_user_context(token: str = Depends(oauth2_scheme)) -> tuple[int, str]:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)

    # Возвращаем и user_id, и role, чтобы роут мог отличить owner от admin.
    role = payload.get("role")
    
    if role not in ("user", "admin"):
        raise credentials_exception
    
    try:
        user_id = int(payload.get("sub"))
    except (TypeError, ValueError):
        raise credentials_exception
    return user_id, role
