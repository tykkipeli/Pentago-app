from flask import send_from_directory, render_template, jsonify, request
import os
from app import app
from auth import get_username_from_token, create_encoded_token
from utils import users_in_lobby
from werkzeug.security import generate_password_hash, check_password_hash
from database.models import Users
from app import db

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

    # Check if the user exists
    user = Users.query.filter_by(username=username).first()

    # Verify the provided password
    if user and check_password_hash(user.password, password):
        token = create_encoded_token(username)
        return jsonify({"status": "success", "token": token})
    else:
        return jsonify({"status": "error", "message": "Invalid username or password"}), 401

@app.route("/api/logout", methods=["POST"])
def logout():
    # Logout is handled client-side
    return jsonify({"status": "success"})

@app.route('/api/users')
def users():
    return jsonify({"users": list(users_in_lobby)})


@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data['username']
    password = data['password']

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    # Check if the user already exists
    existing_user = Users.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({'error': 'Username is already taken'}), 400

    # Create a new user and add it to the database
    hashed_password = generate_password_hash(password)
    new_user = Users(username=username, password=hashed_password, rating=1500)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201
