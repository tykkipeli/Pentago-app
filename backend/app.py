from flask import Flask
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from os import getenv
from dotenv import load_dotenv

load_dotenv()

#run app with this command: 
#gunicorn --worker-class geventwebsocket.gunicorn.workers.GeventWebSocketWorker -w 1 wsgi:app

app = Flask(__name__, static_folder='../frontend/build', template_folder='../frontend/build')
app.secret_key = getenv("SECRET_KEY")
app.config["SQLALCHEMY_DATABASE_URI"] = getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

env = getenv('FLASK_ENV')
if env == 'production':
    cors_origins = ["https://pentagopark.com", "https://www.pentagopark.com"]
else:
    cors_origins = "*"

socketio = SocketIO(app, cors_allowed_origins=cors_origins, async_mode='gevent')

from routes import *
from socket_events import *

if __name__ == "__main__":
    socketio.run(app)



