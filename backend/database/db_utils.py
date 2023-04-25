from app import db
from .models import Users, Games, Positions

def get_user_id(username):
    user = Users.query.filter_by(username=username).first()
    if user:
        return user.id
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