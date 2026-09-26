from backend.repositories.user_repository import UserRepository
from backend.repositories.audit_repository import AuditRepository
from backend.utils.security_utils import hash_password

class UserService:
    @staticmethod
    def get_users(role_id=None, search=None, page=1, page_size=20):
        items, total = UserRepository.get_all(role_id=role_id, search=search, page=page, page_size=page_size)
        return [u.to_dict() for u in items], total

    @staticmethod
    def get_user_by_id(user_id):
        user = UserRepository.get_by_id(user_id)
        return user.to_dict() if user else None

    @staticmethod
    def create_user(data, current_user_id=None):
        if UserRepository.get_by_username(data['username']):
            return None, "Username already exists"
        if UserRepository.get_by_email(data['email']):
            return None, "Email address already in use"

        payload = {
            'username': data['username'],
            'email': data['email'],
            'password_hash': hash_password(data.get('password', 'School@123')),
            'first_name': data['first_name'],
            'last_name': data.get('last_name'),
            'phone': data.get('phone'),
            'role_id': data['role_id'],
            'is_active': data.get('is_active', True),
            'created_by': current_user_id
        }
        user = UserRepository.create(payload)
        AuditRepository.log_activity(
            user_id=current_user_id,
            action='CREATE_USER',
            module='USERS',
            entity_name='users',
            entity_id=user.id,
            description=f"Created user account {user.username}"
        )
        return user.to_dict(), None

    @staticmethod
    def update_user(user_id, data, current_user_id=None):
        user = UserRepository.get_by_id(user_id)
        if not user:
            return None, "User not found"

        update_payload = {
            'email': data.get('email', user.email),
            'first_name': data.get('first_name', user.first_name),
            'last_name': data.get('last_name', user.last_name),
            'phone': data.get('phone', user.phone),
            'role_id': data.get('role_id', user.role_id),
            'is_active': data.get('is_active', user.is_active),
            'modified_by': current_user_id
        }
        if data.get('password'):
            update_payload['password_hash'] = hash_password(data['password'])

        updated = UserRepository.update(user, update_payload)
        AuditRepository.log_activity(
            user_id=current_user_id,
            action='UPDATE_USER',
            module='USERS',
            entity_name='users',
            entity_id=user.id,
            description=f"Updated user account {user.username}"
        )
        return updated.to_dict(), None

    @staticmethod
    def delete_user(user_id, current_user_id=None):
        user = UserRepository.get_by_id(user_id)
        if not user:
            return False, "User not found"
        UserRepository.soft_delete(user)
        AuditRepository.log_activity(
            user_id=current_user_id,
            action='DELETE_USER',
            module='USERS',
            entity_name='users',
            entity_id=user.id,
            description=f"Deactivated user account {user.username}"
        )
        return True, None
