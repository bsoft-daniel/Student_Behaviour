import re

def validate_email(email: str) -> bool:
    if not email:
        return False
    regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return bool(re.match(regex, email))

def validate_password_strength(password: str) -> tuple[bool, str]:
    if not password or len(password) < 6:
        return False, "Password must be at least 6 characters long"
    return True, ""
