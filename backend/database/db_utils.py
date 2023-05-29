from app import db
from .models import Users, Games, Positions
from utils import generate_symmetrical_positions, generate_reachable_positions, group_next_positions_info, print_bitboard
from sqlalchemy.sql.expression import or_, and_
from sqlalchemy import text
from flask import url_for

def get_user_id(username):
    user = Users.query.filter_by(username=username).first()
    if user:
        return user.id
    return None

def get_user_rating(username):
    user = Users.query.filter_by(username=username).first()
    if user:
        return user.rating
    return None

def store_game_to_db(white_id, black_id, winner_id, date, move_count):
    game = Games(white_id=white_id, black_id=black_id, winner_id=winner_id, date=date, move_count=move_count)
    db.session.add(game)
    db.session.commit()
    return game.id

def store_position_to_db(game_id, white_bitboard, black_bitboard, prev_position_id):
    position = Positions(game_id=game_id, white_bitboard=white_bitboard, black_bitboard=black_bitboard, prev_position=prev_position_id)
    db.session.add(position)
    db.session.commit()
    return position.id

def update_user_rating(user_id, new_rating):
    user = Users.query.get(user_id)
    user.rating = new_rating
    db.session.commit()

def get_user_rating_and_games_played(user_id):
    user = Users.query.get(user_id)
    games_played = (
        Games.query.filter(or_(Games.white_id == user_id, Games.black_id == user_id)).count()
    )
    return user.rating, games_played

def get_users(offset, limit):
    users = Users.query.order_by(Users.rating.desc(), Users.id).offset(
        offset).limit(limit).all()
    return users

def get_profile_data(user):
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
    return profile_data

def get_recent_games_data(user, page, items_per_page):
    offset = (page - 1) * items_per_page
    games = Games.query.filter(
        (Games.white_id == user.id) | (Games.black_id == user.id)
    ).order_by(Games.id.desc()).offset(offset).limit(items_per_page).all()
    total_games = Games.query.filter(
        (Games.white_id == user.id) | (Games.black_id == user.id)
    ).count()
    has_next = (page * items_per_page) < total_games
    has_prev = page > 1
    next_url = url_for('get_recent_games', username=user.username, page=page + 1) if has_next else None
    prev_url = url_for('get_recent_games', username=user.username, page=page - 1) if has_prev else None

    game_data = [{
        'id': game.id,
        'white_username': game.white.username,
        'black_username': game.black.username,
        'move_count': game.move_count,
        'result': game_result(game, user),
        'date': game.date
    } for game in games]
    return game_data, next_url, prev_url

def game_result(game, user):
    if game.winner_id is None:
        return 'draw'
    elif game.winner_id == user.id:
        return 'win'
    else:
        return 'loss'

def generate_sql_query(symmetrical_positions, filters):
    symmetrical_positions_placeholders = ', '.join(
        [f'(:white_bb{i}, :black_bb{i})' for i in range(len(symmetrical_positions))])

    filter_conditions = []
    bind_params = {}
    if filters['usernameWhite']:
        filter_conditions.append("u_white.username = :usernameWhite")
        bind_params['usernameWhite'] = filters['usernameWhite']
    if filters['usernameBlack']:
        filter_conditions.append("u_black.username = :usernameBlack")
        bind_params['usernameBlack'] = filters['usernameBlack']
    if filters['whiteRatingMin']:
        filter_conditions.append("u_white.rating >= :whiteRatingMin")
        bind_params['whiteRatingMin'] = filters['whiteRatingMin']
    if filters['whiteRatingMax']:
        filter_conditions.append("u_white.rating <= :whiteRatingMax")
        bind_params['whiteRatingMax'] = filters['whiteRatingMax']
    if filters['blackRatingMin']:
        filter_conditions.append("u_black.rating >= :blackRatingMin")
        bind_params['blackRatingMin'] = filters['blackRatingMin']
    if filters['blackRatingMax']:
        filter_conditions.append("u_black.rating <= :blackRatingMax")
        bind_params['blackRatingMax'] = filters['blackRatingMax']
    if filters['daysAgo']:
        filter_conditions.append("g.date >= NOW() - INTERVAL '1' DAY * :daysAgo")
        bind_params['daysAgo'] = filters['daysAgo']

    filter_conditions_str = ' AND '.join(filter_conditions)
    if filter_conditions_str:
        filter_conditions_str = f'AND {filter_conditions_str}'

    query = text(f"""
        WITH next_positions AS (
  SELECT p1.white_bitboard AS white_bb, p1.black_bitboard AS black_bb, p1.game_id AS game_id
  FROM positions p1
  JOIN positions p2 ON p1.prev_position = p2.id
  WHERE (p2.white_bitboard, p2.black_bitboard) IN ({symmetrical_positions_placeholders})
)
SELECT 
  white_bb, 
  black_bb, 
  COUNT(*) AS times_reached, 
  SUM(CASE WHEN g.winner_id = g.white_id THEN 1 ELSE 0 END) AS white_wins,
  SUM(CASE WHEN g.winner_id = g.black_id THEN 1 ELSE 0 END) AS black_wins
FROM next_positions
JOIN games g ON g.id = next_positions.game_id
JOIN users u_white ON g.white_id = u_white.id
JOIN users u_black ON g.black_id = u_black.id
WHERE 1=1 {filter_conditions_str}
GROUP BY white_bb, black_bb
ORDER BY times_reached DESC;
    """)
    return query, bind_params

def get_position_info(white_bitboard, black_bitboard, consider_symmetrical, filters):
    symmetrical_positions = generate_symmetrical_positions(
        white_bitboard, black_bitboard) if consider_symmetrical else [(white_bitboard, black_bitboard)]
    query, filter_bind_params = generate_sql_query(symmetrical_positions, filters)

    bind_params = {**filter_bind_params}
    for i, pos in enumerate(symmetrical_positions):
        bind_params[f'white_bb{i}'] = pos[0]
        bind_params[f'black_bb{i}'] = pos[1]

    result = db.session.execute(query, bind_params)

    next_positions_info = [
        {
            'white_bb': row[0],
            'black_bb': row[1],
            'times_reached': row[2],
            'white_wins': row[3],
            'black_wins': row[4],
        } for row in result
    ]
    if consider_symmetrical:
        next_positions_info = group_next_positions_info(next_positions_info, white_bitboard, black_bitboard)

    sorted_next_positions_info = sorted(
        next_positions_info, 
        key=lambda x: x['times_reached'], 
        reverse=True
    )
    return sorted_next_positions_info

