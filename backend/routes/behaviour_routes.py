from flask import Blueprint, request, g
from backend.services.behaviour_service import BehaviourService
from backend.middleware.auth_middleware import token_required, role_required
from backend.utils.response_utils import success_response, error_response, paginated_response

behaviour_bp = Blueprint('behaviour_bp', __name__)

@behaviour_bp.route('', methods=['GET'])
@token_required
def get_incidents():
    student_id = request.args.get('student_id', type=int)
    class_id = request.args.get('class_id', type=int)
    category_id = request.args.get('category_id', type=int)
    severity_id = request.args.get('severity_id', type=int)
    status = request.args.get('status')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    page = request.args.get('page', default=1, type=int)
    page_size = request.args.get('page_size', default=20, type=int)

    items, total = BehaviourService.get_incidents(
        current_user=g.current_user,
        student_id=student_id,
        class_id=class_id,
        category_id=category_id,
        severity_id=severity_id,
        status=status,
        start_date=start_date,
        end_date=end_date,
        page=page,
        page_size=page_size
    )
    return paginated_response(items, total, page, page_size)

@behaviour_bp.route('/<int:incident_id>', methods=['GET'])
@token_required
def get_incident_by_id(incident_id):
    incident, err = BehaviourService.get_incident_by_id(incident_id, g.current_user)
    if err:
        return error_response(err, status_code=404)
    return success_response(incident)

@behaviour_bp.route('', methods=['POST'])
@token_required
@role_required('admin', 'administrator', 'teacher', 'staff', 'principal')
def create_incident():
    data = request.get_json() or {}
    incident, err = BehaviourService.create_incident(data, g.current_user.id)
    if err:
        return error_response(err, status_code=400)
    return success_response(incident, message="Behaviour incident recorded successfully", status_code=201)

@behaviour_bp.route('/<int:incident_id>', methods=['PUT'])
@token_required
@role_required('admin', 'administrator', 'teacher', 'staff', 'principal')
def update_incident(incident_id):
    data = request.get_json() or {}
    incident, err = BehaviourService.update_incident(incident_id, data, g.current_user.id)
    if err:
        return error_response(err, status_code=400)
    return success_response(incident, message="Incident updated successfully")

@behaviour_bp.route('/<int:incident_id>/follow-ups', methods=['POST'])
@token_required
@role_required('admin', 'administrator', 'teacher', 'staff', 'principal')
def add_follow_up(incident_id):
    data = request.get_json() or {}
    follow_up, err = BehaviourService.add_follow_up(incident_id, data, g.current_user.id)
    if err:
        return error_response(err, status_code=400)
    return success_response(follow_up, message="Follow-up remark added successfully")
