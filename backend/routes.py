from flask import send_from_directory, render_template, jsonify, request
import os
from app import app
from auth import get_username_from_token, create_encoded_token
from utils import users_in_lobby
from werkzeug.security import generate_password_hash, check_password_hash
from database.models import Users
from app import db
from sqlalchemy import text


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


@app.route('/api/positions/<white_bitboard>/<black_bitboard>', methods=['GET'])
def get_position_info(white_bitboard, black_bitboard):
    query = text("""
        WITH next_positions AS (
  SELECT p1.white_bitboard AS white_bb, p1.black_bitboard AS black_bb, p1.game_id AS game_id
  FROM positions p1
  JOIN positions p2 ON p1.prev_position = p2.id
  WHERE p2.white_bitboard = :white_bitboard AND p2.black_bitboard = :black_bitboard
)
SELECT 
  white_bb, 
  black_bb, 
  COUNT(*) AS times_reached, 
  SUM(CASE WHEN g.winner_id = g.white_id THEN 1 ELSE 0 END) AS white_wins,
  SUM(CASE WHEN g.winner_id = g.black_id THEN 1 ELSE 0 END) AS black_wins
FROM next_positions
JOIN games g ON g.id = next_positions.game_id
GROUP BY white_bb, black_bb
ORDER BY times_reached DESC;

    """)

    result = db.session.execute(
        query, {"white_bitboard":white_bitboard, "black_bitboard":black_bitboard})
    next_positions_info = [
        {
            'white_bb': row[0],
            'black_bb': row[1],
            'times_reached': row[2],
            'white_wins': row[3],
            'black_wins': row[4],
        } for row in result
    ]
    #for x in next_positions_info:
    #    print(x)

    response = {
        'next_positions': next_positions_info
    }
    return jsonify(response), 200
