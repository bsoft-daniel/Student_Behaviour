from backend.models.support import SupportTicket, SupportReply
from backend.models.base import db

class SupportRepository:
    @staticmethod
    def get_all(user_id=None):
        query = SupportTicket.query.filter_by(is_deleted=False)
        if user_id:
            query = query.filter_by(user_id=user_id)
        return query.order_by(SupportTicket.created_at.desc()).all()

    @staticmethod
    def get_by_id(ticket_id):
        return SupportTicket.query.filter_by(id=ticket_id, is_deleted=False).first()

    @staticmethod
    def create_ticket(data):
        ticket = SupportTicket(**data)
        db.session.add(ticket)
        db.session.commit()
        return ticket

    @staticmethod
    def add_reply(data):
        reply = SupportReply(**data)
        db.session.add(reply)
        db.session.commit()
        return reply

    @staticmethod
    def update_status(ticket, status):
        ticket.status = status
        db.session.commit()
        return ticket
