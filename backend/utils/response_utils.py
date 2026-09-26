from flask import jsonify

def success_response(data=None, message="Success", status_code=200):
    response = {
        "success": True,
        "message": message,
        "data": data
    }
    return jsonify(response), status_code

def error_response(message="An error occurred", error=None, status_code=400):
    response = {
        "success": False,
        "error": message,
        "details": error
    }
    return jsonify(response), status_code

def paginated_response(items, total, page, page_size, message="Success"):
    return jsonify({
        "success": True,
        "message": message,
        "data": {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size if page_size > 0 else 1
        }
    }), 200
