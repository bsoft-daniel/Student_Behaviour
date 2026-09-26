from backend.models.attendance import Attendance
from backend.models.student import Student
from backend.models.base import db

class AttendanceRepository:
    @staticmethod
    def get_by_id(attendance_id):
        return Attendance.query.filter_by(id=attendance_id, is_deleted=False).first()

    @staticmethod
    def get_all(class_id=None, section_id=None, student_id=None, date=None, start_date=None, end_date=None, attendance_type_id=None, page=1, page_size=20, allowed_student_ids=None):
        query = Attendance.query.filter_by(is_deleted=False)
        if student_id:
            query = query.filter_by(student_id=student_id)
        if allowed_student_ids is not None:
            query = query.filter(Attendance.student_id.in_(allowed_student_ids))
        if class_id:
            query = query.filter_by(class_id=class_id)
        if section_id:
            query = query.filter_by(section_id=section_id)
        if date:
            query = query.filter_by(attendance_date=date)
        if start_date:
            query = query.filter(Attendance.attendance_date >= start_date)
        if end_date:
            query = query.filter(Attendance.attendance_date <= end_date)
        if attendance_type_id:
            query = query.filter_by(attendance_type_id=attendance_type_id)

        total = query.count()
        items = query.order_by(Attendance.attendance_date.desc(), Attendance.id.desc()).offset((page - 1) * page_size).limit(page_size).all()
        return items, total

    @staticmethod
    def bulk_upsert(academic_year_id, class_id, section_id, attendance_date, records, created_by=None):
        saved_records = []
        for r in records:
            student_id = r.get('student_id')
            type_id = r.get('attendance_type_id')
            remarks = r.get('remarks')

            existing = Attendance.query.filter_by(
                student_id=student_id,
                attendance_date=attendance_date,
                is_deleted=False
            ).first()

            if existing:
                existing.attendance_type_id = type_id
                existing.remarks = remarks
                existing.modified_by = created_by
                saved_records.append(existing)
            else:
                new_att = Attendance(
                    academic_year_id=academic_year_id,
                    class_id=class_id,
                    section_id=section_id,
                    student_id=student_id,
                    attendance_date=attendance_date,
                    attendance_type_id=type_id,
                    remarks=remarks,
                    created_by=created_by
                )
                db.session.add(new_att)
                saved_records.append(new_att)

        db.session.commit()
        return saved_records
