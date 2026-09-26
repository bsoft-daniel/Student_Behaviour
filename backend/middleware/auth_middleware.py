from functools import wraps
from flask import request, g
from backend.utils.security_utils import decode_jwt_token
from backend.utils.response_utils import error_response
from backend.models.user import User

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        if auth_header:
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == 'bearer':
                token = parts[1]

        if not token:
            return error_response('Authentication token is required', status_code=401)

        payload = decode_jwt_token(token)
        if not payload or 'sub' not in payload:
            return error_response('Invalid or expired authentication token', status_code=401)

        try:
            user_id = int(payload['sub'])
        except (ValueError, TypeError):
            return error_response('Invalid token subject', status_code=401)

        user = User.query.filter_by(id=user_id, is_deleted=False).first()
        if not user or not user.is_active:
            return error_response('User account is inactive or deleted', status_code=401)

        g.current_user = user
        g.token_payload = payload
        return f(*args, **kwargs)
    return decorated

def role_required(*allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not hasattr(g, 'current_user') or not g.current_user:
                return error_response('Unauthorized', status_code=401)
            
            user_role = g.current_user.role.role_name.lower() if g.current_user.role else ''
            allowed = [r.lower() for r in allowed_roles]

            if user_role not in allowed and 'admin' not in user_role and 'administrator' not in user_role:
                return error_response('Forbidden: insufficient role privileges', status_code=403)
            
            return f(*args, **kwargs)
        return decorated
    return decorator

def permission_required(permission_code):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not hasattr(g, 'current_user') or not g.current_user:
                return error_response('Unauthorized', status_code=401)

            user_role = g.current_user.role.role_name.lower() if g.current_user.role else ''
            if user_role in ['admin', 'administrator']:
                return f(*args, **kwargs) # Super admin bypass

            user_permissions = g.current_user.get_permissions()
            if permission_code not in user_permissions:
                return error_response(f'Forbidden: requires permission {permission_code}', status_code=403)

            return f(*args, **kwargs)
        return decorated
    return decorator
