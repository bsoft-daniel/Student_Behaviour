from .base import BaseModel, db

class AcademicYear(BaseModel):
    __tablename__ = 'academic_years'

    year_name = db.Column(db.String(20), unique=True, nullable=False) # e.g. "2026-2027"
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    is_current = db.Column(db.Boolean, default=False, nullable=False)

    students = db.relationship('Student', back_populates='academic_year', lazy='dynamic')

class ClassRoom(BaseModel):
    __tablename__ = 'classes'

    class_name = db.Column(db.String(50), unique=True, nullable=False) # e.g. "Class 10"
    order_index = db.Column(db.Integer, default=0, nullable=False)

    sections = db.relationship('Section', back_populates='class_room', cascade='all, delete-orphan')
    students = db.relationship('Student', back_populates='class_room', lazy='dynamic')
    teacher_classes = db.relationship('TeacherClass', back_populates='class_room')

class Section(BaseModel):
    __tablename__ = 'sections'

    class_id = db.Column(db.Integer, db.ForeignKey('classes.id'), nullable=False)
    section_name = db.Column(db.String(10), nullable=False) # e.g. "A", "B", "C"

    class_room = db.relationship('ClassRoom', back_populates='sections')
    students = db.relationship('Student', back_populates='section', lazy='dynamic')
    teacher_classes = db.relationship('TeacherClass', back_populates='section')

class BehaviourCategory(BaseModel):
    __tablename__ = 'behaviour_categories'

    category_name = db.Column(db.String(100), unique=True, nullable=False)
    category_type = db.Column(db.String(20), nullable=False, default='Negative') # Positive / Negative
    description = db.Column(db.String(255), nullable=True)

    types = db.relationship('BehaviourType', back_populates='category', cascade='all, delete-orphan')
    incidents = db.relationship('BehaviourIncident', back_populates='category')

class BehaviourType(BaseModel):
    __tablename__ = 'behaviour_types'

    category_id = db.Column(db.Integer, db.ForeignKey('behaviour_categories.id'), nullable=False)
    type_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=True)

    category = db.relationship('BehaviourCategory', back_populates='types')
    incidents = db.relationship('BehaviourIncident', back_populates='type')

class SeverityLevel(BaseModel):
    __tablename__ = 'severity_levels'

    severity_name = db.Column(db.String(50), unique=True, nullable=False) # Low, Medium, High, Critical
    severity_level = db.Column(db.Integer, unique=True, nullable=False) # 1, 2, 3, 4
    description = db.Column(db.String(255), nullable=True)

    incidents = db.relationship('BehaviourIncident', back_populates='severity')

class AttendanceType(BaseModel):
    __tablename__ = 'attendance_types'

    type_name = db.Column(db.String(50), unique=True, nullable=False) # Present, Absent, Late, Excused
    type_code = db.Column(db.String(10), unique=True, nullable=False) # P, A, L, E

    attendance_records = db.relationship('Attendance', back_populates='attendance_type')

class SystemSetting(BaseModel):
    __tablename__ = 'system_settings'

    setting_key = db.Column(db.String(100), unique=True, nullable=False)
    setting_value = db.Column(db.Text, nullable=True)
    description = db.Column(db.String(255), nullable=True)
