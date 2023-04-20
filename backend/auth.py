import jwt
from os import getenv

def get_username_from_token(token):
    try:
        decoded_token = jwt.decode(token, getenv("JWT_SECRET"), algorithms=["HS256"])
        return decoded_token["username"]
    except jwt.InvalidTokenError:
        return None
    
def create_encoded_token(username):
    return jwt.encode({"username": username}, getenv("JWT_SECRET"), algorithm="HS256")