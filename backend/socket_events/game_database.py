import datetime
from database.db_utils import store_game_to_db, store_position_to_db, get_user_id, update_user_rating, get_user_rating_and_games_played
from elo import get_new_elo_ratings

def store_game_result(game, result):
    white_id, black_id, winner_id = find_player_indeces(game, result)
    move_count = sum(1 for row in game["board"] for cell in row if cell != 0)
    date = datetime.datetime.now()

    # Store the game in the games table and get the game_id
    game_db_id = store_game_to_db(white_id, black_id, winner_id, date, move_count)

    # Store the positions in the positions table
    prev_position_id = None
    for board in game["board_history"]:
        white_bitboard, black_bitboard = board
        prev_position_id = store_position_to_db(game_db_id, white_bitboard, black_bitboard, prev_position_id)

    # Update player ratings
    return update_ratings(white_id, black_id, winner_id)

def find_player_indeces(game, result):
    white_id = get_user_id(next(player["username"] for player in game["players"] if player["symbol"] == 1))
    black_id = get_user_id(next(player["username"] for player in game["players"] if player["symbol"] == 2))
    if "winner" in result:
        winner_id = get_user_id(next(player["username"] for player in game["players"] if player["symbol"] == result["winner"]))
    else:
        winner_id = None
    return white_id, black_id, winner_id

def update_ratings(white_id, black_id, winner_id):
    white_rating, white_games_played = get_user_rating_and_games_played(white_id)
    black_rating, black_games_played = get_user_rating_and_games_played(black_id)

    if winner_id == white_id:
        outcome = 1
    elif winner_id == black_id:
        outcome = 0
    else:
        outcome = 0.5

    #print(white_id, black_id, winner_id)
    #print(white_rating, black_rating, white_games_played, black_games_played, outcome)
    new_white_rating, new_black_rating = get_new_elo_ratings(
        white_rating, black_rating, white_games_played, black_games_played, outcome
    )
    #print(new_white_rating, new_black_rating)
    update_user_rating(white_id, new_white_rating)
    update_user_rating(black_id, new_black_rating)
    return white_rating, new_white_rating, black_rating, new_black_rating

