from flask import Flask
from flask_socketio import SocketIO
from os import getenv
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder='../frontend/build', template_folder='../frontend/build')
app.secret_key = getenv("SECRET_KEY")
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='gevent')

from routes import *
from socket_events import *

if __name__ == "__main__":
    socketio.run(app)
