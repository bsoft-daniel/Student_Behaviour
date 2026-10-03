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
        classes = MasterRepository.get_classes()
        res = []
        for c in classes:
            c_dict = c.to_dict()
            secs = [s.section_name for s in c.sections if not getattr(s, 'is_deleted', False)] if hasattr(c, 'sections') and c.sections else []
            c_dict['section'] = ", ".join(secs) if secs else 'A'
            c_dict['capacity'] = 40
            res.append(c_dict)
        return res

    @staticmethod
    def create_class(data):
        name = data.get('class_name') or data.get('name') or 'Unnamed Class'
        order = data.get('numeric_order') or data.get('order_index') or 0
        cls = ClassRoom(
            class_name=name,
            order_index=int(order) if order else 0
        )
        db.session.add(cls)
        db.session.commit()

        sec_name = data.get('section') or data.get('section_name') or 'A'
        capacity = int(data.get('capacity') or 40)
        sec = Section(
            class_id=cls.id,
            section_name=sec_name
        )
        db.session.add(sec)
        db.session.commit()

        res = cls.to_dict()
        res['section'] = sec_name
        res['capacity'] = capacity
        return res

    @staticmethod
    def get_sections(class_id=None):
        sections = MasterRepository.get_sections(class_id)
        if sections:
            return [s.to_dict() for s in sections]
        
        # Fallback or split if sections table has string entries from class
        if class_id:
            cls = ClassRoom.query.get(class_id)
            if cls and cls.sections:
                return [s.to_dict() for s in cls.sections if not getattr(s, 'is_deleted', False)]
        
        # Return default sections A, B, C for fallback
        return [
            {'id': 1, 'section_name': 'A', 'class_id': class_id},
            {'id': 2, 'section_name': 'B', 'class_id': class_id},
            {'id': 3, 'section_name': 'C', 'class_id': class_id}
        ]

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
        name = data.get('year_name') or data.get('name') or '2026-2027'
        start_d = data.get('start_date')
        end_d = data.get('end_date')
        
        today = datetime.date.today()
        start_date = today
        end_date = today.replace(year=today.year + 1)

        if start_d:
            try:
                start_date = datetime.datetime.strptime(start_d, '%Y-%m-%d').date() if isinstance(start_d, str) else start_d
            except ValueError:
                pass
        if end_d:
            try:
                end_date = datetime.datetime.strptime(end_d, '%Y-%m-%d').date() if isinstance(end_d, str) else end_d
            except ValueError:
                pass

        year = AcademicYear(
            year_name=name,
            start_date=start_date,
            end_date=end_date,
            is_current=data.get('is_current', False)
        )
        if year.is_current:
            AcademicYear.query.update({'is_current': False})
        db.session.add(year)
        db.session.commit()
        return year.to_dict()

    @staticmethod
    def create_class(data):
        name = data.get('class_name') or data.get('name') or 'Unnamed Class'
        order = data.get('numeric_order') or data.get('order_index') or 0
        cls = ClassRoom(
            class_name=name,
            order_index=int(order) if order else 0
        )
        db.session.add(cls)
        db.session.commit()
        return cls.to_dict()

    @staticmethod
    def create_category(data):
        name = data.get('category_name') or data.get('name') or 'Unnamed Category'
        cat = BehaviourCategory(
            category_name=name,
            category_type=data.get('type') or data.get('category_type') or 'Negative',
            description=data.get('description')
        )
        db.session.add(cat)
        db.session.commit()
        return cat.to_dict()

    @staticmethod
    def create_severity_level(data):
        name = data.get('severity_name') or data.get('name') or 'Unnamed Level'
        level = int(data.get('severity_level') or data.get('level') or 1)
        sev = SeverityLevel(
            severity_name=name,
            severity_level=level,
            description=data.get('description')
        )
        db.session.add(sev)
        db.session.commit()
        return sev.to_dict()
