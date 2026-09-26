from flask import Blueprint, request, g
from backend.services.student_service import StudentService
from backend.middleware.auth_middleware import token_required, role_required
from backend.utils.response_utils import success_response, error_response, paginated_response

student_bp = Blueprint('student_bp', __name__)

@student_bp.route('', methods=['GET'])
@token_required
def get_students():
    class_id = request.args.get('class_id', type=int)
    section_id = request.args.get('section_id', type=int)
    academic_year_id = request.args.get('academic_year_id', type=int)
    search = request.args.get('search')
    page = request.args.get('page', default=1, type=int)
    page_size = request.args.get('page_size', default=20, type=int)

    items, total = StudentService.get_students(
        current_user=g.current_user,
        class_id=class_id,
        section_id=section_id,
        academic_year_id=academic_year_id,
        search=search,
        page=page,
        page_size=page_size
    )
    return paginated_response(items, total, page, page_size)

@student_bp.route('/<int:student_id>', methods=['GET'])
@token_required
def get_student_by_id(student_id):
    student, err = StudentService.get_student_by_id(student_id, g.current_user)
    if err:
        return error_response(err, status_code=403 if 'Unauthorized' in err else 404)
    return success_response(student)

@student_bp.route('', methods=['POST'])
@token_required
@role_required('admin', 'administrator')
def create_student():
    data = request.get_json() or {}
    student, err = StudentService.create_student(data, g.current_user.id)
    if err:
        return error_response(err, status_code=400)
    return success_response(student, message="Student enrolled successfully", status_code=201)

@student_bp.route('/<int:student_id>', methods=['PUT'])
@token_required
@role_required('admin', 'administrator', 'teacher')
def update_student(student_id):
    data = request.get_json() or {}
    student, err = StudentService.update_student(student_id, data, g.current_user.id)
    if err:
        return error_response(err, status_code=400)
    return success_response(student, message="Student record updated successfully")

@student_bp.route('/<int:student_id>', methods=['DELETE'])
@token_required
@role_required('admin', 'administrator')
def delete_student(student_id):
    ok, err = StudentService.delete_student(student_id, g.current_user.id)
    if err:
        return error_response(err, status_code=400)
    return success_response(message="Student deactivated successfully")
