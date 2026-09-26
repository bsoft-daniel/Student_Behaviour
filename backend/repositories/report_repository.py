from sqlalchemy import func
from backend.models.attendance import Attendance
from backend.models.behaviour import BehaviourIncident, BehaviourFollowUp
from backend.models.student import Student
from backend.models.masters import ClassRoom, AttendanceType
from backend.models.base import db

class ReportRepository:
    @staticmethod
    def get_attendance_summary(academic_year_id=None, class_id=None, start_date=None, end_date=None):
        query = db.session.query(
            Student.id.label('student_id'),
            Student.first_name,
            Student.last_name,
            Student.admission_number,
            ClassRoom.class_name,
            func.count(Attendance.id).label('total_days'),
            func.sum(db.case((AttendanceType.type_name == 'Present', 1), else_=0)).label('present_days'),
            func.sum(db.case((AttendanceType.type_name == 'Absent', 1), else_=0)).label('absent_days')
        ).join(Attendance, Attendance.student_id == Student.id)\
         .join(AttendanceType, Attendance.attendance_type_id == AttendanceType.id)\
         .join(ClassRoom, Student.class_id == ClassRoom.id)\
         .filter(Student.is_deleted == False, Attendance.is_deleted == False)

        if academic_year_id:
            query = query.filter(Attendance.academic_year_id == academic_year_id)
        if class_id:
            query = query.filter(Attendance.class_id == class_id)
        if start_date:
            query = query.filter(Attendance.attendance_date >= start_date)
        if end_date:
            query = query.filter(Attendance.attendance_date <= end_date)

        results = query.group_by(Student.id, ClassRoom.class_name).all()
        report_data = []
        for r in results:
            total = r.total_days or 0
            present = r.present_days or 0
            absent = r.absent_days or 0
            pct = round((present / total * 100), 1) if total > 0 else 0
            report_data.append({
                'student_id': r.student_id,
                'first_name': r.first_name,
                'last_name': r.last_name,
                'student_name': f"{r.first_name} {r.last_name or ''}".strip(),
                'admission_number': r.admission_number,
                'class_name': r.class_name,
                'total_days': total,
                'present_days': present,
                'absent_days': absent,
                'percentage': pct,
                'attendance_percentage': pct
            })
        return report_data
