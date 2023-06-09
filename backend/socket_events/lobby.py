from flask import request
from flask_socketio import join_room, leave_room, emit, disconnect
from app import socketio
from auth import get_username_from_token
from utils import users_in_lobby, challenges, sid_to_username, get_sid_by_username, lobby_lock, valid_game_time
import time
import random
import bleach
from .game_data import games, create_new_game, game_rooms
from .game_socket import remove_user_from_game
from database.db_utils import get_user_object

@socketio.on("connect")
def on_connect():
    token = request.args.get("token")
    username = get_username_from_token(token)
    if not username:
        return False  # Reject the connection
    # if the user is already connected, disconnect the old socket
    for old_sid, old_username in sid_to_username.items():
        if old_username == username:
            handle_disconnect(old_sid)
            socketio.server.disconnect(old_sid)
            break
    # add the new socket id to the dictionary
    sid_to_username[request.sid] = username

@socketio.on("request_users")
def on_request_users():
    with lobby_lock:
        emit("users", [user for user in users_in_lobby])

@socketio.on("join_lobby")
def on_join_lobby():
    username = sid_to_username.get(request.sid)
    user = get_user_object(username)
    with lobby_lock:
        if username and not any(u['username'] == username for u in users_in_lobby):
            join_room("lobby")
            users_in_lobby.append(user)
            emit("user_joined", user, room="lobby", broadcast=True)

@socketio.on("leave_lobby")
def on_leave_lobby(username=None):
    username = sid_to_username.get(request.sid, username)
    with lobby_lock:
        remove_user_from_challenges(username)
        user_to_remove = next((u for u in users_in_lobby if u['username'] == username), None)
        if user_to_remove:
            leave_room("lobby")
            users_in_lobby.remove(user_to_remove)
            emit("user_left", username, room="lobby", broadcast=True)

def remove_user_from_challenges(username):
    if username in challenges:
        challenged_username = challenges[username]["challenged"]
        challenged_sid = get_sid_by_username(challenged_username)
        socketio.emit("challenge_canceled", room=challenged_sid)
        del challenges[username]
    challenged_by = [challenger for challenger, challenged_data in challenges.items() if challenged_data["challenged"] == username]
    if challenged_by:
        challenger_username = challenged_by[0]
        challenger_sid = get_sid_by_username(challenger_username)
        socketio.emit("challenge_rejected", room=challenger_sid)
        del challenges[challenger_username]

def handle_disconnect(sid):
    # Lobby-related disconnection handling
    username = sid_to_username.get(sid)
    #user_to_remove = next((u for u in users_in_lobby if u['username'] == username), None)
    on_leave_lobby(username)
    # Game-related disconnection handling
    remove_user_from_game(sid)
    # remove socket id:
    if sid in sid_to_username:
        del sid_to_username[sid]

@socketio.on('disconnect')
def on_disconnect():
    handle_disconnect(request.sid)


#TODO validate game_time
@socketio.on("challenge")
def on_challenge(data):
    challenged_username = data["challenged_username"]
    game_time = data["game_time"]
    if not valid_game_time(game_time):
        return
    with lobby_lock:
        challenger_username = sid_to_username.get(request.sid)
        challenged_sid = get_sid_by_username(challenged_username)
        if not challenged_sid:
            return
        # Check if the challenger is already challenging someone or being challenged by someone
        if challenger_username in challenges or any(challenger_username in v["challenged"] for v in challenges.values()):
            emit("challenge_error",
                f"You are already involved in a challenge.", room=request.sid)
            return
        # Check if the challenged user is already being challenged or challenging someone
        if challenged_username in challenges.values() or any(challenged_username in v["challenged"] for v in challenges.values()):
            emit("challenge_error",
                f"{challenged_username} is already involved in a challenge.", room=request.sid)
            return
        if challenger_username == challenged_username:
            emit("challenge_error",
                f"You cannot challenge yourself", room=request.sid)
            return
        if not players_in_same_room(challenger_username, challenged_username):
            emit("challenge_error",
                f"Players are not in the same room", room=request.sid)
            return
        if players_in_ongoing_game(challenger_username, challenged_username):
            emit("challenge_error",
                f"Players are already in an ongoing game", room=request.sid)
            return
        challenges[challenger_username] = {"challenged": challenged_username, "time": game_time}
        emit("challenge_received", {"challenger": challenger_username, "time": game_time}, room=challenged_sid)


def players_in_ongoing_game(challenger_username, challenged_username):
    game_id = get_game_room(challenger_username, challenged_username)
    return game_id and game_id in games

def players_in_same_room(challenger_username, challenged_username):
    if get_game_room(challenger_username, challenged_username) is not None:
        return True
    if any(u['username'] == challenger_username for u in users_in_lobby) and any(u['username'] == challenged_username for u in users_in_lobby):
        return True
    return False

def get_game_room(challenger_username, challenged_username):
    for key, game_room in game_rooms.items():
        if challenger_username in game_room['players'] and challenged_username in game_room['players']:
            return key
    return None

@socketio.on("accept_challenge")
def on_accept_challenge():
    challenged_username = sid_to_username.get(request.sid)
    with lobby_lock:
        challenger_username = next((k for k, v in challenges.items() if v["challenged"] == challenged_username), None)
        if challenger_username:
            challenge_data = challenges[challenger_username]
            challenger_sid = get_sid_by_username(challenger_username)
            game_id = get_game_room(challenger_username, challenged_username)
            if not game_id:
                # Generate a unique game ID (use a more robust method for real-world applications)
                game_id = f"{challenger_username}-{challenged_username}-{time.time()}"
                join_room(game_id, sid=challenger_sid)
                join_room(game_id, sid=request.sid)
                # Notify both players that the game has started
                # Create a new game and get the randomized player order
                players = [challenger_username, challenged_username]
                random.shuffle(players)
                game_rooms[game_id] = {
                    'players': players,
                    'time': challenge_data['time'],
                }
            else:
                #switch player colors in rematch games:
                game_rooms[game_id]['players'].reverse()
            game = create_new_game(
                game_id, game_rooms[game_id]['players'][0], game_rooms[game_id]['players'][1], game_rooms[game_id]['time'])
            games[game_id] = game
            # Notify both players that the game has started
            emit("game_started", {
                "player1": game['players'][0]['username'],
                "player2": game['players'][1]['username'],
                "gameID": game_id}, room=game_id)
            del challenges[challenger_username]


@socketio.on("reject_challenge")
def on_reject_challenge():
    challenged_username = sid_to_username.get(request.sid)
    with lobby_lock:
        challenger_username = next((k for k, v in challenges.items() if v["challenged"] == challenged_username), None)

        if challenger_username:
            challenger_sid = get_sid_by_username(challenger_username)
            emit("challenge_rejected", room=challenger_sid)
            del challenges[challenger_username]

@socketio.on("cancel_challenge")
def on_cancel_challenge():
    challenger_username = sid_to_username.get(request.sid)
    with lobby_lock:
        challenged_data = challenges.get(challenger_username)

        if challenged_data:
            challenged_username = challenged_data["challenged"]
            challenged_sid = get_sid_by_username(challenged_username)
            emit("challenge_canceled", room=challenged_sid)
            del challenges[challenger_username]

@socketio.on("send_message")
def on_send_message(data):
    message = data["message"]
    if message == 'test':
        print("game_rooms", game_rooms)
        print("challenges", challenges)
        print("users in lobby", users_in_lobby)
        print("games", games)
    room = data.get("room", "lobby")
    username = sid_to_username.get(request.sid)
    # Check if the player is in the game room
    if room != "lobby":
        if not room in game_rooms or not username in game_rooms[room]['players']:
            return
    if not username or not message:
        return
    message = message[:200]
    # Sanitize the message input
    cleaned_message = bleach.clean(message, tags=[], strip=True)
    emit("message", {"username": username, "text": cleaned_message}, room=room)
