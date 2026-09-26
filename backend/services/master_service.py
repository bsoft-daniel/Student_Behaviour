from backend.repositories.master_repository import MasterRepository
from backend.models.masters import AcademicYear, ClassRoom, Section, BehaviourCategory, BehaviourType, SystemSetting
from backend.models.user import RolePermission
from backend.models.base import db
import datetime

class MasterService:
    @staticmethod
    def get_academic_years():
        return [y.to_dict() for y in MasterRepository.get_academic_years()]

    @staticmethod
    def get_classes():
        return [c.to_dict() for c in MasterRepository.get_classes()]

    @staticmethod
    def get_sections(class_id=None):
        return [s.to_dict() for s in MasterRepository.get_sections(class_id)]

    @staticmethod
    def get_behaviour_categories():
        return [c.to_dict() for c in MasterRepository.get_behaviour_categories()]

    @staticmethod
    def get_behaviour_types(category_id=None):
        return [t.to_dict() for t in MasterRepository.get_behaviour_types(category_id)]

    @staticmethod
    def get_severity_levels():
        return [s.to_dict() for s in MasterRepository.get_severity_levels()]

    @staticmethod
    def get_attendance_types():
        return [a.to_dict() for a in MasterRepository.get_attendance_types()]

    @staticmethod
    def get_roles():
        roles = MasterRepository.get_roles()
        result = []
        for r in roles:
            data = r.to_dict()
            data['permissions'] = [rp.permission.to_dict() for rp in r.role_permissions if rp.permission and not rp.is_deleted]
            result.append(data)
        return result

    @staticmethod
    def get_permissions():
        return [p.to_dict() for p in MasterRepository.get_permissions()]

    @staticmethod
    def get_system_settings():
        return MasterRepository.get_system_settings()

    @staticmethod
    def update_role_permissions(role_id, permission_ids):
        # Clear existing
        RolePermission.query.filter_by(role_id=role_id).delete()
        for pid in permission_ids:
            rp = RolePermission(role_id=role_id, permission_id=pid)
            db.session.add(rp)
        db.session.commit()
        return True

    @staticmethod
    def create_academic_year(data):
        year = AcademicYear(
            year_name=data['year_name'],
            start_date=datetime.datetime.strptime(data['start_date'], '%Y-%m-%d').date() if isinstance(data['start_date'], str) else data['start_date'],
            end_date=datetime.datetime.strptime(data['end_date'], '%Y-%m-%d').date() if isinstance(data['end_date'], str) else data['end_date'],
            is_current=data.get('is_current', False)
        )
        if year.is_current:
            AcademicYear.query.update({'is_current': False})
        db.session.add(year)
        db.session.commit()
        return year.to_dict()

    @staticmethod
    def create_class(data):
        cls = ClassRoom(
            class_name=data['class_name'],
            order_index=data.get('order_index', 0)
        )
        db.session.add(cls)
        db.session.commit()
        return cls.to_dict()

    @staticmethod
    def create_category(data):
        cat = BehaviourCategory(
            category_name=data['category_name'],
            description=data.get('description')
        )
        db.session.add(cat)
        db.session.commit()
        return cat.to_dict()
