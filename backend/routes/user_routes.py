from flask import Blueprint, request, g
from backend.services.user_service import UserService
from backend.middleware.auth_middleware import token_required, role_required
from backend.utils.response_utils import success_response, error_response, paginated_response

user_bp = Blueprint('user_bp', __name__)

@user_bp.route('', methods=['GET'])
@token_required
@role_required('admin', 'administrator')
def get_users():
    role_id = request.args.get('role_id', type=int)
    search = request.args.get('search')
    page = request.args.get('page', default=1, type=int)
    page_size = request.args.get('page_size', default=20, type=int)

    items, total = UserService.get_users(role_id=role_id, search=search, page=page, page_size=page_size)
    return paginated_response(items, total, page, page_size)

@user_bp.route('/<int:user_id>', methods=['GET'])
@token_required
def get_user_by_id(user_id):
    user = UserService.get_user_by_id(user_id)
    if not user:
        return error_response('User not found', status_code=404)
    return success_response(user)

@user_bp.route('', methods=['POST'])
@token_required
@role_required('admin', 'administrator')
def create_user():
    data = request.get_json() or {}
    user, err = UserService.create_user(data, g.current_user.id)
    if err:
        return error_response(err, status_code=400)
    return success_response(user, message="User created successfully", status_code=201)

@user_bp.route('/<int:user_id>', methods=['PUT'])
@token_required
def update_user(user_id):
    data = request.get_json() or {}
    user, err = UserService.update_user(user_id, data, g.current_user.id)
    if err:
        return error_response(err, status_code=400)
    return success_response(user, message="User updated successfully")

@user_bp.route('/<int:user_id>', methods=['DELETE'])
@token_required
@role_required('admin', 'administrator')
def delete_user(user_id):
    ok, err = UserService.delete_user(user_id, g.current_user.id)
    if err:
        return error_response(err, status_code=400)
    return success_response(message="User deactivated successfully")

@user_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile():
    data = request.get_json() or {}
    user, err = UserService.update_user(g.current_user.id, data, g.current_user.id)
    if err:
        return error_response(err, status_code=400)
    return success_response(user, message="Profile updated successfully")

@user_bp.route('/change-password', methods=['PUT'])
@token_required
def change_password():
    data = request.get_json() or {}
    current_pwd = data.get('current_password')
    new_pwd = data.get('new_password')
    from backend.utils.security_utils import verify_password, hash_password
    if not verify_password(current_pwd, g.current_user.password_hash):
        return error_response('Current password does not match', status_code=400)

    UserService.update_user(g.current_user.id, {'password': new_pwd}, g.current_user.id)
    return success_response(message="Password changed successfully")
