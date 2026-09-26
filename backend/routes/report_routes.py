from flask import Blueprint, request
from backend.services.report_service import ReportService
from backend.middleware.auth_middleware import token_required
from backend.utils.response_utils import success_response

report_bp = Blueprint('report_bp', __name__)

@report_bp.route('/daily-attendance', methods=['GET'])
@token_required
def daily_attendance():
    cid = request.args.get('class_id', type=int)
    yid = request.args.get('academic_year_id', type=int)
    sdate = request.args.get('start_date')
    edate = request.args.get('end_date')
    return success_response(ReportService.get_daily_attendance(class_id=cid, academic_year_id=yid, start_date=sdate, end_date=edate))

@report_bp.route('/attendance-register', methods=['GET'])
@token_required
def attendance_register():
    cid = request.args.get('class_id', type=int)
    yid = request.args.get('academic_year_id', type=int)
    sdate = request.args.get('start_date')
    edate = request.args.get('end_date')
    return success_response(ReportService.get_attendance_register(class_id=cid, academic_year_id=yid, start_date=sdate, end_date=edate))

@report_bp.route('/low-attendance', methods=['GET'])
@token_required
def low_attendance():
    threshold = request.args.get('threshold', default=75, type=float)
    cid = request.args.get('class_id', type=int)
    yid = request.args.get('academic_year_id', type=int)
    return success_response(ReportService.get_low_attendance(threshold=threshold, class_id=cid, academic_year_id=yid))

@report_bp.route('/behaviour-incidents', methods=['GET'])
@token_required
def behaviour_incidents():
    cid = request.args.get('class_id', type=int)
    sdate = request.args.get('start_date')
    edate = request.args.get('end_date')
    return success_response(ReportService.get_behaviour_incidents(class_id=cid, start_date=sdate, end_date=edate))

@report_bp.route('/positive-behaviour', methods=['GET'])
@token_required
def positive_behaviour():
    cid = request.args.get('class_id', type=int)
    sdate = request.args.get('start_date')
    edate = request.args.get('end_date')
    return success_response(ReportService.get_positive_behaviour(class_id=cid, start_date=sdate, end_date=edate))

@report_bp.route('/critical-cases', methods=['GET'])
@token_required
def critical_cases():
    cid = request.args.get('class_id', type=int)
    sdate = request.args.get('start_date')
    edate = request.args.get('end_date')
    return success_response(ReportService.get_critical_cases(class_id=cid, start_date=sdate, end_date=edate))

@report_bp.route('/class-analytics', methods=['GET'])
@token_required
def class_analytics():
    return success_response(ReportService.get_class_analytics())
