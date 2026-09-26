from backend.models.masters import (
    AcademicYear, ClassRoom, Section, BehaviourCategory, 
    BehaviourType, SeverityLevel, AttendanceType, SystemSetting
)
from backend.models.user import Role, Permission, RolePermission
from backend.models.base import db

class MasterRepository:
    @staticmethod
    def get_academic_years():
        return AcademicYear.query.filter_by(is_deleted=False).order_by(AcademicYear.start_date.desc()).all()

    @staticmethod
    def get_current_academic_year():
        return AcademicYear.query.filter_by(is_current=True, is_deleted=False).first()

    @staticmethod
    def get_classes():
        return ClassRoom.query.filter_by(is_deleted=False).order_by(ClassRoom.order_index.asc()).all()

    @staticmethod
    def get_sections(class_id=None):
        query = Section.query.filter_by(is_deleted=False)
        if class_id:
            query = query.filter_by(class_id=class_id)
        return query.order_by(Section.section_name.asc()).all()

    @staticmethod
    def get_behaviour_categories():
        return BehaviourCategory.query.filter_by(is_deleted=False).all()

    @staticmethod
    def get_behaviour_types(category_id=None):
        query = BehaviourType.query.filter_by(is_deleted=False)
        if category_id:
            query = query.filter_by(category_id=category_id)
        return query.all()

    @staticmethod
    def get_severity_levels():
        return SeverityLevel.query.filter_by(is_deleted=False).order_by(SeverityLevel.severity_level.asc()).all()

    @staticmethod
    def get_attendance_types():
        return AttendanceType.query.filter_by(is_deleted=False).all()

    @staticmethod
    def get_roles():
        return Role.query.filter_by(is_deleted=False).all()

    @staticmethod
    def get_permissions():
        return Permission.query.filter_by(is_deleted=False).order_by(Permission.module.asc()).all()

    @staticmethod
    def get_system_settings():
        settings = SystemSetting.query.filter_by(is_deleted=False).all()
        return {s.setting_key: s.setting_value for s in settings}
