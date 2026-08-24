import os
import json
import time
from datetime import datetime, timedelta
from functools import wraps
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import jwt

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "../frontend")
USERS_FILE = os.path.join(BASE_DIR, "users.json")
PROPOSALS_FILE = os.path.join(BASE_DIR, "proposals.json")

PORT = 5000
JWT_SECRET = "supersecretkey"

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path="")
CORS(app)

# ==========================================
# FILE SYSTEM INITIALIZATION & HELPERS
# ==========================================

def init_files():
    if not os.path.exists(USERS_FILE):
        with open(USERS_FILE, "w") as f:
            json.dump([], f)
            
    if not os.path.exists(PROPOSALS_FILE):
        with open(PROPOSALS_FILE, "w") as f:
            json.dump([], f)

def read_users():
    try:
        with open(USERS_FILE, "r") as f:
            data = f.read().strip()
            return json.loads(data) if data else []
    except Exception:
        return []

def write_users(users):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=2)

def read_proposals():
    try:
        with open(PROPOSALS_FILE, "r") as f:
            data = f.read().strip()
            return json.loads(data) if data else []
    except Exception:
        return []

def write_proposals(proposals):
    with open(PROPOSALS_FILE, "w") as f:
        json.dump(proposals, f, indent=2)

def init_admin_user():
    users = read_users()
    admin_email = "admin@kinetic.com"
    password_hash = generate_password_hash("admin123")
    
    admin_index = next((i for i, u in enumerate(users) if u["email"].lower() == admin_email), -1)

    if admin_index == -1:
        users.append({
            "id": "1",
            "name": "System Administrator",
            "email": admin_email,
            "passwordHash": password_hash,
            "role": "admin",
            "createdAt": datetime.utcnow().isoformat() + "Z"
        })
        print("✅ Admin user created (admin@kinetic.com / admin123)")
    else:
        users[admin_index]["passwordHash"] = password_hash
        users[admin_index]["role"] = "admin"

    write_users(users)

# ==========================================
# MIDDLEWARES
# ==========================================

def authenticate_token(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"success": False, "message": "Authentication required. Please sign in."}), 401

        parts = auth_header.split(" ")
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({"success": False, "message": "Authentication token missing."}), 401

        token = parts[1]
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            request.user = payload
        except jwt.ExpiredSignatureError:
            return jsonify({"success": False, "message": "Expired token. Please sign in again."}), 403
        except jwt.InvalidTokenError:
            return jsonify({"success": False, "message": "Invalid token."}), 403

        return f(*args, **kwargs)
    return decorated

def require_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not hasattr(request, "user") or request.user.get("role") != "admin":
            return jsonify({"success": False, "message": "Access denied. Admin only."}), 403
        return f(*args, **kwargs)
    return decorated

# ==========================================
# FRONTEND STATIC ROUTES
# ==========================================

@app.route("/")
def serve_index():
    return send_from_directory(FRONTEND_DIR, "index.html")

@app.route("/admin.html")
def serve_admin():
    return send_from_directory(FRONTEND_DIR, "admin.html")

@app.route("/<path:path>")
def serve_static(path):
    if os.path.exists(os.path.join(FRONTEND_DIR, path)):
        return send_from_directory(FRONTEND_DIR, path)
    return send_from_directory(FRONTEND_DIR, "index.html")

# ==========================================
# API ENDPOINTS
# ==========================================

@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({"success": False, "message": "All fields are required."}), 400

    if len(password) < 6:
        return jsonify({"success": False, "message": "Password must contain at least 6 characters."}), 400

    users = read_users()
    if any(u["email"].lower() == email for u in users):
        return jsonify({"success": False, "message": "Account already registered. Please sign in."}), 409

    users.append({
        "id": str(int(time.time() * 1000)),
        "name": name,
        "email": email,
        "passwordHash": generate_password_hash(password),
        "role": "user",
        "createdAt": datetime.utcnow().isoformat() + "Z"
    })
    write_users(users)

    return jsonify({"success": True, "message": "Account created successfully."}), 201

@app.route("/api/signin", methods=["POST"])
def signin():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password are required."}), 400

    users = read_users()
    user = next((u for u in users if u["email"].lower() == email), None)

    if not user or not check_password_hash(user["passwordHash"], password):
        return jsonify({"success": False, "message": "Invalid email or password."}), 401

    payload = {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "exp": datetime.utcnow() + timedelta(hours=8)
    }

    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")

    return jsonify({
        "success": True,
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    })

@app.route("/api/proposals", methods=["POST"])
@authenticate_token
def submit_proposal():
    data = request.get_json() or {}
    objective = data.get("objective")
    features = data.get("features")

    if not objective or not features or not isinstance(features, list) or len(features) == 0:
        return jsonify({"success": False, "message": "Please select an objective and at least one core feature."}), 400

    proposals = read_proposals()
    new_proposal = {
        "id": str(int(time.time() * 1000)),
        "client": {
            "id": request.user.get("id"),
            "name": data.get("name") or request.user.get("name") or "Guest User",
            "email": data.get("email") or request.user.get("email") or "N/A",
            "phone": data.get("phone") or "N/A"
        },
        "objective": objective,
        "features": features,
        "submittedAt": datetime.utcnow().isoformat() + "Z"
    }

    proposals.append(new_proposal)
    write_proposals(proposals)

    return jsonify({"success": True, "message": "Proposal submitted successfully!"}), 201

@app.route("/api/admin/users", methods=["GET"])
@authenticate_token
@require_admin
def get_admin_users():
    users = read_users()
    safe_users = [{
        "id": u["id"],
        "name": u["name"],
        "email": u["email"],
        "role": u["role"],
        "createdAt": u.get("createdAt")
    } for u in users]
    return jsonify({"success": True, "users": safe_users})

@app.route("/api/admin/users/<user_id>", methods=["DELETE"])
@authenticate_token
@require_admin
def delete_user(user_id):
    users = read_users()
    user = next((u for u in users if u["id"] == user_id), None)

    if not user:
        return jsonify({"success": False, "message": "User not found."}), 404

    if user["role"] == "admin":
        return jsonify({"success": False, "message": "Admin account cannot be deleted."}), 403

    updated_users = [u for u in users if u["id"] != user_id]
    write_users(updated_users)
    return jsonify({"success": True, "message": "User deleted successfully."})

@app.route("/api/admin/proposals", methods=["GET"])
@authenticate_token
@require_admin
def get_admin_proposals():
    proposals = read_proposals()
    return jsonify({"success": True, "proposals": proposals})

@app.route("/api/admin/proposals/<proposal_id>", methods=["DELETE"])
@authenticate_token
@require_admin
def delete_proposal(proposal_id):
    proposals = read_proposals()
    updated_proposals = [p for p in proposals if p["id"] != proposal_id]
    write_proposals(updated_proposals)
    return jsonify({"success": True, "message": "Proposal deleted successfully."})

# ==========================================
# SERVER STARTUP
# ==========================================

# ==========================================
# APP INITIALIZATION (Runs on Gunicorn / Server Startup)
# ==========================================
init_files()
init_admin_user()

# ==========================================
# SERVER STARTUP (For local fallback execution)
# ==========================================
if __name__ == "__main__":
    # Pull dynamic port from host environment, defaulting to 5000 locally
    port = int(os.environ.get("PORT", 5000))
    
    # Keep debug=True ONLY for local development
    app.run(host="0.0.0.0", port=port, debug=True)