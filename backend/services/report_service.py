from backend.repositories.report_repository import ReportRepository
from backend.repositories.behaviour_repository import BehaviourRepository
from backend.repositories.attendance_repository import AttendanceRepository
from backend.repositories.student_repository import StudentRepository
from backend.repositories.audit_repository import AuditRepository

class ReportService:
    @staticmethod
    def get_daily_attendance(class_id=None, academic_year_id=None, start_date=None, end_date=None):
        return ReportRepository.get_attendance_summary(academic_year_id=academic_year_id, class_id=class_id, start_date=start_date, end_date=end_date)

    @staticmethod
    def get_attendance_register(class_id=None, academic_year_id=None, start_date=None, end_date=None):
        return ReportRepository.get_attendance_summary(academic_year_id=academic_year_id, class_id=class_id, start_date=start_date, end_date=end_date)

    @staticmethod
    def get_low_attendance(threshold=75, class_id=None, academic_year_id=None):
        summary = ReportRepository.get_attendance_summary(academic_year_id=academic_year_id, class_id=class_id)
        return [s for s in summary if s['percentage'] < threshold]

    @staticmethod
    def get_behaviour_incidents(class_id=None, start_date=None, end_date=None):
        items, _ = BehaviourRepository.get_all(class_id=class_id, start_date=start_date, end_date=end_date, page_size=1000)
        return [i.to_dict() for i in items]

    @staticmethod
    def get_positive_behaviour(class_id=None, start_date=None, end_date=None):
        items, _ = BehaviourRepository.get_all(class_id=class_id, start_date=start_date, end_date=end_date, page_size=1000)
        return [i.to_dict() for i in items if i.category and i.category.category_type == 'Positive']

    @staticmethod
    def get_critical_cases(class_id=None, start_date=None, end_date=None):
        items, _ = BehaviourRepository.get_all(class_id=class_id, start_date=start_date, end_date=end_date, page_size=1000)
        return [i.to_dict() for i in items if i.is_critical or (i.severity and i.severity.severity_level >= 3)]

    @staticmethod
    def get_class_analytics():
        students, _ = StudentRepository.get_all(page_size=1000)
        incidents, _ = BehaviourRepository.get_all(page_size=1000)
        
        # Aggregate by class
        class_map = {}
        for s in students:
            cname = s.class_room.class_name if s.class_room else 'Unknown'
            if cname not in class_map:
                class_map[cname] = {'class_name': cname, 'total_students': 0, 'incidents_count': 0}
            class_map[cname]['total_students'] += 1

        for inc in incidents:
            if inc.student and inc.student.class_room:
                cname = inc.student.class_room.class_name
                if cname in class_map:
                    class_map[cname]['incidents_count'] += 1

        return list(class_map.values())
