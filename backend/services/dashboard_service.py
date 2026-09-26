import datetime
from sqlalchemy import func
from backend.models.student import Student, Parent, StudentParent, TeacherClass
from backend.models.user import User
from backend.models.attendance import Attendance
from backend.models.behaviour import BehaviourIncident
from backend.models.masters import AttendanceType, BehaviourCategory, ClassRoom
from backend.models.base import db

class DashboardService:
    @staticmethod
    def get_admin_dashboard():
        today = datetime.date.today()
        total_students = Student.query.filter_by(is_deleted=False).count()
        total_teachers = User.query.join(User.role).filter(func.lower(User.role.property.mapper.class_.role_name).in_(['teacher', 'staff']), User.is_deleted == False).count()
        
        # Today's attendance
        present_type = AttendanceType.query.filter(func.lower(AttendanceType.type_name) == 'present').first()
        absent_type = AttendanceType.query.filter(func.lower(AttendanceType.type_name) == 'absent').first()
        late_type = AttendanceType.query.filter(func.lower(AttendanceType.type_name) == 'late').first()

        present_today = Attendance.query.filter_by(attendance_date=today, attendance_type_id=present_type.id if present_type else 0, is_deleted=False).count()
        absent_today = Attendance.query.filter_by(attendance_date=today, attendance_type_id=absent_type.id if absent_type else 0, is_deleted=False).count()
        late_today = Attendance.query.filter_by(attendance_date=today, attendance_type_id=late_type.id if late_type else 0, is_deleted=False).count()

        # Behaviour stats
        behaviour_today = BehaviourIncident.query.filter_by(incident_date=today, is_deleted=False).count()
        critical_cases = BehaviourIncident.query.filter_by(is_critical=True, is_deleted=False).count()
        
        # Positive vs Negative
        pos_cat = BehaviourCategory.query.filter_by(category_type='Positive', is_deleted=False).all()
        pos_cat_ids = [c.id for c in pos_cat]
        positive_count = BehaviourIncident.query.filter(BehaviourIncident.category_id.in_(pos_cat_ids), BehaviourIncident.is_deleted == False).count()
        negative_count = BehaviourIncident.query.filter(~BehaviourIncident.category_id.in_(pos_cat_ids), BehaviourIncident.is_deleted == False).count()

        recent_incidents = BehaviourIncident.query.filter_by(is_deleted=False).order_by(BehaviourIncident.incident_date.desc(), BehaviourIncident.id.desc()).limit(5).all()

        return {
            'total_students': total_students,
            'total_teachers': total_teachers,
            'present_today': present_today,
            'absent_today': absent_today,
            'late_today': late_today,
            'behaviour_records_today': behaviour_today,
            'critical_cases': critical_cases,
            'positive_behaviour': positive_count,
            'negative_behaviour': negative_count,
            'pending_followups': BehaviourIncident.query.filter_by(status='Open', is_deleted=False).count(),
            'recent_incidents': [i.to_dict() for i in recent_incidents]
        }

    @staticmethod
    def get_teacher_dashboard(user):
        today = datetime.date.today()
        # Find assigned classes
        teacher_classes = TeacherClass.query.filter_by(teacher_id=user.id, is_deleted=False).all()
        class_ids = [tc.class_id for tc in teacher_classes]
        
        my_students_count = Student.query.filter(Student.class_id.in_(class_ids), Student.is_deleted == False).count() if class_ids else 0
        
        my_classes = []
        for tc in teacher_classes:
            my_classes.append({
                'id': tc.id,
                'class_id': tc.class_id,
                'class_name': tc.class_room.class_name if tc.class_room else '',
                'section_id': tc.section_id,
                'section_name': tc.section.section_name if tc.section else '',
                'is_class_teacher': tc.is_class_teacher
            })

        recent_incidents = BehaviourIncident.query.filter_by(created_by=user.id, is_deleted=False).order_by(BehaviourIncident.id.desc()).limit(5).all()

        return {
            'my_classes_count': len(teacher_classes),
            'my_students_count': my_students_count,
            'my_classes': my_classes,
            'recent_incidents': [i.to_dict() for i in recent_incidents]
        }

    @staticmethod
    def get_principal_dashboard():
        return DashboardService.get_admin_dashboard()

    @staticmethod
    def get_student_dashboard(user):
        student = Student.query.filter_by(user_id=user.id, is_deleted=False).first()
        if not student:
            return {'student': None, 'attendance_rate': 0, 'incidents_count': 0}

        # Calculate student attendance percentage
        total_att = Attendance.query.filter_by(student_id=student.id, is_deleted=False).count()
        present_type = AttendanceType.query.filter(func.lower(AttendanceType.type_name) == 'present').first()
        present_att = Attendance.query.filter_by(student_id=student.id, attendance_type_id=present_type.id if present_type else 0, is_deleted=False).count()
        rate = round((present_att / total_att * 100), 1) if total_att > 0 else 100.0

        incidents = BehaviourIncident.query.filter_by(student_id=student.id, is_deleted=False).order_by(BehaviourIncident.incident_date.desc()).all()

        return {
            'student': student.to_dict(),
            'total_attendance_days': total_att,
            'present_days': present_att,
            'attendance_rate': rate,
            'incidents_count': len(incidents),
            'recent_incidents': [i.to_dict() for i in incidents[:5]]
        }

    @staticmethod
    def get_parent_dashboard(user):
        parent = Parent.query.filter_by(user_id=user.id, is_deleted=False).first()
        if not parent:
            return {'children': []}

        student_parents = StudentParent.query.filter_by(parent_id=parent.id, is_deleted=False).all()
        children_data = []

        for sp in student_parents:
            st = sp.student
            if not st or st.is_deleted:
                continue

            total_att = Attendance.query.filter_by(student_id=st.id, is_deleted=False).count()
            present_type = AttendanceType.query.filter(func.lower(AttendanceType.type_name) == 'present').first()
            present_att = Attendance.query.filter_by(student_id=st.id, attendance_type_id=present_type.id if present_type else 0, is_deleted=False).count()
            rate = round((present_att / total_att * 100), 1) if total_att > 0 else 100.0

            incidents = BehaviourIncident.query.filter_by(student_id=st.id, is_deleted=False).order_by(BehaviourIncident.incident_date.desc()).all()

            children_data.append({
                'student': st.to_dict(),
                'attendance_rate': rate,
                'total_days': total_att,
                'present_days': present_att,
                'incidents_count': len(incidents),
                'recent_incidents': [i.to_dict() for i in incidents[:5]]
            })

        return {
            'parent': parent.to_dict() if hasattr(parent, 'to_dict') else {'first_name': parent.first_name, 'last_name': parent.last_name},
            'children': children_data
        }
