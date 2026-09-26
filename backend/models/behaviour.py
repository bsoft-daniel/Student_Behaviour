from .base import BaseModel, db

class BehaviourIncident(BaseModel):
    __tablename__ = 'behaviour_incidents'

    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    academic_year_id = db.Column(db.Integer, db.ForeignKey('academic_years.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('behaviour_categories.id'), nullable=False)
    type_id = db.Column(db.Integer, db.ForeignKey('behaviour_types.id'), nullable=False)
    severity_id = db.Column(db.Integer, db.ForeignKey('severity_levels.id'), nullable=False)
    incident_date = db.Column(db.Date, nullable=False)
    incident_time = db.Column(db.Time, nullable=True)
    location = db.Column(db.String(100), nullable=True) # Classroom, Playground, Library, Bus, etc.
    description = db.Column(db.Text, nullable=False)
    action_taken = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(30), default='Open', nullable=False) # Open, In Progress, Resolved, Closed
    is_critical = db.Column(db.Boolean, default=False, nullable=False)
    parent_notified = db.Column(db.Boolean, default=False, nullable=False)

    student = db.relationship('Student', back_populates='incidents')
    category = db.relationship('BehaviourCategory', back_populates='incidents')
    type = db.relationship('BehaviourType', back_populates='incidents')
    severity = db.relationship('SeverityLevel', back_populates='incidents')
    
    follow_ups = db.relationship('BehaviourFollowUp', back_populates='incident', cascade='all, delete-orphan')

    def to_dict(self):
        data = super().to_dict()
        if self.student:
            data['student_name'] = f"{self.student.first_name} {self.student.last_name or ''}".strip()
            data['admission_number'] = self.student.admission_number
            data['roll_number'] = self.student.roll_number
            if self.student.class_room:
                data['class_name'] = self.student.class_room.class_name
            if self.student.section:
                data['section_name'] = self.student.section.section_name
        if self.category:
            data['category_name'] = self.category.category_name
            data['category_type'] = self.category.category_type
        if self.type:
            data['type_name'] = self.type.type_name
        if self.severity:
            data['severity_name'] = self.severity.severity_name
            data['severity_level'] = self.severity.severity_level
        return data

class BehaviourFollowUp(BaseModel):
    __tablename__ = 'behaviour_follow_ups'

    incident_id = db.Column(db.Integer, db.ForeignKey('behaviour_incidents.id'), nullable=False)
    follow_up_date = db.Column(db.Date, nullable=False)
    remarks = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(30), default='Pending', nullable=False) # Pending, In Progress, Completed
    action_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    incident = db.relationship('BehaviourIncident', back_populates='follow_ups')
    user = db.relationship('User')
