from flask import request
from flask_socketio import join_room, leave_room, emit
from app import socketio
from auth import get_username_from_token
from utils import users_in_lobby, challenges, sid_to_username, get_sid_by_username
import time
import random

games = {}  # Store the current games

@socketio.on('join_game')
def on_join_game(data):
    game_id = data['gameID']
    username = data['username']
    join_room(game_id)

    if game_id not in games:
        games[game_id] = {
            'players': [],
            'currentPlayer': None,
            'board': [['' for _ in range(6)] for _ in range(6)],
        }

    game = games[game_id]
    player_count = len(game['players'])

    if player_count < 2:
        player_info = {
            'sid': request.sid,
            'username': username,
            'symbol': 1 if player_count == 0 else 2,
        }
        game['players'].append(player_info)

        if player_count == 1:
            starting_player = random.choice(game['players'])
            game['currentPlayer'] = starting_player
            emit('game_info', {'startingPlayer': starting_player['username']}, room=game_id)

    else:
        emit('error', {'message': 'Game is full'}, room=request.sid)



@socketio.on('leave_game')
def on_leave_game(data):
    game_id = data['gameID']
    leave_room(game_id)

    # Cleanup the game state when both players leave
    if game_id in games:
        del games[game_id]

# Function to print the game board
def print_game_board(board):
    for row in board:
        rivi = ""
        for x in row:
            if x == "":
                rivi += " "
            else:
                rivi += str(x)
            rivi += "|"
        print(rivi)
    print()


# Function to rotate a quadrant in the specified direction
def rotate_quadrant_server(board, quadrant, direction):
    start_row = 0 if quadrant < 2 else 3
    start_col = 0 if quadrant % 2 == 0 else 3

    quadrant_data = [row[start_col:start_col + 3] for row in board[start_row:start_row + 3]]

    rotated_quadrant = []
    if direction == 'ccw':
        rotated_quadrant = [[quadrant_data[j][2 - i] for j in range(3)] for i in range(3)]
    elif direction == 'cw':
        rotated_quadrant = [[quadrant_data[2 - j][i] for j in range(3)] for i in range(3)]

    new_board = board.copy()
    for i in range(3):
        for j in range(3):
            new_board[start_row + i][start_col + j] = rotated_quadrant[i][j]

    return new_board

@socketio.on('make_move')
def on_make_move(data):
    game_id = data['gameID']
    move = data['move']

    if game_id in games:
        game = games[game_id]
        current_player = game['currentPlayer']
        player_index = None

        for i, player in enumerate(game['players']):
            if player['sid'] == request.sid:
                player_index = i
                break
        print("player", game['players'][player_index]["username"], "trying to make a move")
        print("the move is", move)
        print("is_valid_move", is_valid_move(move, game))
        if player_index is not None:
            # Validate the move and turn order
            if is_valid_move(move, game) and current_player == game['players'][player_index]:
                print("move emitted", move)
                emit('opponent_move', move, room=game_id, include_self=False)

                # Update the game position
                row, col = move['placement']['row'], move['placement']['col']
                game['board'][row][col] = game['players'][player_index]['symbol']

                # Perform the rotation
                quadrant = move['rotation']['quadrant']
                direction = move['rotation']['direction']
                game['board'] = rotate_quadrant_server(game['board'], quadrant, direction)

                # Switch the current player
                next_player_index = (player_index + 1) % 2
                game['currentPlayer'] = game['players'][next_player_index]

                is_over, winner = is_game_over(game['board'])
                if is_over:
                    result = {'winner': winner} if winner else {'draw': True}
                    emit('game_over', result, room=game_id)
        print("currentPlayer:", game['currentPlayer']['username'])
        print_game_board(game['board'])


def is_game_over(board):
    # Check rows
    for row in board:
        for i in range(2):
            if row[i:i+5] == [row[i]] * 5 and row[i] != '':
                return True, row[i]

    # Check columns
    for col in range(6):
        for row in range(2):
            if all(board[row+i][col] == board[row][col] for i in range(5)) and board[row][col] != '':
                return True, board[row][col]

    # Check main diagonals
    for row in range(2):
        for col in range(2):
            if all(board[row+i][col+i] == board[row][col] for i in range(5)) and board[row][col] != '':
                return True, board[row][col]

    # Check secondary diagonals
    for row in range(2):
        for col in range(4, 6):
            if all(board[row+i][col-i] == board[row][col] for i in range(5)) and board[row][col] != '':
                return True, board[row][col]

    # Check for a draw
    for row in board:
        for cell in row:
            if cell == '':
                return False, None

    return True, None  # Draw



def is_valid_move(move, game):
    board = game['board']
    placement = move['placement']
    row, col = placement['row'], placement['col']

    # Check if the cell is empty
    if board[row][col] == '':
        return True
    return False
