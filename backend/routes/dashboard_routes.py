from flask import Blueprint, g
from backend.services.dashboard_service import DashboardService
from backend.middleware.auth_middleware import token_required, role_required
from backend.utils.response_utils import success_response

dashboard_bp = Blueprint('dashboard_bp', __name__)

@dashboard_bp.route('/admin', methods=['GET'])
@token_required
@role_required('admin', 'administrator')
def get_admin_dashboard():
    return success_response(DashboardService.get_admin_dashboard())

@dashboard_bp.route('/teacher', methods=['GET'])
@token_required
@role_required('teacher', 'staff', 'admin')
def get_teacher_dashboard():
    return success_response(DashboardService.get_teacher_dashboard(g.current_user))

@dashboard_bp.route('/principal', methods=['GET'])
@token_required
@role_required('principal', 'management', 'admin')
def get_principal_dashboard():
    return success_response(DashboardService.get_principal_dashboard())

@dashboard_bp.route('/student', methods=['GET'])
@token_required
def get_student_dashboard():
    return success_response(DashboardService.get_student_dashboard(g.current_user))

@dashboard_bp.route('/parent', methods=['GET'])
@token_required
def get_parent_dashboard():
    return success_response(DashboardService.get_parent_dashboard(g.current_user))
