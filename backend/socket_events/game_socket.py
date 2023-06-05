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
from database.db_utils import get_user_rating
import time


def is_authenticated(sid):
    return sid in sid_to_username

@socketio.on('join_game')
def on_join_game(data):
    if not is_authenticated(request.sid):
        return emit('error', {'message': 'Not authenticated'}, room=request.sid)
    game_id = data['gameID']
    username = sid_to_username[request.sid]
    #print(username, "joined the game")
    with games_lock:
        if game_id not in games:
            return emit('error', {'message': 'Game not found'}, room=request.sid)
        game = games[game_id]
        player_info = next((player for player in game['players'] if player['username'] == username), None)
        if player_info is None:
            return emit('error', {'message': 'Player not found in the game'}, room=request.sid)
        if player_info['sid'] == request.sid:
            return emit('error', {'message': 'Player has already joined the game'}, room=request.sid)
        player_info['sid'] = request.sid
        join_room(game_id)
        if all(player.get('sid') is not None for player in game['players']):
            game['lastMoveTimestamp'] = time.time()
            starting_player = next(player for player in game['players'] if player['symbol'] == game['currentPlayer'])
            other_player = next(player for player in game['players'] if player['symbol'] != game['currentPlayer'])
            player1_rating = get_user_rating(starting_player['username'])
            player2_rating = get_user_rating(other_player['username'])
            #print("starting game")
            #print(starting_player['username'], player1_rating)
            #print(other_player['username'], player2_rating)
            emit('game_info', {
                'startingPlayer': starting_player['username'],
                'otherPlayer': other_player['username'],
                'playerTimes': game['playerTimes'],
                'player1Rating': player1_rating,
                'player2Rating': player2_rating,
                'timestamp': time.time()}, 
                room=game_id)

@socketio.on('leave_game')
def on_leave_game(data):
    remove_user_from_game(request.sid)

def remove_user_from_game(sid):
    with games_lock:
        for game_id, game in games.items():
            player = next((player for player in game["players"] if player.get("sid") == sid), None)
            if player:
                winner_symbol = 1 if player['symbol'] == 2 else 2
                result = {'winner': winner_symbol}
                game_end(game_id, result, 'disconnection')
                break
    with game_rooms_lock:
        for game_id, room in list(game_rooms.items()):
            username = sid_to_username.get(sid)
            if username in room['players']:
                leave_room(game_id, sid=sid)
                socketio.emit("user_left_game", username, room=game_id, include_self=False)
                if username in room['players']:
                    #print("removing username from room")
                    room['players'].remove(username)
                if not room['players']:
                    #print("delete game_room")
                    del game_rooms[game_id]

def is_authenticated_for_game(sid, game_id):
    if game_id not in games:
        return False
    game = games[game_id]
    player_index = find_player_index(game, sid)
    if player_index is None:
        return False
    return True

def is_authenticated_to_make_move(sid, game_id):
    if game_id not in games:
        return False
    game = games[game_id]
    player_index = find_player_index(game, sid)
    if player_index is None:
        return False
    if not is_current_player(game, player_index):
        return False
    return True

@socketio.on('make_move')
def on_make_move(data):
    game_id = data['gameID']
    move = data['move']
    with games_lock:
        if not is_authenticated_to_make_move(request.sid, game_id):
            return
        game = games[game_id]
        player_index = find_player_index(game, request.sid)
        if is_valid_move(move, game):
            if update_player_times(game_id, lock_acquired=True):
                return
            emit('opponent_move', move, room=game_id, include_self=False)
            update_game_position(game, move, player_index)
            switch_current_player(game, player_index)
            #print(game['playerTimes'])
            emit("player_times_after_move", {
                'playerTimes': game["playerTimes"],
                'timestamp': time.time()},
                room=game_id)
            check_game_over(game, game_id)
            #print(game['board'])
            #print(game['board_history'])

@socketio.on('resign')
def on_resign(data):
    game_id = data['gameID']
    with games_lock:
        if not is_authenticated_for_game(request.sid, game_id):
            return emit('error', {'message': 'Not authenticated'}, room=request.sid)
        game = games[game_id]
        player_index = find_player_index(game, request.sid)
        winner_symbol = 1 if game['players'][player_index]['symbol'] == 2 else 2
        result = {'winner': winner_symbol}
        game_end(game_id, result, 'resignation')


socketio.start_background_task(background_task)