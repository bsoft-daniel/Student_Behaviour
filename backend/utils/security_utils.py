import jwt
import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask import current_app

DEFAULT_JWT_SECRET = 'st_martins_jwt_super_secret_key_2026_sec_matriculation_school'

def hash_password(password: str) -> str:
    return generate_password_hash(password, method='pbkdf2:sha256')

def verify_password(password: str, hashed_password: str) -> bool:
    if not password or not hashed_password:
        return False
    return check_password_hash(hashed_password, password)

def generate_jwt_token(user_id: int, username: str, role_name: str, permissions: list = None) -> str:
    secret = current_app.config.get('JWT_SECRET_KEY', DEFAULT_JWT_SECRET)
    now = datetime.datetime.now(datetime.timezone.utc)
    expires = now + current_app.config.get('JWT_ACCESS_TOKEN_EXPIRES', datetime.timedelta(days=7))
    
    payload = {
        'sub': str(user_id),
        'username': username,
        'role': role_name,
        'permissions': permissions or [],
        'exp': expires,
        'iat': now
    }
    return jwt.encode(payload, secret, algorithm='HS256')

def decode_jwt_token(token: str) -> dict:
    secret = current_app.config.get('JWT_SECRET_KEY', DEFAULT_JWT_SECRET)
    try:
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        return payload
    except Exception as e:
        return None
