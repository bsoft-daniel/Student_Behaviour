from flask import Blueprint, request
from backend.services.audit_service import AuditService
from backend.middleware.auth_middleware import token_required, role_required
from backend.utils.response_utils import paginated_response

audit_bp = Blueprint('audit_bp', __name__)

@audit_bp.route('/logs', methods=['GET'])
@token_required
@role_required('admin', 'administrator', 'principal')
def get_logs():
    module = request.args.get('module')
    action = request.args.get('action')
    search = request.args.get('search')
    page = request.args.get('page', default=1, type=int)
    page_size = request.args.get('page_size', default=20, type=int)

    items, total = AuditService.get_logs(module=module, action=action, search=search, page=page, page_size=page_size)
    return paginated_response(items, total, page, page_size)
