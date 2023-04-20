users_in_lobby = set()
challenges = {}
sid_to_username = {}

def get_sid_by_username(username):
    for sid, user in sid_to_username.items():
        if user == username:
            return sid
    return None
