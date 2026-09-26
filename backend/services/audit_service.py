from backend.repositories.audit_repository import AuditRepository

class AuditService:
    @staticmethod
    def get_logs(module=None, action=None, search=None, page=1, page_size=20):
        items, total = AuditRepository.get_logs(module=module, action=action, search=search, page=page, page_size=page_size)
        return [l.to_dict() for l in items], total
