import pytest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from backend.app import create_app
from backend.models.base import db
from database.init_db import init_database

@pytest.fixture(scope='session')
def app():
    os.environ['FLASK_ENV'] = 'testing'
    app = create_app('testing')
    
    with app.app_context():
        init_database(app)
        yield app

@pytest.fixture
def client(app):
    return app.test_client()

def test_health_check(client):
    res = client.get('/api/health')
    assert res.status_code == 200
    json_data = res.get_json()
    assert json_data['status'] == 'healthy'
    assert 'ST. MARTIN\'S' in json_data['institution']

def test_admin_login(client):
    res = client.post('/api/auth/login', json={
        'username': 'admin',
        'password': 'Admin@123'
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    assert 'token' in data['data']
    assert data['data']['user']['role_name'].lower() in ['admin', 'administrator']

def test_all_five_roles_login(client):
    roles_credentials = [
        ('admin', 'Admin@123', 'Administrator'),
        ('teacher', 'Teacher@123', 'Teacher'),
        ('principal', 'Principal@123', 'Principal'),
        ('student', 'Student@123', 'Student'),
        ('parent', 'Parent@123', 'Parent')
    ]
    for username, pwd, expected_role in roles_credentials:
        res = client.post('/api/auth/login', json={'username': username, 'password': pwd})
        assert res.status_code == 200, f"Login failed for {username}"
        data = res.get_json()
        assert expected_role.lower() in data['data']['user']['role_name'].lower()

def test_master_data_endpoints(client):
    login_res = client.post('/api/auth/login', json={'username': 'admin', 'password': 'Admin@123'})
    token = login_res.get_json()['data']['token']
    headers = {'Authorization': f'Bearer {token}'}

    res_years = client.get('/api/masters/academic-years', headers=headers)
    assert res_years.status_code == 200
    assert len(res_years.get_json()['data']) > 0

    res_classes = client.get('/api/masters/classes', headers=headers)
    assert res_classes.status_code == 200
    classes = res_classes.get_json()['data']
    assert len(classes) > 0

    res_categories = client.get('/api/masters/behaviour-categories', headers=headers)
    assert res_categories.status_code == 200
    assert len(res_categories.get_json()['data']) > 0

def test_admin_dashboard_metrics(client):
    login_res = client.post('/api/auth/login', json={'username': 'admin', 'password': 'Admin@123'})
    token = login_res.get_json()['data']['token']
    headers = {'Authorization': f'Bearer {token}'}

    res = client.get('/api/dashboard/admin', headers=headers)
    assert res.status_code == 200
    stats = res.get_json()['data']
    assert 'total_students' in stats
    assert 'present_today' in stats
    assert 'behaviour_records_today' in stats

def test_student_list_and_rbac(client):
    admin_login = client.post('/api/auth/login', json={'username': 'admin', 'password': 'Admin@123'})
    admin_token = admin_login.get_json()['data']['token']
    
    res_admin = client.get('/api/students', headers={'Authorization': f'Bearer {admin_token}'})
    assert res_admin.status_code == 200
    data = res_admin.get_json()['data']
    students = data['items'] if isinstance(data, dict) and 'items' in data else data
    assert len(students) > 0

    student_login = client.post('/api/auth/login', json={'username': 'student', 'password': 'Student@123'})
    student_token = student_login.get_json()['data']['token']

    res_student = client.get('/api/students', headers={'Authorization': f'Bearer {student_token}'})
    assert res_student.status_code in [200, 403]
    if res_student.status_code == 200:
        student_data = res_student.get_json()['data']
        items = student_data['items'] if isinstance(student_data, dict) and 'items' in student_data else student_data
        assert len(items) <= 1

def test_behaviour_recording(client):
    teacher_login = client.post('/api/auth/login', json={'username': 'teacher', 'password': 'Teacher@123'})
    teacher_token = teacher_login.get_json()['data']['token']
    headers = {'Authorization': f'Bearer {teacher_token}'}

    res = client.get('/api/behaviour', headers=headers)
    assert res.status_code == 200
    data = res.get_json()['data']
    assert isinstance(data, (dict, list))

def test_attendance_bulk_mark(client):
    teacher_login = client.post('/api/auth/login', json={'username': 'teacher', 'password': 'Teacher@123'})
    teacher_token = teacher_login.get_json()['data']['token']
    headers = {'Authorization': f'Bearer {teacher_token}'}

    payload = {
        'academic_year_id': 1,
        'class_id': 5, # Class 10
        'section_id': 1,
        'attendance_date': '2026-09-26',
        'records': [
            {'student_id': 1, 'attendance_type_id': 1, 'remarks': 'On time'}
        ]
    }
    res = client.post('/api/attendance/bulk', json=payload, headers=headers)
    assert res.status_code in [200, 201]

def test_support_ticket_creation(client):
    parent_login = client.post('/api/auth/login', json={'username': 'parent', 'password': 'Parent@123'})
    parent_token = parent_login.get_json()['data']['token']
    headers = {'Authorization': f'Bearer {parent_token}'}

    payload = {
        'subject': 'Clarification on morning attendance',
        'category': 'Attendance Discrepancy',
        'priority': 'Normal',
        'message': 'Kindly verify Rahul\'s bus arrival time for yesterday.'
    }
    res = client.post('/api/support/tickets', json=payload, headers=headers)
    assert res.status_code in [200, 201]
    ticket = res.get_json()['data']
    assert ticket['subject'] == payload['subject']
