from backend.models.notification import Notification
from backend.models.base import db

class NotificationRepository:
    @staticmethod
    def get_user_notifications(user_id, unread_only=False):
        query = Notification.query.filter_by(user_id=user_id, is_deleted=False)
        if unread_only:
            query = query.filter_by(is_read=False)
        return query.order_by(Notification.created_at.desc()).all()

    @staticmethod
    def mark_read(notification_id, user_id):
        n = Notification.query.filter_by(id=notification_id, user_id=user_id, is_deleted=False).first()
        if n:
            n.is_read = True
            db.session.commit()
        return n

    @staticmethod
    def mark_all_read(user_id):
        Notification.query.filter_by(user_id=user_id, is_read=False, is_deleted=False).update({'is_read': True})
        db.session.commit()

    @staticmethod
    def create(data):
        n = Notification(**data)
        db.session.add(n)
        db.session.commit()
        return n
