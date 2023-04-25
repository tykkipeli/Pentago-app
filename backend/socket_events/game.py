from flask import request
from flask_socketio import join_room, leave_room, emit
from app import socketio
from auth import get_username_from_token
from utils import print_game_board, rotate_quadrant, is_game_over_on_board, is_valid_move, sid_to_username
import time
import random
from gevent import sleep
from .game_data import games, create_new_game
from threading import Lock
from bitboard import board_to_bitboards
import datetime
from database.db_utils import store_game_to_db, store_position_to_db, get_user_id

games_lock = Lock()

def is_authenticated(sid):
    return sid in sid_to_username

@socketio.on('join_game')
def on_join_game(data):
    if not is_authenticated(request.sid):
        return emit('error', {'message': 'Not authenticated'}, room=request.sid)
    game_id = data['gameID']
    username = sid_to_username[request.sid]
    join_room(game_id)
    print(username, "joined the game")
    with games_lock:
        if game_id not in games:
            return emit('error', {'message': 'Game not found'}, room=request.sid)
        game = games[game_id]
        player_info = next((player for player in game['players'] if player['username'] == username), None)
        if player_info is None:
            return emit('error', {'message': 'Player not found in the game'}, room=request.sid)
        player_info['sid'] = request.sid
        if all(player.get('sid') is not None for player in game['players']):
            game['lastMoveTimestamp'] = time.time()
            starting_player = next(player for player in game['players'] if player['symbol'] == game['currentPlayer'])
            emit('game_info', {
                'startingPlayer': starting_player['username'],
                'playerTimes': game['playerTimes']}, room=game_id)

@socketio.on('leave_game')
def on_leave_game(data):
    if not is_authenticated(request.sid):
        return emit('error', {'message': 'Not authenticated'}, room=request.sid)
    game_id = data['gameID']
    username = sid_to_username[request.sid]
    with games_lock:
        if game_id not in games:
            return emit('error', {'message': 'Game not found'}, room=request.sid)
        game = games[game_id]
        player_index = find_player_index(game, request.sid)
        if player_index is None:
            return emit('error', {'message': 'Player not found in the game'}, room=request.sid)
        leave_room(game_id)
        game['players'][player_index]['sid'] = None
        if all(player.get('sid') is None for player in game['players']):
            del games[game_id]

@socketio.on('make_move')
def on_make_move(data):
    game_id = data['gameID']
    move = data['move']
    with games_lock:
        if game_id in games:
            game = games[game_id]
            player_index = find_player_index(game, request.sid)

            if player_index is not None:
                if is_valid_move(move, game) and is_current_player(game, player_index):
                    if update_player_times(game_id, lock_acquired=True):
                        return
                    emit_opponent_move(game_id, move)
                    update_game_position(game, move, player_index)
                    switch_current_player(game, player_index)
                    print(game['playerTimes'])
                    emit("player_times_after_move", game["playerTimes"], room=game_id)
                    check_game_over(game, game_id)
                    print(game['board'])
                    print(game['board_history'])


def find_player_index(game, request_sid):
    for i, player in enumerate(game['players']):
        if player['sid'] == request_sid:
            return i
    return None


def emit_opponent_move(game_id, move):
    emit('opponent_move', move, room=game_id, include_self=False)


def update_game_position(game, move, player_index):
    row, col = move['placement']['row'], move['placement']['col']
    game['board'][row][col] = game['players'][player_index]['symbol']
    perform_rotation(game, move)
    white_bitboard, black_bitboard = board_to_bitboards(game['board'])
    game['board_history'].append((white_bitboard, black_bitboard))

def perform_rotation(game, move):
    quadrant = move['rotation']['quadrant']
    direction = move['rotation']['direction']
    game['board'] = rotate_quadrant(game['board'], quadrant, direction)

def perform_rotation(game, move):
    quadrant = move['rotation']['quadrant']
    direction = move['rotation']['direction']
    game['board'] = rotate_quadrant(game['board'], quadrant, direction)

def is_current_player(game, player_index):
    return game['currentPlayer'] == game['players'][player_index]['symbol']

def switch_current_player(game, player_index):
    next_player_index = (player_index + 1) % 2
    game['currentPlayer'] = game['players'][next_player_index]['symbol']

def check_game_over(game, game_id):
    is_over, winner = is_game_over_on_board(game['board'])
    if is_over:
        result = {'winner': winner} if winner else {'draw': True}
        game_end(game_id, result, 'five_in_a_row')
        return True
    return False

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


#TODO when the game ends, the chat will no work anymore currently because the game gets removed from games dictionary
def game_end(game_id, result, reason):
    socketio.emit('game_over', {**result, 'reason': reason}, room=game_id)
    
    # Add the logic to store the game data in the database
    game = games[game_id]
    white_id = get_user_id(next(player["username"] for player in game["players"] if player["symbol"] == 1))
    black_id = get_user_id(next(player["username"] for player in game["players"] if player["symbol"] == 2))
    
    if "winner" in result:
        winner_id = get_user_id(next(player["username"] for player in game["players"] if player["symbol"] == result["winner"]))
    else:
        winner_id = None

    move_count = sum(1 for row in game["board"] for cell in row if cell != 0)
    date = datetime.datetime.now()

    # Store the game in the games table and get the game_id
    game_db_id = store_game_to_db(white_id, black_id, winner_id, date, move_count)

    # Store the positions in the positions table
    prev_position_id = None
    for board in game["board_history"]:
        white_bitboard, black_bitboard = board
        prev_position_id = store_position_to_db(game_db_id, white_bitboard, black_bitboard, prev_position_id)

    del games[game_id]

def handle_game_disconnect(sid):
    with games_lock:
        for game_id, game in games.items():
            player = next((player for player in game["players"] if player.get("sid") == sid), None)
            if player:
                result = {'disconnected': player['username']}
                game_end(game_id, result, 'disconnection')
                break

def background_task():
    while True:
        for game_id in list(games.keys()):
            update_player_times(game_id)
        sleep(1)

print("This line gets executed")
socketio.start_background_task(background_task)
