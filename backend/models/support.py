from .base import BaseModel, db

class SupportTicket(BaseModel):
    __tablename__ = 'support_tickets'

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(50), default='General Inquiry', nullable=False)
    priority = db.Column(db.String(20), default='Normal', nullable=False)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(30), default='Open', nullable=False) # Open, In Progress, Resolved, Closed

    creator = db.relationship('User', foreign_keys=[user_id])
    replies = db.relationship('SupportReply', back_populates='ticket', cascade='all, delete-orphan')

    def to_dict(self):
        data = super().to_dict()
        if self.creator:
            data['creator'] = {
                'id': self.creator.id,
                'username': self.creator.username,
                'first_name': self.creator.first_name,
                'last_name': self.creator.last_name
            }
        data['replies'] = [r.to_dict() for r in self.replies if not r.is_deleted]
        return data

class SupportReply(BaseModel):
    __tablename__ = 'support_replies'

    ticket_id = db.Column(db.Integer, db.ForeignKey('support_tickets.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)

    ticket = db.relationship('SupportTicket', back_populates='replies')
    user = db.relationship('User')

    def to_dict(self):
        data = super().to_dict()
        if self.user:
            data['user'] = {
                'id': self.user.id,
                'username': self.user.username,
                'first_name': self.user.first_name,
                'last_name': self.user.last_name
            }
        return data
