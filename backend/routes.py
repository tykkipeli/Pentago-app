from flask import send_from_directory, render_template, jsonify, request, url_for
import os
from app import app
from auth import get_username_from_token, create_encoded_token
from utils import users_in_lobby
from werkzeug.security import generate_password_hash, check_password_hash
from database.models import Users, Games
from sqlalchemy.sql.expression import or_, and_
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
        query, {"white_bitboard": white_bitboard, "black_bitboard": black_bitboard})
    next_positions_info = [
        {
            'white_bb': row[0],
            'black_bb': row[1],
            'times_reached': row[2],
            'white_wins': row[3],
            'black_wins': row[4],
        } for row in result
    ]
    # for x in next_positions_info:
    #    print(x)

    response = {
        'next_positions': next_positions_info
    }
    return jsonify(response), 200


@app.route('/api/rankings', methods=['GET'])
def get_users():
    offset = int(request.args.get('offset', 0))
    limit = int(request.args.get('limit', 10))
    users = Users.query.order_by(Users.rating.desc(), Users.id).offset(
        offset).limit(limit).all()
    return jsonify([user.to_dict() for user in users])


@app.route('/api/profile/<username>', methods=['GET'])
def get_profile(username):
    user = Users.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    games_played = Games.query.filter(
        or_(Games.black_id == user.id, Games.white_id == user.id)).count()
    white_games = Games.query.filter(Games.white_id == user.id).count()
    black_games = games_played - white_games
    wins_as_white = Games.query.filter(
        and_(Games.white_id == user.id, Games.winner_id == user.id)).count()
    wins_as_black = Games.query.filter(
        and_(Games.black_id == user.id, Games.winner_id == user.id)).count()
    wins = wins_as_white + wins_as_black
    draws_as_white = Games.query.filter(
        and_(Games.white_id == user.id, Games.winner_id == None)).count()
    draws_as_black = Games.query.filter(
        and_(Games.black_id == user.id, Games.winner_id == None)).count()
    draws = draws_as_black + draws_as_white
    losses = games_played - wins - draws
    losses_as_white = white_games - wins_as_white - draws_as_white
    losses_as_black = black_games - wins_as_black - draws_as_black

    last_played_game = Games.query.filter(or_(
        Games.black_id == user.id, Games.white_id == user.id)).order_by(Games.date.desc()).first()
    last_played_date = last_played_game.date if last_played_game else None

    profile_data = {
        "username": user.username,
        "rating": user.rating,
        "games_played": games_played,
        "wins": wins,
        "losses": losses,
        "draws": draws,
        "last_played_date": last_played_date,
        "wins_as_white": wins_as_white,
        "wins_as_black": wins_as_black,
        "losses_as_white": losses_as_white,
        "losses_as_black": losses_as_black,
        "draws_as_white": draws_as_white,
        "draws_as_black": draws_as_black
    }

    return jsonify(profile_data)


@app.route('/api/profile/<username>/games', methods=['GET'])
def get_recent_games(username):
    user = Users.query.filter_by(username=username).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    page = request.args.get('page', 1, type=int)
    items_per_page = 10
    offset = (page - 1) * items_per_page
    games = Games.query.filter(
        (Games.white_id == user.id) | (Games.black_id == user.id)
    ).order_by(Games.date.desc()).offset(offset).limit(items_per_page).all()

    total_games = Games.query.filter(
        (Games.white_id == user.id) | (Games.black_id == user.id)
    ).count()
    has_next = (page * items_per_page) < total_games
    has_prev = page > 1

    next_url = url_for('get_recent_games', username=username, page=page + 1) if has_next else None
    prev_url = url_for('get_recent_games', username=username, page=page - 1) if has_prev else None

    game_data = [{
        'id': game.id,
        'white_username': game.white.username,
        'black_username': game.black.username,
        'move_count': game.move_count,
        'result': game_result(game),
        'date': game.date
    } for game in games]

    return jsonify({
        'games': game_data,
        'next_url': next_url,
        'prev_url': prev_url
    })



def game_result(game):
    if game.winner_id is None:
        return '1/2-1/2'
    elif game.winner_id == game.white_id:
        return '1-0'
    else:
        return '0-1'
