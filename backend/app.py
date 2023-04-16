from flask import Flask, render_template, send_from_directory, jsonify, request
from flask_socketio import SocketIO, join_room, leave_room, emit
from os import getenv
import os
import time
from dotenv import load_dotenv
import jwt

#run app with this command: 
#gunicorn --worker-class geventwebsocket.gunicorn.workers.GeventWebSocketWorker -w 1 wsgi:app

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__, static_folder='../frontend/build', template_folder='../frontend/build')
app.secret_key = getenv("SECRET_KEY")
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='gevent')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return render_template("index.html")

@app.route("/api/login", methods=["POST"])
def login():
    username = request.form["username"]
    password = request.form["password"]
    # TODO: check username and password

    token = jwt.encode({"username": username}, getenv("JWT_SECRET"), algorithm="HS256")
    return jsonify({"status": "success", "token": token})

@app.route("/api/logout", methods=["POST"])
def logout():
    # Logout is handled client-side
    return jsonify({"status": "success"})

users_in_lobby = set()

@app.route('/api/users')
def users():
    return jsonify({"users": list(users_in_lobby)})

def get_username_from_token(token):
    try:
        decoded_token = jwt.decode(token, getenv("JWT_SECRET"), algorithms=["HS256"])
        return decoded_token["username"]
    except jwt.InvalidTokenError:
        return None

# WebSocket events
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

challenges = {}
sid_to_username = {}

@socketio.on("challenge")
def on_challenge(challenged_username):
    challenger_username = sid_to_username.get(request.sid)
    challenged_sid = get_sid_by_username(challenged_username)

    if challenged_sid:
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

def get_sid_by_username(username):
    for sid, user in sid_to_username.items():
        if user == username:
            return sid
    return None

if __name__ == "__main__":
    socketio.run(app)
