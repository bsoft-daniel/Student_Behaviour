from backend.repositories.support_repository import SupportRepository
from backend.repositories.audit_repository import AuditRepository

class SupportService:
    @staticmethod
    def get_tickets(user):
        role = (user.role.role_name if user.role else '').lower()
        if role in ['admin', 'administrator', 'principal']:
            tickets = SupportRepository.get_all()
        else:
            tickets = SupportRepository.get_all(user_id=user.id)
        return [t.to_dict() for t in tickets]

    @staticmethod
    def create_ticket(data, user_id):
        payload = {
            'user_id': user_id,
            'subject': data['subject'],
            'category': data.get('category', 'General Inquiry'),
            'priority': data.get('priority', 'Normal'),
            'message': data['message'],
            'created_by': user_id
        }
        ticket = SupportRepository.create_ticket(payload)
        return ticket.to_dict()

    @staticmethod
    def reply_ticket(ticket_id, data, user_id):
        payload = {
            'ticket_id': ticket_id,
            'user_id': user_id,
            'message': data['message'],
            'created_by': user_id
        }
        reply = SupportRepository.add_reply(payload)
        return reply.to_dict()

    @staticmethod
    def update_status(ticket_id, status, user_id):
        ticket = SupportRepository.get_by_id(ticket_id)
        if not ticket:
            return None, "Ticket not found"
        SupportRepository.update_status(ticket, status)
        return ticket.to_dict(), None

class AuditService:
    @staticmethod
    def get_logs(module=None, action=None, search=None, page=1, page_size=20):
        items, total = AuditRepository.get_logs(module=module, action=action, search=search, page=page, page_size=page_size)
        return [l.to_dict() for l in items], total
