from flask import Blueprint, request, g
from backend.services.auth_service import AuthService
from backend.services.user_service import UserService
from backend.middleware.auth_middleware import token_required
from backend.utils.response_utils import success_response, error_response

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    ip_addr = request.remote_addr
    user_agent = request.headers.get('User-Agent')

    result, err = AuthService.login(username, password, ip_addr, user_agent)
    if err:
        return error_response(err, status_code=401)

    return success_response(result, message="Login successful")

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user():
    return success_response(g.current_user.to_dict())

@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout():
    return success_response(message="Logged out successfully")
