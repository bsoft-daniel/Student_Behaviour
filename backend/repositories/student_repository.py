from backend.models.student import Student, Parent, StudentParent, TeacherClass
from backend.models.base import db

class StudentRepository:
    @staticmethod
    def get_by_id(student_id):
        return Student.query.filter_by(id=student_id, is_deleted=False).first()

    @staticmethod
    def get_by_user_id(user_id):
        return Student.query.filter_by(user_id=user_id, is_deleted=False).first()

    @staticmethod
    def get_by_admission_number(admission_number):
        return Student.query.filter_by(admission_number=admission_number, is_deleted=False).first()

    @staticmethod
    def get_by_parent_user_id(parent_user_id):
        parent = Parent.query.filter_by(user_id=parent_user_id, is_deleted=False).first()
        if not parent:
            return []
        student_parents = StudentParent.query.filter_by(parent_id=parent.id, is_deleted=False).all()
        return [sp.student for sp in student_parents if sp.student and not sp.student.is_deleted]

    @staticmethod
    def get_all(class_id=None, section_id=None, academic_year_id=None, search=None, page=1, page_size=20, allowed_class_ids=None):
        query = Student.query.filter_by(is_deleted=False)
        if class_id:
            query = query.filter_by(class_id=class_id)
        if section_id:
            query = query.filter_by(section_id=section_id)
        if academic_year_id:
            query = query.filter_by(academic_year_id=academic_year_id)
        if allowed_class_ids is not None:
            query = query.filter(Student.class_id.in_(allowed_class_ids))
        if search:
            term = f"%{search}%"
            query = query.filter(
                (Student.first_name.ilike(term)) |
                (Student.last_name.ilike(term)) |
                (Student.admission_number.ilike(term)) |
                (Student.roll_number.ilike(term))
            )
        total = query.count()
        items = query.order_by(Student.roll_number.asc(), Student.first_name.asc()).offset((page - 1) * page_size).limit(page_size).all()
        return items, total

    @staticmethod
    def create(student_data):
        student = Student(**student_data)
        db.session.add(student)
        db.session.commit()
        return student

    @staticmethod
    def update(student, update_data):
        for key, val in update_data.items():
            if hasattr(student, key):
                setattr(student, key, val)
        db.session.commit()
        return student

    @staticmethod
    def soft_delete(student):
        student.is_deleted = True
        db.session.commit()
        return student
