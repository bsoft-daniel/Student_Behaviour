from flask import Blueprint, request, g
from backend.services.attendance_service import AttendanceService
from backend.middleware.auth_middleware import token_required, role_required
from backend.utils.response_utils import success_response, error_response, paginated_response

attendance_bp = Blueprint('attendance_bp', __name__)

@attendance_bp.route('', methods=['GET'])
@token_required
def get_attendance():
    class_id = request.args.get('class_id', type=int)
    section_id = request.args.get('section_id', type=int)
    student_id = request.args.get('student_id', type=int)
    date = request.args.get('date')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    attendance_type_id = request.args.get('attendance_type_id', type=int)
    page = request.args.get('page', default=1, type=int)
    page_size = request.args.get('page_size', default=20, type=int)

    items, total = AttendanceService.get_attendance(
        current_user=g.current_user,
        class_id=class_id,
        section_id=section_id,
        student_id=student_id,
        date=date,
        start_date=start_date,
        end_date=end_date,
        attendance_type_id=attendance_type_id,
        page=page,
        page_size=page_size
    )
    return paginated_response(items, total, page, page_size)

@attendance_bp.route('/bulk', methods=['POST'])
@token_required
@role_required('admin', 'administrator', 'teacher', 'staff')
def bulk_mark_attendance():
    data = request.get_json() or {}
    saved, err = AttendanceService.bulk_mark(data, g.current_user.id)
    if err:
        return error_response(err, status_code=400)
    return success_response(saved, message="Attendance submitted successfully")
