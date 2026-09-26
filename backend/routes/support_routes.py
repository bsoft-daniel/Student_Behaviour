from flask import Blueprint, request, g
from backend.services.support_service import SupportService
from backend.middleware.auth_middleware import token_required
from backend.utils.response_utils import success_response, error_response

support_bp = Blueprint('support_bp', __name__)

@support_bp.route('/tickets', methods=['GET'])
@token_required
def get_tickets():
    return success_response(SupportService.get_tickets(g.current_user))

@support_bp.route('/tickets', methods=['POST'])
@token_required
def create_ticket():
    data = request.get_json() or {}
    ticket = SupportService.create_ticket(data, g.current_user.id)
    return success_response(ticket, message="Support request created", status_code=201)

@support_bp.route('/tickets/<int:ticket_id>/reply', methods=['POST'])
@token_required
def reply_ticket(ticket_id):
    data = request.get_json() or {}
    reply = SupportService.reply_ticket(ticket_id, data, g.current_user.id)
    return success_response(reply, message="Reply posted")

@support_bp.route('/tickets/<int:ticket_id>/status', methods=['PUT'])
@token_required
def update_status(ticket_id):
    data = request.get_json() or {}
    status = data.get('status', 'Resolved')
    ticket, err = SupportService.update_status(ticket_id, status, g.current_user.id)
    if err:
        return error_response(err, status_code=400)
    return success_response(ticket, message=f"Ticket marked as {status}")
