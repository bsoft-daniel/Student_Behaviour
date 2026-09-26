from backend.repositories.student_repository import StudentRepository
from backend.repositories.audit_repository import AuditRepository
from backend.models.student import TeacherClass, Parent, StudentParent
import datetime

class StudentService:
    @staticmethod
    def get_students(current_user, class_id=None, section_id=None, academic_year_id=None, search=None, page=1, page_size=20):
        role = (current_user.role.role_name if current_user.role else '').lower()
        allowed_class_ids = None

        if role in ['teacher', 'staff']:
            teacher_classes = TeacherClass.query.filter_by(teacher_id=current_user.id, is_deleted=False).all()
            allowed_class_ids = [tc.class_id for tc in teacher_classes]
            if not allowed_class_ids:
                return [], 0
        elif role in ['parent', 'guardian']:
            children = StudentRepository.get_by_parent_user_id(current_user.id)
            return [c.to_dict() for c in children], len(children)
        elif role == 'student':
            student = StudentRepository.get_by_user_id(current_user.id)
            return [student.to_dict()] if student else [], 1 if student else 0

        items, total = StudentRepository.get_all(
            class_id=class_id,
            section_id=section_id,
            academic_year_id=academic_year_id,
            search=search,
            page=page,
            page_size=page_size,
            allowed_class_ids=allowed_class_ids
        )
        return [s.to_dict() for s in items], total

    @staticmethod
    def get_student_by_id(student_id, current_user):
        student = StudentRepository.get_by_id(student_id)
        if not student:
            return None, "Student not found"

        role = (current_user.role.role_name if current_user.role else '').lower()
        if role in ['teacher', 'staff']:
            teacher_classes = TeacherClass.query.filter_by(teacher_id=current_user.id, is_deleted=False).all()
            allowed_class_ids = [tc.class_id for tc in teacher_classes]
            if student.class_id not in allowed_class_ids:
                return None, "Unauthorized to view student from other classes"
        elif role in ['parent', 'guardian']:
            children = StudentRepository.get_by_parent_user_id(current_user.id)
            child_ids = [c.id for c in children]
            if student.id not in child_ids:
                return None, "Unauthorized to view another parent's child"
        elif role == 'student':
            if student.user_id != current_user.id:
                return None, "Unauthorized to view other students' records"

        return student.to_dict(), None

    @staticmethod
    def create_student(data, current_user_id=None):
        if StudentRepository.get_by_admission_number(data['admission_number']):
            return None, "Admission number already exists"

        payload = {
            'admission_number': data['admission_number'],
            'roll_number': data.get('roll_number'),
            'first_name': data['first_name'],
            'last_name': data.get('last_name'),
            'gender': data['gender'],
            'date_of_birth': datetime.datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date() if data.get('date_of_birth') else None,
            'blood_group': data.get('blood_group'),
            'address': data.get('address'),
            'emergency_contact': data.get('emergency_contact'),
            'class_id': data['class_id'],
            'section_id': data['section_id'],
            'academic_year_id': data['academic_year_id'],
            'created_by': current_user_id
        }
        student = StudentRepository.create(payload)
        AuditRepository.log_activity(
            user_id=current_user_id,
            action='CREATE_STUDENT',
            module='STUDENTS',
            entity_name='students',
            entity_id=student.id,
            description=f"Enrolled student {student.first_name} {student.last_name or ''}"
        )
        return student.to_dict(), None

    @staticmethod
    def update_student(student_id, data, current_user_id=None):
        student = StudentRepository.get_by_id(student_id)
        if not student:
            return None, "Student not found"

        update_payload = {
            'roll_number': data.get('roll_number', student.roll_number),
            'first_name': data.get('first_name', student.first_name),
            'last_name': data.get('last_name', student.last_name),
            'gender': data.get('gender', student.gender),
            'blood_group': data.get('blood_group', student.blood_group),
            'address': data.get('address', student.address),
            'emergency_contact': data.get('emergency_contact', student.emergency_contact),
            'class_id': data.get('class_id', student.class_id),
            'section_id': data.get('section_id', student.section_id),
            'academic_year_id': data.get('academic_year_id', student.academic_year_id),
            'modified_by': current_user_id
        }
        if data.get('date_of_birth'):
            update_payload['date_of_birth'] = datetime.datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()

        updated = StudentRepository.update(student, update_payload)
        AuditRepository.log_activity(
            user_id=current_user_id,
            action='UPDATE_STUDENT',
            module='STUDENTS',
            entity_name='students',
            entity_id=student.id,
            description=f"Updated student records for {student.first_name}"
        )
        return updated.to_dict(), None

    @staticmethod
    def delete_student(student_id, current_user_id=None):
        student = StudentRepository.get_by_id(student_id)
        if not student:
            return False, "Student not found"
        StudentRepository.soft_delete(student)
        AuditRepository.log_activity(
            user_id=current_user_id,
            action='DELETE_STUDENT',
            module='STUDENTS',
            entity_name='students',
            entity_id=student.id,
            description=f"Deactivated student {student.first_name}"
        )
        return True, None
