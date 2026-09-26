import os
import sys
import datetime

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.models.base import db
from backend.models.user import Role, Permission, RolePermission, User
from backend.models.masters import (
    AcademicYear, ClassRoom, Section, BehaviourCategory, 
    BehaviourType, SeverityLevel, AttendanceType, SystemSetting
)
from backend.models.student import Student, Parent, StudentParent, TeacherClass
from backend.models.behaviour import BehaviourIncident, BehaviourFollowUp
from backend.models.attendance import Attendance
from backend.models.notification import Notification
from backend.models.support import SupportTicket, SupportReply
from backend.models.audit import AuditLog
from backend.utils.security_utils import hash_password

def init_database(app):
    with app.app_context():
        # Create all tables
        db.create_all()

        # 1. Seed Roles if empty
        if Role.query.count() == 0:
            roles = [
                Role(role_name='Administrator', role_code='ADMIN', description='Full system access and configurations'),
                Role(role_name='Teacher', role_code='TEACHER', description='Access to assigned classes and student roll call'),
                Role(role_name='Principal', role_code='PRINCIPAL', description='School-wide monitoring, analytics and escalations'),
                Role(role_name='Student', role_code='STUDENT', description='Personal attendance and conduct profile'),
                Role(role_name='Parent', role_code='PARENT', description='Child attendance, behaviour logs, and communications')
            ]
            db.session.add_all(roles)
            db.session.commit()

        # 2. Seed Permissions if empty
        if Permission.query.count() == 0:
            perms = [
                # Dashboard
                Permission(permission_name='View Admin Dashboard', permission_code='DASHBOARD_ADMIN_VIEW', module='Dashboard'),
                Permission(permission_name='View Teacher Dashboard', permission_code='DASHBOARD_TEACHER_VIEW', module='Dashboard'),
                Permission(permission_name='View Principal Dashboard', permission_code='DASHBOARD_PRINCIPAL_VIEW', module='Dashboard'),
                Permission(permission_name='View Student Dashboard', permission_code='DASHBOARD_STUDENT_VIEW', module='Dashboard'),
                Permission(permission_name='View Parent Dashboard', permission_code='DASHBOARD_PARENT_VIEW', module='Dashboard'),
                # Students
                Permission(permission_name='View Students', permission_code='STUDENT_VIEW', module='Students'),
                Permission(permission_name='Create Student', permission_code='STUDENT_CREATE', module='Students'),
                Permission(permission_name='Edit Student', permission_code='STUDENT_EDIT', module='Students'),
                Permission(permission_name='Delete Student', permission_code='STUDENT_DELETE', module='Students'),
                # Attendance
                Permission(permission_name='View Attendance', permission_code='ATTENDANCE_VIEW', module='Attendance'),
                Permission(permission_name='Mark Attendance', permission_code='ATTENDANCE_MARK', module='Attendance'),
                # Behaviour
                Permission(permission_name='View Behaviour', permission_code='BEHAVIOUR_VIEW', module='Behaviour'),
                Permission(permission_name='Record Behaviour', permission_code='BEHAVIOUR_CREATE', module='Behaviour'),
                Permission(permission_name='Resolve Behaviour', permission_code='BEHAVIOUR_RESOLVE', module='Behaviour'),
                # Reports
                Permission(permission_name='View Reports', permission_code='REPORTS_VIEW', module='Reports'),
                Permission(permission_name='Export Reports', permission_code='REPORTS_EXPORT', module='Reports'),
                # Users & Settings
                Permission(permission_name='Manage Users', permission_code='USERS_MANAGE', module='Users'),
                Permission(permission_name='Manage Masters', permission_code='MASTERS_MANAGE', module='Masters'),
                Permission(permission_name='View Audit Logs', permission_code='AUDIT_VIEW', module='Audit')
            ]
            db.session.add_all(perms)
            db.session.commit()

            # Assign permissions to roles
            admin_role = Role.query.filter_by(role_code='ADMIN').first()
            if admin_role:
                for p in perms:
                    db.session.add(RolePermission(role_id=admin_role.id, permission_id=p.id))

            teacher_role = Role.query.filter_by(role_code='TEACHER').first()
            if teacher_role:
                teacher_codes = ['DASHBOARD_TEACHER_VIEW', 'STUDENT_VIEW', 'ATTENDANCE_VIEW', 'ATTENDANCE_MARK', 'BEHAVIOUR_VIEW', 'BEHAVIOUR_CREATE', 'REPORTS_VIEW']
                for p in perms:
                    if p.permission_code in teacher_codes:
                        db.session.add(RolePermission(role_id=teacher_role.id, permission_id=p.id))

            principal_role = Role.query.filter_by(role_code='PRINCIPAL').first()
            if principal_role:
                principal_codes = ['DASHBOARD_PRINCIPAL_VIEW', 'STUDENT_VIEW', 'ATTENDANCE_VIEW', 'BEHAVIOUR_VIEW', 'BEHAVIOUR_RESOLVE', 'REPORTS_VIEW', 'REPORTS_EXPORT', 'AUDIT_VIEW']
                for p in perms:
                    if p.permission_code in principal_codes:
                        db.session.add(RolePermission(role_id=principal_role.id, permission_id=p.id))

            student_role = Role.query.filter_by(role_code='STUDENT').first()
            if student_role:
                for p in perms:
                    if p.permission_code in ['DASHBOARD_STUDENT_VIEW', 'ATTENDANCE_VIEW', 'BEHAVIOUR_VIEW']:
                        db.session.add(RolePermission(role_id=student_role.id, permission_id=p.id))

            parent_role = Role.query.filter_by(role_code='PARENT').first()
            if parent_role:
                for p in perms:
                    if p.permission_code in ['DASHBOARD_PARENT_VIEW', 'ATTENDANCE_VIEW', 'BEHAVIOUR_VIEW', 'REPORTS_VIEW']:
                        db.session.add(RolePermission(role_id=parent_role.id, permission_id=p.id))

            db.session.commit()

        # 3. Seed Master Data (Academic Years, Classes, Attendance Types, Categories, Severities)
        if AcademicYear.query.count() == 0:
            current_year = AcademicYear(
                year_name='2026-2027',
                start_date=datetime.date(2026, 6, 1),
                end_date=datetime.date(2027, 4, 30),
                is_current=True
            )
            prev_year = AcademicYear(
                year_name='2025-2026',
                start_date=datetime.date(2025, 6, 1),
                end_date=datetime.date(2026, 4, 30),
                is_current=False
            )
            db.session.add_all([current_year, prev_year])
            db.session.commit()

        if ClassRoom.query.count() == 0:
            for i in range(6, 13):
                cls = ClassRoom(class_name=f'Class {i}', order_index=i)
                db.session.add(cls)
                db.session.flush()
                for sec_name in ['A', 'B', 'C']:
                    db.session.add(Section(class_id=cls.id, section_name=sec_name))
            db.session.commit()

        if AttendanceType.query.count() == 0:
            types = [
                AttendanceType(type_name='Present', type_code='P'),
                AttendanceType(type_name='Absent', type_code='A'),
                AttendanceType(type_name='Late', type_code='L'),
                AttendanceType(type_name='Excused Leave', type_code='E')
            ]
            db.session.add_all(types)
            db.session.commit()

        if SeverityLevel.query.count() == 0:
            sevs = [
                SeverityLevel(severity_name='Minor / Low', severity_level=1, description='First-time or minor disruption'),
                SeverityLevel(severity_name='Moderate', severity_level=2, description='Repeated disruption or misconduct'),
                SeverityLevel(severity_name='Severe', severity_level=3, description='Serious violation requiring parental conference'),
                SeverityLevel(severity_name='Critical', severity_level=4, description='Urgent disciplinary escalation and principal action')
            ]
            db.session.add_all(sevs)
            db.session.commit()

        if BehaviourCategory.query.count() == 0:
            cats = [
                BehaviourCategory(category_name='Classroom Conduct', category_type='Negative', description='Disruptions during academic hours'),
                BehaviourCategory(category_name='Punctuality & Attendance', category_type='Negative', description='Frequent latecoming or skipping'),
                BehaviourCategory(category_name='Campus Discipline', category_type='Negative', description='Uniform violations or property damage'),
                BehaviourCategory(category_name='Academic Excellence', category_type='Positive', description='Consistent performance & participation'),
                BehaviourCategory(category_name='Leadership & Service', category_type='Positive', description='Peer mentoring and school council service')
            ]
            db.session.add_all(cats)
            db.session.flush()

            # Behaviour Types
            db.session.add_all([
                BehaviourType(category_id=cats[0].id, type_name='Talking out of turn / Distracting peers'),
                BehaviourType(category_id=cats[0].id, type_name='Incomplete homework / Classwork'),
                BehaviourType(category_id=cats[1].id, type_name='Late arrival to morning assembly'),
                BehaviourType(category_id=cats[2].id, type_name='Uniform irregularity'),
                BehaviourType(category_id=cats[3].id, type_name='Exemplary class project presentation'),
                BehaviourType(category_id=cats[4].id, type_name='Student Council prefect responsibility')
            ])
            db.session.commit()

        # 4. Seed Default Users for all 5 roles
        admin_role = Role.query.filter_by(role_code='ADMIN').first()
        teacher_role = Role.query.filter_by(role_code='TEACHER').first()
        principal_role = Role.query.filter_by(role_code='PRINCIPAL').first()
        student_role = Role.query.filter_by(role_code='STUDENT').first()
        parent_role = Role.query.filter_by(role_code='PARENT').first()

        if User.query.filter_by(username='admin').first() is None:
            admin_user = User(
                username='admin',
                email='admin@stmartins.edu.in',
                password_hash=hash_password('Admin@123'),
                first_name='System',
                last_name='Administrator',
                phone='9840112233',
                role_id=admin_role.id
            )
            db.session.add(admin_user)

        if User.query.filter_by(username='teacher').first() is None:
            teacher_user = User(
                username='teacher',
                email='teacher@stmartins.edu.in',
                password_hash=hash_password('Teacher@123'),
                first_name='Mary',
                last_name='Stella',
                phone='9840223344',
                role_id=teacher_role.id
            )
            db.session.add(teacher_user)
            db.session.flush()

            # Assign teacher to Class 10 Section A
            c10 = ClassRoom.query.filter_by(class_name='Class 10').first()
            secA = Section.query.filter_by(class_id=c10.id, section_name='A').first() if c10 else None
            curr_y = AcademicYear.query.filter_by(is_current=True).first()
            if c10 and secA and curr_y:
                db.session.add(TeacherClass(
                    teacher_id=teacher_user.id,
                    class_id=c10.id,
                    section_id=secA.id,
                    academic_year_id=curr_y.id,
                    is_class_teacher=True
                ))

        if User.query.filter_by(username='principal').first() is None:
            principal_user = User(
                username='principal',
                email='principal@stmartins.edu.in',
                password_hash=hash_password('Principal@123'),
                first_name='Dr. Martin',
                last_name='Joseph',
                phone='9840334455',
                role_id=principal_role.id
            )
            db.session.add(principal_user)

        if User.query.filter_by(username='student').first() is None:
            student_user = User(
                username='student',
                email='student@stmartins.edu.in',
                password_hash=hash_password('Student@123'),
                first_name='Rahul',
                last_name='Sharma',
                phone='9840445566',
                role_id=student_role.id
            )
            db.session.add(student_user)
            db.session.flush()

            c10 = ClassRoom.query.filter_by(class_name='Class 10').first()
            secA = Section.query.filter_by(class_id=c10.id, section_name='A').first() if c10 else None
            curr_y = AcademicYear.query.filter_by(is_current=True).first()

            if c10 and secA and curr_y:
                sample_student = Student(
                    user_id=student_user.id,
                    admission_number='STM2026001',
                    roll_number='10A01',
                    first_name='Rahul',
                    last_name='Sharma',
                    gender='Male',
                    date_of_birth=datetime.date(2010, 8, 15),
                    blood_group='O+',
                    class_id=c10.id,
                    section_id=secA.id,
                    academic_year_id=curr_y.id
                )
                db.session.add(sample_student)

        if User.query.filter_by(username='parent').first() is None:
            parent_user = User(
                username='parent',
                email='parent@stmartins.edu.in',
                password_hash=hash_password('Parent@123'),
                first_name='Ramesh',
                last_name='Sharma',
                phone='9840556677',
                role_id=parent_role.id
            )
            db.session.add(parent_user)
            db.session.flush()

            sample_parent = Parent(
                user_id=parent_user.id,
                first_name='Ramesh',
                last_name='Sharma',
                phone='9840556677',
                email='parent@stmartins.edu.in',
                guardian_relation='Father'
            )
            db.session.add(sample_parent)
            db.session.flush()

            std = Student.query.filter_by(admission_number='STM2026001').first()
            if std:
                db.session.add(StudentParent(
                    student_id=std.id,
                    parent_id=sample_parent.id,
                    guardian_relation='Father',
                    is_primary_contact=True
                ))

        db.session.commit()
        print("Database initialized and seeded successfully for ST. MARTIN'S MATRICULATION HR.SEC. SCHOOL.")

if __name__ == '__main__':
    from backend.app import create_app
    app = create_app('development')
    init_database(app)
