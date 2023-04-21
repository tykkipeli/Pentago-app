import random
import time

games = {}

def create_new_game(game_id, player1_username, player2_username, game_duration=10):
    player_order = [player1_username, player2_username]
    random.shuffle(player_order)
    return {
        'players': [
            create_player_info(None, player_order[0], 1),
            create_player_info(None, player_order[1], 2),
        ],
        'currentPlayer': 1,
        'board': [['' for _ in range(6)] for _ in range(6)],
        'playerTimes': {1: game_duration, 2: game_duration},
        'lastMoveTimestamp': time.time(),
    }

def create_player_info(request_sid, username, symbol):
    return {
        'sid': request_sid,
        'username': username,
        'symbol': symbol,
    }