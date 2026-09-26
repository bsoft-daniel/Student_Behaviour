from backend.models.user import User, Role, Permission, RolePermission
from backend.models.base import db

class UserRepository:
    @staticmethod
    def get_by_id(user_id):
        return User.query.filter_by(id=user_id, is_deleted=False).first()

    @staticmethod
    def get_by_username(username):
        return User.query.filter_by(username=username, is_deleted=False).first()

    @staticmethod
    def get_by_email(email):
        return User.query.filter_by(email=email, is_deleted=False).first()

    @staticmethod
    def get_all(role_id=None, search=None, page=1, page_size=20):
        query = User.query.filter_by(is_deleted=False)
        if role_id:
            query = query.filter_by(role_id=role_id)
        if search:
            term = f"%{search}%"
            query = query.filter(
                (User.username.ilike(term)) |
                (User.first_name.ilike(term)) |
                (User.last_name.ilike(term)) |
                (User.email.ilike(term))
            )
        total = query.count()
        items = query.order_by(User.id.desc()).offset((page - 1) * page_size).limit(page_size).all()
        return items, total

    @staticmethod
    def create(user_data):
        user = User(**user_data)
        db.session.add(user)
        db.session.commit()
        return user

    @staticmethod
    def update(user, update_data):
        for key, val in update_data.items():
            if hasattr(user, key):
                setattr(user, key, val)
        db.session.commit()
        return user

    @staticmethod
    def soft_delete(user):
        user.is_deleted = True
        user.is_active = False
        db.session.commit()
        return user
