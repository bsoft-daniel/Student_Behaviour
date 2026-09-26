from backend.models.behaviour import BehaviourIncident, BehaviourFollowUp
from backend.models.student import Student
from backend.models.base import db

class BehaviourRepository:
    @staticmethod
    def get_by_id(incident_id):
        return BehaviourIncident.query.filter_by(id=incident_id, is_deleted=False).first()

    @staticmethod
    def get_all(student_id=None, class_id=None, category_id=None, severity_id=None, status=None, start_date=None, end_date=None, page=1, page_size=20, allowed_student_ids=None):
        query = BehaviourIncident.query.filter_by(is_deleted=False)
        if student_id:
            query = query.filter_by(student_id=student_id)
        if allowed_student_ids is not None:
            query = query.filter(BehaviourIncident.student_id.in_(allowed_student_ids))
        if class_id:
            query = query.join(Student).filter(Student.class_id == class_id, Student.is_deleted == False)
        if category_id:
            query = query.filter(BehaviourIncident.category_id == category_id)
        if severity_id:
            query = query.filter(BehaviourIncident.severity_id == severity_id)
        if status:
            query = query.filter(BehaviourIncident.status == status)
        if start_date:
            query = query.filter(BehaviourIncident.incident_date >= start_date)
        if end_date:
            query = query.filter(BehaviourIncident.incident_date <= end_date)

        total = query.count()
        items = query.order_by(BehaviourIncident.incident_date.desc(), BehaviourIncident.id.desc()).offset((page - 1) * page_size).limit(page_size).all()
        return items, total

    @staticmethod
    def create(incident_data):
        incident = BehaviourIncident(**incident_data)
        db.session.add(incident)
        db.session.commit()
        return incident

    @staticmethod
    def update(incident, update_data):
        for key, val in update_data.items():
            if hasattr(incident, key):
                setattr(incident, key, val)
        db.session.commit()
        return incident

    @staticmethod
    def soft_delete(incident):
        incident.is_deleted = True
        db.session.commit()
        return incident

    @staticmethod
    def add_follow_up(follow_up_data):
        follow_up = BehaviourFollowUp(**follow_up_data)
        db.session.add(follow_up)
        db.session.commit()
        return follow_up
