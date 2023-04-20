from flask import send_from_directory, render_template, jsonify, request
import os
from app import app
from auth import get_username_from_token, create_encoded_token
from utils import users_in_lobby

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return render_template("index.html")

@app.route("/api/login", methods=["POST"])
def login():
    username = request.form["username"]
    password = request.form["password"]
    # TODO: check username and password

    token = create_encoded_token(username)
    return jsonify({"status": "success", "token": token})

@app.route("/api/logout", methods=["POST"])
def logout():
    # Logout is handled client-side
    return jsonify({"status": "success"})

@app.route('/api/users')
def users():
    return jsonify({"users": list(users_in_lobby)})