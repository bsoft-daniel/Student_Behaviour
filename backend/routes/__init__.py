from .auth_routes import auth_bp
from .user_routes import user_bp
from .student_routes import student_bp
from .behaviour_routes import behaviour_bp
from .attendance_routes import attendance_bp
from .master_routes import master_bp
from .report_routes import report_bp
from .notification_routes import notification_bp
from .support_routes import support_bp
from .audit_routes import audit_bp
from .dashboard_routes import dashboard_bp

def register_routes(app):
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(student_bp, url_prefix='/api/students')
    app.register_blueprint(behaviour_bp, url_prefix='/api/behaviour')
    app.register_blueprint(attendance_bp, url_prefix='/api/attendance')
    app.register_blueprint(master_bp, url_prefix='/api/masters')
    app.register_blueprint(report_bp, url_prefix='/api/reports')
    app.register_blueprint(notification_bp, url_prefix='/api/notifications')
    app.register_blueprint(support_bp, url_prefix='/api/support')
    app.register_blueprint(audit_bp, url_prefix='/api/audit')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
