from .base import BaseModel, db

class Attendance(BaseModel):
    __tablename__ = 'attendance'

    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    academic_year_id = db.Column(db.Integer, db.ForeignKey('academic_years.id'), nullable=False)
    class_id = db.Column(db.Integer, db.ForeignKey('classes.id'), nullable=False)
    section_id = db.Column(db.Integer, db.ForeignKey('sections.id'), nullable=False)
    attendance_date = db.Column(db.Date, nullable=False)
    attendance_type_id = db.Column(db.Integer, db.ForeignKey('attendance_types.id'), nullable=False)
    remarks = db.Column(db.String(255), nullable=True)

    student = db.relationship('Student', back_populates='attendance_records')
    attendance_type = db.relationship('AttendanceType', back_populates='attendance_records')
    class_room = db.relationship('ClassRoom')
    section = db.relationship('Section')

    def to_dict(self):
        data = super().to_dict()
        if self.student:
            data['student'] = {
                'id': self.student.id,
                'first_name': self.student.first_name,
                'last_name': self.student.last_name,
                'admission_number': self.student.admission_number,
                'roll_number': self.student.roll_number,
                'class_room': {'class_name': self.student.class_room.class_name if self.student.class_room else None},
                'section': {'section_name': self.student.section.section_name if self.student.section else None}
            }
        if self.attendance_type:
            data['attendance_type'] = {
                'id': self.attendance_type.id,
                'type_name': self.attendance_type.type_name,
                'type_code': self.attendance_type.type_code
            }
        return data
