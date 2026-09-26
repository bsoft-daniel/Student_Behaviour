from .base import BaseModel, db

class AuditLog(BaseModel):
    __tablename__ = 'audit_logs'

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    action = db.Column(db.String(100), nullable=False) # LOGIN, LOGOUT, CREATE_STUDENT, etc.
    module = db.Column(db.String(50), nullable=True) # AUTH, STUDENTS, BEHAVIOUR, etc.
    entity_name = db.Column(db.String(50), nullable=True)
    entity_id = db.Column(db.Integer, nullable=True)
    description = db.Column(db.Text, nullable=True)
    details = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    user_agent = db.Column(db.String(255), nullable=True)

    user = db.relationship('User')

    def to_dict(self):
        data = super().to_dict()
        if self.user:
            data['username'] = self.user.username
            data['user'] = {
                'id': self.user.id,
                'username': self.user.username,
                'first_name': self.user.first_name,
                'last_name': self.user.last_name
            }
        return data
