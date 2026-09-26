from backend.repositories.attendance_repository import AttendanceRepository
from backend.repositories.student_repository import StudentRepository
from backend.repositories.audit_repository import AuditRepository
from backend.models.student import TeacherClass
import datetime

class AttendanceService:
    @staticmethod
    def get_attendance(current_user, class_id=None, section_id=None, student_id=None, date=None, start_date=None, end_date=None, attendance_type_id=None, page=1, page_size=20):
        role = (current_user.role.role_name if current_user.role else '').lower()
        allowed_student_ids = None

        if role in ['teacher', 'staff']:
            teacher_classes = TeacherClass.query.filter_by(teacher_id=current_user.id, is_deleted=False).all()
            allowed_class_ids = [tc.class_id for tc in teacher_classes]
            students, _ = StudentRepository.get_all(allowed_class_ids=allowed_class_ids, page_size=1000)
            allowed_student_ids = [s.id for s in students]
        elif role in ['parent', 'guardian']:
            children = StudentRepository.get_by_parent_user_id(current_user.id)
            allowed_student_ids = [c.id for c in children]
        elif role == 'student':
            student = StudentRepository.get_by_user_id(current_user.id)
            allowed_student_ids = [student.id] if student else []

        items, total = AttendanceRepository.get_all(
            class_id=class_id,
            section_id=section_id,
            student_id=student_id,
            date=date,
            start_date=start_date,
            end_date=end_date,
            attendance_type_id=attendance_type_id,
            page=page,
            page_size=page_size,
            allowed_student_ids=allowed_student_ids
        )
        return [a.to_dict() for a in items], total

    @staticmethod
    def bulk_mark(data, current_user_id=None):
        academic_year_id = data['academic_year_id']
        class_id = data['class_id']
        section_id = data['section_id']
        attendance_date = datetime.datetime.strptime(data['attendance_date'], '%Y-%m-%d').date() if isinstance(data['attendance_date'], str) else data['attendance_date']
        records = data['records']

        saved = AttendanceRepository.bulk_upsert(
            academic_year_id=academic_year_id,
            class_id=class_id,
            section_id=section_id,
            attendance_date=attendance_date,
            records=records,
            created_by=current_user_id
        )

        AuditRepository.log_activity(
            user_id=current_user_id,
            action='MARK_ATTENDANCE',
            module='ATTENDANCE',
            entity_name='attendance',
            description=f"Marked attendance for Class #{class_id} Section #{section_id} on {attendance_date}"
        )
        return [a.to_dict() for a in saved], None
