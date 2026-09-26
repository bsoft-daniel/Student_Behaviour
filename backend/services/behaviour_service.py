from backend.repositories.behaviour_repository import BehaviourRepository
from backend.repositories.student_repository import StudentRepository
from backend.repositories.audit_repository import AuditRepository
from backend.models.student import TeacherClass
import datetime

class BehaviourService:
    @staticmethod
    def get_incidents(current_user, student_id=None, class_id=None, category_id=None, severity_id=None, status=None, start_date=None, end_date=None, page=1, page_size=20):
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

        items, total = BehaviourRepository.get_all(
            student_id=student_id,
            class_id=class_id,
            category_id=category_id,
            severity_id=severity_id,
            status=status,
            start_date=start_date,
            end_date=end_date,
            page=page,
            page_size=page_size,
            allowed_student_ids=allowed_student_ids
        )
        return [i.to_dict() for i in items], total

    @staticmethod
    def get_incident_by_id(incident_id, current_user):
        incident = BehaviourRepository.get_by_id(incident_id)
        if not incident:
            return None, "Incident record not found"
        return incident.to_dict(), None

    @staticmethod
    def create_incident(data, current_user_id=None):
        payload = {
            'student_id': data['student_id'],
            'academic_year_id': data['academic_year_id'],
            'category_id': data['category_id'],
            'type_id': data['type_id'],
            'severity_id': data['severity_id'],
            'incident_date': datetime.datetime.strptime(data['incident_date'], '%Y-%m-%d').date() if isinstance(data['incident_date'], str) else data['incident_date'],
            'location': data.get('location'),
            'description': data['description'],
            'action_taken': data.get('action_taken'),
            'status': data.get('status', 'Open'),
            'is_critical': data.get('is_critical', False),
            'parent_notified': data.get('parent_notified', False),
            'created_by': current_user_id
        }
        incident = BehaviourRepository.create(payload)
        AuditRepository.log_activity(
            user_id=current_user_id,
            action='RECORD_BEHAVIOUR',
            module='BEHAVIOUR',
            entity_name='behaviour_incidents',
            entity_id=incident.id,
            description=f"Recorded behaviour incident for student #{incident.student_id}"
        )
        return incident.to_dict(), None

    @staticmethod
    def update_incident(incident_id, data, current_user_id=None):
        incident = BehaviourRepository.get_by_id(incident_id)
        if not incident:
            return None, "Incident record not found"

        update_payload = {
            'category_id': data.get('category_id', incident.category_id),
            'type_id': data.get('type_id', incident.type_id),
            'severity_id': data.get('severity_id', incident.severity_id),
            'location': data.get('location', incident.location),
            'description': data.get('description', incident.description),
            'action_taken': data.get('action_taken', incident.action_taken),
            'status': data.get('status', incident.status),
            'is_critical': data.get('is_critical', incident.is_critical),
            'parent_notified': data.get('parent_notified', incident.parent_notified),
            'modified_by': current_user_id
        }
        if data.get('incident_date'):
            update_payload['incident_date'] = datetime.datetime.strptime(data['incident_date'], '%Y-%m-%d').date() if isinstance(data['incident_date'], str) else data['incident_date']

        updated = BehaviourRepository.update(incident, update_payload)
        AuditRepository.log_activity(
            user_id=current_user_id,
            action='UPDATE_BEHAVIOUR',
            module='BEHAVIOUR',
            entity_name='behaviour_incidents',
            entity_id=incident.id,
            description=f"Updated incident #{incident.id}"
        )
        return updated.to_dict(), None

    @staticmethod
    def add_follow_up(incident_id, data, current_user_id=None):
        payload = {
            'incident_id': incident_id,
            'follow_up_date': datetime.datetime.strptime(data['follow_up_date'], '%Y-%m-%d').date() if isinstance(data['follow_up_date'], str) else data['follow_up_date'],
            'remarks': data['remarks'],
            'status': data.get('status', 'Completed'),
            'action_by': current_user_id,
            'created_by': current_user_id
        }
        follow_up = BehaviourRepository.add_follow_up(payload)
        # Update incident status if resolved
        if data.get('resolve_incident'):
            incident = BehaviourRepository.get_by_id(incident_id)
            if incident:
                BehaviourRepository.update(incident, {'status': 'Resolved'})

        AuditRepository.log_activity(
            user_id=current_user_id,
            action='ADD_FOLLOW_UP',
            module='BEHAVIOUR',
            entity_name='behaviour_follow_ups',
            entity_id=follow_up.id,
            description=f"Added follow-up for incident #{incident_id}"
        )
        return follow_up.to_dict(), None
