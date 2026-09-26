from .base import BaseModel, db

class Role(BaseModel):
    __tablename__ = 'roles'

    role_name = db.Column(db.String(50), unique=True, nullable=False)
    role_code = db.Column(db.String(20), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=True)

    users = db.relationship('User', back_populates='role', lazy='dynamic')
    role_permissions = db.relationship('RolePermission', back_populates='role', cascade='all, delete-orphan')

class Permission(BaseModel):
    __tablename__ = 'permissions'

    permission_name = db.Column(db.String(100), unique=True, nullable=False)
    permission_code = db.Column(db.String(50), unique=True, nullable=False)
    module = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(255), nullable=True)

    role_permissions = db.relationship('RolePermission', back_populates='permission', cascade='all, delete-orphan')

class RolePermission(BaseModel):
    __tablename__ = 'role_permissions'

    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False)
    permission_id = db.Column(db.Integer, db.ForeignKey('permissions.id'), nullable=False)

    role = db.relationship('Role', back_populates='role_permissions')
    permission = db.relationship('Permission', back_populates='role_permissions')

class User(BaseModel):
    __tablename__ = 'users'

    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False)
    last_login_at = db.Column(db.DateTime, nullable=True)

    role = db.relationship('Role', back_populates='users')
    student_profile = db.relationship('Student', back_populates='user', uselist=False)
    parent_profile = db.relationship('Parent', back_populates='user', uselist=False)
    teacher_classes = db.relationship('TeacherClass', back_populates='teacher', lazy='dynamic')

    def get_permissions(self):
        if not self.role:
            return []
        return [rp.permission.permission_code for rp in self.role.role_permissions if rp.permission and not rp.is_deleted]

    def to_dict(self, include_role=True):
        data = super().to_dict()
        data.pop('password_hash', None)
        if include_role and self.role:
            data['role_name'] = self.role.role_name
            data['role_code'] = self.role.role_code
            data['permissions'] = self.get_permissions()
        return data
