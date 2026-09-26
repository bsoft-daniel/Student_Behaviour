import datetime
from backend.repositories.user_repository import UserRepository
from backend.repositories.audit_repository import AuditRepository
from backend.utils.security_utils import verify_password, hash_password, generate_jwt_token

class AuthService:
    @staticmethod
    def login(username, password, ip_address=None, user_agent=None):
        if not username or not password:
            return None, "Username and password are required"

        user = UserRepository.get_by_username(username) or UserRepository.get_by_email(username)
        if not user or not user.is_active or user.is_deleted:
            return None, "Invalid username or password"

        if not verify_password(password, user.password_hash):
            return None, "Invalid username or password"

        # Update last login
        UserRepository.update(user, {'last_login_at': datetime.datetime.utcnow()})

        # Generate JWT Token
        role_name = user.role.role_name if user.role else 'User'
        permissions = user.get_permissions()
        token = generate_jwt_token(user.id, user.username, role_name, permissions)

        # Audit log
        AuditRepository.log_activity(
            user_id=user.id,
            action='LOGIN',
            module='AUTH',
            entity_name='users',
            entity_id=user.id,
            description=f"User {user.username} logged in successfully",
            ip_address=ip_address,
            user_agent=user_agent
        )

        return {
            'token': token,
            'user': user.to_dict()
        }, None
