from .base import BaseModel, db

class Student(BaseModel):
    __tablename__ = 'students'

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=True)
    admission_number = db.Column(db.String(50), unique=True, nullable=False)
    roll_number = db.Column(db.String(20), nullable=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=True)
    gender = db.Column(db.String(10), nullable=False) # Male, Female, Other
    date_of_birth = db.Column(db.Date, nullable=True)
    blood_group = db.Column(db.String(10), nullable=True)
    address = db.Column(db.Text, nullable=True)
    emergency_contact = db.Column(db.String(20), nullable=True)
    class_id = db.Column(db.Integer, db.ForeignKey('classes.id'), nullable=False)
    section_id = db.Column(db.Integer, db.ForeignKey('sections.id'), nullable=False)
    academic_year_id = db.Column(db.Integer, db.ForeignKey('academic_years.id'), nullable=False)

    user = db.relationship('User', back_populates='student_profile')
    class_room = db.relationship('ClassRoom', back_populates='students')
    section = db.relationship('Section', back_populates='students')
    academic_year = db.relationship('AcademicYear', back_populates='students')
    
    parents = db.relationship('StudentParent', back_populates='student', cascade='all, delete-orphan')
    attendance_records = db.relationship('Attendance', back_populates='student', lazy='dynamic')
    incidents = db.relationship('BehaviourIncident', back_populates='student', lazy='dynamic')

    def to_dict(self, include_relations=True):
        data = super().to_dict()
        if include_relations:
            if self.class_room:
                data['class_name'] = self.class_room.class_name
            if self.section:
                data['section_name'] = self.section.section_name
            if self.academic_year:
                data['academic_year_name'] = self.academic_year.year_name
            if self.user:
                data['username'] = self.user.username
                data['email'] = self.user.email
        return data

class Parent(BaseModel):
    __tablename__ = 'parents'

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=True)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(100), nullable=True)
    occupation = db.Column(db.String(100), nullable=True)
    guardian_relation = db.Column('relationship', db.String(50), nullable=True) # Father, Mother, Guardian

    user = db.relationship('User', back_populates='parent_profile')
    students = db.relationship('StudentParent', back_populates='parent', cascade='all, delete-orphan')

class StudentParent(BaseModel):
    __tablename__ = 'student_parents'

    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('parents.id'), nullable=False)
    guardian_relation = db.Column('relationship', db.String(50), nullable=False) # Father, Mother, Guardian
    is_primary_contact = db.Column(db.Boolean, default=False, nullable=False)

    student = db.relationship('Student', back_populates='parents')
    parent = db.relationship('Parent', back_populates='students')

class TeacherClass(BaseModel):
    __tablename__ = 'teacher_classes'

    teacher_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    class_id = db.Column(db.Integer, db.ForeignKey('classes.id'), nullable=False)
    section_id = db.Column(db.Integer, db.ForeignKey('sections.id'), nullable=False)
    academic_year_id = db.Column(db.Integer, db.ForeignKey('academic_years.id'), nullable=False)
    is_class_teacher = db.Column(db.Boolean, default=False, nullable=False)

    teacher = db.relationship('User', back_populates='teacher_classes')
    class_room = db.relationship('ClassRoom', back_populates='teacher_classes')
    section = db.relationship('Section', back_populates='teacher_classes')
