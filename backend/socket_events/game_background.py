from gevent import sleep
from .game_data import games, games_lock, game_rooms_lock
from .game_logic import game_end
import time

#return True if player lost on time
def update_player_times(game_id, lock_acquired=False):
    if not lock_acquired:
        with games_lock:
            return _update_player_times(game_id)
    else:
        return _update_player_times(game_id)

def _update_player_times(game_id):
    if game_id in games:
        game = games[game_id]
        if game['currentPlayer'] is None:
            return

        # Calculate the time difference
        current_time = time.time()
        time_difference = current_time - game["lastMoveTimestamp"]
        game["lastMoveTimestamp"] = current_time

        # Update the player time
        player_symbol = game['currentPlayer']
        game["playerTimes"][player_symbol] -= time_difference

        # Check for time running out
        if game["playerTimes"][player_symbol] <= 0:
            winner_symbol = 1 if player_symbol == 2 else 2
            result = {'winner': winner_symbol}
            game_end(game_id, result, 'time_out')
            return True
    return False

def background_task():
    while True:
        for game_id in list(games.keys()):
            update_player_times(game_id, games_lock)
        sleep(1)