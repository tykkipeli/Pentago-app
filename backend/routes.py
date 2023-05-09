from flask import send_from_directory, render_template, jsonify, request, url_for
import os
from app import app
from auth import get_username_from_token, create_encoded_token
from utils import users_in_lobby, is_valid_integer
from werkzeug.security import generate_password_hash, check_password_hash
from database.models import Users, Games, Positions
from sqlalchemy.sql.expression import or_, and_
from app import db
from sqlalchemy import text
from database.db_utils import get_position_info, get_users, get_profile_data, get_recent_games_data
import re


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

    # Validate the username
    username_pattern = re.compile(
        r"^(?=[A-Za-z])(?!.*[-_]{2,})[A-Za-z0-9_-]*[A-Za-z0-9]$"
    )
    if not (3 <= len(username) <= 20) or not username_pattern.match(username):
        return jsonify({'error': 'Invalid username'}), 400

    # Validate the password
    if len(password) < 8 or len(password) > 128:
        return jsonify({'error': 'Password must be at least 8 characters long'}), 400

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


@app.route('/api/positions/<white_bitboard>/<black_bitboard>/<consider_symmetrical>', methods=['GET'])
def get_position_info_route(white_bitboard, black_bitboard, consider_symmetrical):
    if not white_bitboard.isdigit() or not black_bitboard.isdigit():
        return jsonify({"error": "Invalid bitboard values"}), 400
    consider_symmetrical = consider_symmetrical.lower() == 'true'
    filters = {
        'usernameWhite': request.args.get('usernameWhite', ''),
        'usernameBlack': request.args.get('usernameBlack', ''),
        'whiteRatingMin': request.args.get('whiteRatingMin', ''),
        'whiteRatingMax': request.args.get('whiteRatingMax', ''),
        'blackRatingMin': request.args.get('blackRatingMin', ''),
        'blackRatingMax': request.args.get('blackRatingMax', ''),
        'daysAgo': request.args.get('daysAgo', ''),
    }
    for key in ['whiteRatingMin', 'whiteRatingMax', 'blackRatingMin', 'blackRatingMax', 'daysAgo']:
        if filters[key] and not is_valid_integer(filters[key]):
            return jsonify({"error": f"{key} must be a valid integer"}), 400
    next_positions_info = get_position_info(
        int(white_bitboard), int(black_bitboard), consider_symmetrical, filters)
    response = {'next_positions': next_positions_info}
    return jsonify(response), 200

@app.route('/api/rankings', methods=['GET'])
def get_users_route():
    offset = request.args.get('offset', 0)
    limit = request.args.get('limit', 10)
    if not is_valid_integer(offset) or not is_valid_integer(limit):
        return jsonify({"error": "Invalid offset or limit"}), 400
    offset = int(offset)
    limit = int(limit)
    if offset < 0 or limit < 0:
        return jsonify({"error": "Invalid offset or limit"}), 404
    users = get_users(offset, limit)
    return jsonify([user.to_dict() for user in users])

@app.route('/api/profile/<username>', methods=['GET'])
def get_profile_route(username):
    user = Users.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    profile_data = get_profile_data(user)
    return jsonify(profile_data)

@app.route('/api/profile/<username>/games', methods=['GET'])
def get_recent_games(username):
    user = Users.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    page = request.args.get('page', 1)
    # Check if page is a valid integer
    if not is_valid_integer(page):
        return jsonify({"error": "Invalid page number"}), 400
    page = int(page)
    items_per_page = 10
    game_data, next_url, prev_url = get_recent_games_data(user, page, items_per_page)

    return jsonify({
        'games': game_data,
        'next_url': next_url,
        'prev_url': prev_url
    })

@app.route('/api/games/<int:game_id>', methods=['GET'])
def get_game_positions(game_id):
    game = Games.query.get(game_id)
    if not game:
        return jsonify({'error': 'Game not found'}), 404

    positions = Positions.query.filter_by(game_id=game_id).order_by(Positions.id).all()
    positions_data = [{
        'white_bitboard': position.white_bitboard,
        'black_bitboard': position.black_bitboard
    } for position in positions]
    return jsonify({'positions': positions_data})