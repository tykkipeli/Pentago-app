from flask import request
from flask_socketio import join_room, leave_room, emit
from app import socketio
from auth import get_username_from_token
from utils import users_in_lobby, challenges, sid_to_username, get_sid_by_username
import time
import random


@socketio.on("connect")
def on_connect():
    token = request.args.get("token")
    username = get_username_from_token(token)
    if not username:
        return False  # Reject the connection
    print("User", username, "connected")
    sid_to_username[request.sid] = username

@socketio.on("request_users")
def on_request_users():
    emit("users", list(users_in_lobby))

@socketio.on("join_lobby")
def on_join_lobby():
    username = sid_to_username.get(request.sid)
    if username and username not in users_in_lobby:
        join_room("lobby")
        users_in_lobby.add(username)
        emit("user_joined", username, room="lobby", broadcast=True)

@socketio.on("leave_lobby")
def on_leave_lobby(user=None):
    username = sid_to_username.get(request.sid)
    if not user:
        user = username
    if user and user in users_in_lobby:
        leave_room("lobby")
        users_in_lobby.remove(user)
        emit("user_left", user, room="lobby", broadcast=True)

@socketio.on("disconnect")
def on_disconnect():
    username = sid_to_username.get(request.sid)
    if username and username in users_in_lobby:
        on_leave_lobby(username)
    if username in challenges:
        challenged_username = challenges.get(username)
        challenged_sid = get_sid_by_username(challenged_username)
        emit("challenge_canceled", room=challenged_sid)
        del challenges[username]
    if request.sid in sid_to_username:
        del sid_to_username[request.sid]

@socketio.on("challenge")
def on_challenge(challenged_username):
    challenger_username = sid_to_username.get(request.sid)
    challenged_sid = get_sid_by_username(challenged_username)
    if not challenged_sid:
        return
    # Check if the challenger is already challenging someone or being challenged by someone
    if challenger_username in challenges or any(challenger_username in v for v in challenges.values()):
        emit("challenge_error", f"You are already involved in a challenge.", room=request.sid)
        return
    # Check if the challenged user is already being challenged or challenging someone
    if challenged_username in challenges or any(challenged_username in v for v in challenges.values()):
        emit("challenge_error", f"{challenged_username} is already involved in a challenge.", room=request.sid)
        return
    challenges[challenger_username] = challenged_username
    emit("challenge_received", challenger_username, room=challenged_sid)


@socketio.on("accept_challenge")
def on_accept_challenge():
    challenged_username = sid_to_username.get(request.sid)
    challenger_username = next((k for k, v in challenges.items() if v == challenged_username), None)
    if challenger_username:
        challenger_sid = get_sid_by_username(challenger_username)

        game_room = f"{challenger_username}-{challenged_username}"
        join_room(game_room, sid=challenger_sid)
        join_room(game_room, sid=request.sid)

        # Generate a unique game ID (use a more robust method for real-world applications)
        game_id = f"{challenger_username}-{challenged_username}-{time.time()}"

        # Notify both players that the game has started
        emit("game_started", {"player1": challenger_username, "player2": challenged_username, "gameID": game_id}, room=game_room)

        del challenges[challenger_username]



@socketio.on("reject_challenge")
def on_reject_challenge():
    challenged_username = sid_to_username.get(request.sid)
    challenger_username = next((k for k, v in challenges.items() if v == challenged_username), None)

    if challenger_username:
        challenger_sid = get_sid_by_username(challenger_username)
        emit("challenge_result", "rejected", room=challenger_sid)
        emit("challenge_rejected", room=request.sid)
        del challenges[challenger_username]

@socketio.on("cancel_challenge")
def on_cancel_challenge():
    challenger_username = sid_to_username.get(request.sid)
    challenged_username = challenges.get(challenger_username)

    if challenged_username:
        challenged_sid = get_sid_by_username(challenged_username)
        emit("challenge_canceled", room=challenged_sid)
        del challenges[challenger_username]