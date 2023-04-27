from flask import request
from flask_socketio import join_room, leave_room, emit
from app import socketio
from auth import get_username_from_token
from utils import sid_to_username
from .game_data import games, create_new_game, game_rooms, games_lock, game_rooms_lock
from threading import Lock
from .game_logic import is_valid_move, update_game_position, switch_current_player, check_game_over, find_player_index, is_current_player, game_end
from .game_database import store_game_result
from .game_background import update_player_times, background_task
import time


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
                    emit('opponent_move', move, room=game_id, include_self=False)
                    update_game_position(game, move, player_index)
                    switch_current_player(game, player_index)
                    print(game['playerTimes'])
                    emit("player_times_after_move", game["playerTimes"], room=game_id)
                    check_game_over(game, game_id)
                    print(game['board'])
                    print(game['board_history'])


def handle_game_disconnect(sid):
    with games_lock:
        for game_id, game in games.items():
            player = next((player for player in game["players"] if player.get("sid") == sid), None)
            if player:
                result = {'disconnected': player['username']}
                game_end(game_id, result, 'disconnection')
                break
    with game_rooms_lock:
        for game_id, room in list(game_rooms.items()):
            username = sid_to_username.get(sid)
            if username in room['players']:
                room['players'].remove(player)
                if not room['players']:
                    del game_rooms[game_id]

socketio.start_background_task(background_task)