import datetime
from database.db_utils import store_game_to_db, store_position_to_db, get_user_id

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

def find_player_indeces(game, result):
    white_id = get_user_id(next(player["username"] for player in game["players"] if player["symbol"] == 1))
    black_id = get_user_id(next(player["username"] for player in game["players"] if player["symbol"] == 2))
    if "winner" in result:
        winner_id = get_user_id(next(player["username"] for player in game["players"] if player["symbol"] == result["winner"]))
    else:
        winner_id = None
    return white_id, black_id, winner_id
