from .base import BaseModel, db

class Notification(BaseModel):
    __tablename__ = 'notifications'

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    notification_type = db.Column(db.String(50), default='info', nullable=False) # info, incident, attendance, reminder
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    reference_type = db.Column(db.String(50), nullable=True) # incident, attendance, announcement
    reference_id = db.Column(db.Integer, nullable=True)

    user = db.relationship('User')
