import random
import time
from bitboard import board_to_bitboards
from threading import Lock

games = {}
game_rooms = {}  # key: game_id, value: {'players': [player1, player2]}
games_lock = Lock()
game_rooms_lock = Lock()

def create_new_game(game_id, player1_username, player2_username, game_duration=600):
    player_order = [player1_username, player2_username]
    #random.shuffle(player_order)
    initial_board = [[0 for _ in range(6)] for _ in range(6)]
    white_bitboard, black_bitboard = board_to_bitboards(initial_board)
    return {
        'players': [
            create_player_info(None, player_order[0], 1),
            create_player_info(None, player_order[1], 2),
        ],
        'currentPlayer': 1,
        'board': initial_board,
        'board_history': [(white_bitboard, black_bitboard)],
        'playerTimes': {1: game_duration, 2: game_duration},
        'lastMoveTimestamp': time.time(),
    }

def create_player_info(request_sid, username, symbol):
    return {
        'sid': request_sid,
        'username': username,
        'symbol': symbol,
    }