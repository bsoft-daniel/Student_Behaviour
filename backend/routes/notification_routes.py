from flask import Blueprint, request, g
from backend.services.notification_service import NotificationService
from backend.middleware.auth_middleware import token_required
from backend.utils.response_utils import success_response

notification_bp = Blueprint('notification_bp', __name__)

@notification_bp.route('', methods=['GET'])
@token_required
def get_notifications():
    unread = request.args.get('unread_only', default=False, type=lambda v: v.lower() == 'true')
    return success_response(NotificationService.get_user_notifications(g.current_user.id, unread_only=unread))

@notification_bp.route('/<int:notification_id>/read', methods=['PUT'])
@token_required
def mark_read(notification_id):
    return success_response(NotificationService.mark_read(notification_id, g.current_user.id))

@notification_bp.route('/read-all', methods=['PUT'])
@token_required
def mark_all_read():
    NotificationService.mark_all_read(g.current_user.id)
    return success_response(message="All notifications marked as read")
