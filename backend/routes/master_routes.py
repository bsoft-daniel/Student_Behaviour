from flask import Blueprint, request
from backend.services.master_service import MasterService
from backend.middleware.auth_middleware import token_required, role_required
from backend.utils.response_utils import success_response, error_response

master_bp = Blueprint('master_bp', __name__)

@master_bp.route('/academic-years', methods=['GET'])
def get_academic_years():
    return success_response(MasterService.get_academic_years())

@master_bp.route('/academic-years', methods=['POST'])
@token_required
@role_required('admin', 'administrator')
def create_academic_year():
    data = request.get_json() or {}
    year = MasterService.create_academic_year(data)
    return success_response(year, message="Academic year created", status_code=201)

@master_bp.route('/classes', methods=['GET'])
def get_classes():
    return success_response(MasterService.get_classes())

@master_bp.route('/classes', methods=['POST'])
@token_required
@role_required('admin', 'administrator')
def create_class():
    data = request.get_json() or {}
    cls = MasterService.create_class(data)
    return success_response(cls, message="Class created", status_code=201)

@master_bp.route('/sections', methods=['GET'])
def get_sections():
    class_id = request.args.get('class_id', type=int)
    return success_response(MasterService.get_sections(class_id))

@master_bp.route('/behaviour-categories', methods=['GET'])
def get_behaviour_categories():
    return success_response(MasterService.get_behaviour_categories())

@master_bp.route('/behaviour-categories', methods=['POST'])
@token_required
@role_required('admin', 'administrator')
def create_behaviour_category():
    data = request.get_json() or {}
    cat = MasterService.create_category(data)
    return success_response(cat, message="Category created", status_code=201)

@master_bp.route('/behaviour-types', methods=['GET'])
def get_behaviour_types():
    category_id = request.args.get('category_id', type=int)
    return success_response(MasterService.get_behaviour_types(category_id))

@master_bp.route('/severity-levels', methods=['GET'])
def get_severity_levels():
    return success_response(MasterService.get_severity_levels())

@master_bp.route('/severity-levels', methods=['POST'])
@token_required
@role_required('admin', 'administrator')
def create_severity_level():
    data = request.get_json() or {}
    sev = MasterService.create_severity_level(data)
    return success_response(sev, message="Severity level created", status_code=201)

@master_bp.route('/attendance-types', methods=['GET'])
def get_attendance_types():
    return success_response(MasterService.get_attendance_types())

@master_bp.route('/roles', methods=['GET'])
def get_roles():
    return success_response(MasterService.get_roles())

@master_bp.route('/roles/<int:role_id>/permissions', methods=['PUT'])
@token_required
@role_required('admin', 'administrator')
def update_role_permissions(role_id):
    data = request.get_json() or {}
    pids = data.get('permission_ids', [])
    MasterService.update_role_permissions(role_id, pids)
    return success_response(message="Role permissions updated successfully")

@master_bp.route('/permissions', methods=['GET'])
def get_permissions():
    return success_response(MasterService.get_permissions())

@master_bp.route('/system-settings', methods=['GET'])
def get_system_settings():
    return success_response(MasterService.get_system_settings())
