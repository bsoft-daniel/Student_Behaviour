from backend.models.audit import AuditLog
from backend.models.base import db

class AuditRepository:
    @staticmethod
    def log_activity(user_id, action, module=None, entity_name=None, entity_id=None, description=None, details=None, ip_address=None, user_agent=None):
        log = AuditLog(
            user_id=user_id,
            action=action,
            module=module,
            entity_name=entity_name,
            entity_id=entity_id,
            description=description,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent
        )
        db.session.add(log)
        db.session.commit()
        return log

    @staticmethod
    def get_logs(module=None, action=None, search=None, page=1, page_size=20):
        query = AuditLog.query.filter_by(is_deleted=False)
        if module:
            query = query.filter_by(module=module)
        if action:
            query = query.filter(AuditLog.action.ilike(f"%{action}%"))
        if search:
            term = f"%{search}%"
            query = query.filter(
                (AuditLog.description.ilike(term)) |
                (AuditLog.details.ilike(term)) |
                (AuditLog.ip_address.ilike(term))
            )
        total = query.count()
        items = query.order_by(AuditLog.created_at.desc(), AuditLog.id.desc()).offset((page - 1) * page_size).limit(page_size).all()
        return items, total
