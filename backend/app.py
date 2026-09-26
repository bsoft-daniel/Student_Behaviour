import os
from flask import Flask, jsonify
from flask_cors import CORS
from backend.config import config_by_name
from backend.models.base import db
from backend.routes import register_routes
from backend.utils.response_utils import error_response

def create_app(config_name=None):
    if not config_name:
        config_name = os.environ.get('FLASK_ENV', 'development')

    app = Flask(__name__)
    app.config.from_object(config_by_name.get(config_name, config_by_name['default']))

    # Initialize extensions
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    db.init_app(app)

    # Register API routes
    register_routes(app)

    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'institution': "ST. MARTIN'S MATRICULATION HR.SEC. SCHOOL",
            'service': 'Student Behaviour Monitoring System REST API',
            'version': '1.0.0'
        }), 200

    # Global Error Handlers
    @app.errorhandler(400)
    def bad_request(e):
        return error_response(str(e.description) if hasattr(e, 'description') else 'Bad Request', status_code=400)

    @app.errorhandler(401)
    def unauthorized(e):
        return error_response(str(e.description) if hasattr(e, 'description') else 'Unauthorized', status_code=401)

    @app.errorhandler(403)
    def forbidden(e):
        return error_response(str(e.description) if hasattr(e, 'description') else 'Forbidden', status_code=403)

    @app.errorhandler(404)
    def not_found(e):
        return error_response(str(e.description) if hasattr(e, 'description') else 'Resource not found', status_code=404)

    @app.errorhandler(500)
    def internal_error(e):
        return error_response('Internal server error', error=str(e), status_code=500)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
