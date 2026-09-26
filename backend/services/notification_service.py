from backend.repositories.notification_repository import NotificationRepository

class NotificationService:
    @staticmethod
    def get_user_notifications(user_id, unread_only=False):
        items = NotificationRepository.get_user_notifications(user_id, unread_only)
        unread = len([n for n in items if not n.is_read])
        return {
            'notifications': [n.to_dict() for n in items],
            'unread_count': unread
        }

    @staticmethod
    def mark_read(notification_id, user_id):
        n = NotificationRepository.mark_read(notification_id, user_id)
        return n.to_dict() if n else None

    @staticmethod
    def mark_all_read(user_id):
        NotificationRepository.mark_all_read(user_id)
        return True
