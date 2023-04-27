from utils import rotate_quadrant, is_game_over_on_board
from bitboard import board_to_bitboards
from .game_data import games
from .game_database import store_game_result
from app import socketio

def is_valid_move(move, game):
    board = game['board']
    placement = move['placement']
    row, col = placement['row'], placement['col']

    # Check if the cell is empty
    if board[row][col] == 0:
        return True
    return False

def update_game_position(game, move, player_index):
    row, col = move['placement']['row'], move['placement']['col']
    game['board'][row][col] = game['players'][player_index]['symbol']
    perform_rotation(game, move)
    white_bitboard, black_bitboard = board_to_bitboards(game['board'])
    game['board_history'].append((white_bitboard, black_bitboard))

def perform_rotation(game, move):
    quadrant = move['rotation']['quadrant']
    direction = move['rotation']['direction']
    game['board'] = rotate_quadrant(game['board'], quadrant, direction)

def switch_current_player(game, player_index):
    next_player_index = (player_index + 1) % 2
    game['currentPlayer'] = game['players'][next_player_index]['symbol']


def check_game_over(game, game_id):
    is_over, winner = is_game_over_on_board(game['board'])
    if is_over:
        result = {'winner': winner} if winner else {'draw': True}
        game_end(game_id, result, 'five_in_a_row')
        return True
    return False

def game_end(game_id, result, reason):
    socketio.emit('game_over', {**result, 'reason': reason}, room=game_id)
    store_game_result(games[game_id], result)
    del games[game_id]

def find_player_index(game, request_sid):
    for i, player in enumerate(game['players']):
        if player['sid'] == request_sid:
            return i
    return None

def is_current_player(game, player_index):
    return game['currentPlayer'] == game['players'][player_index]['symbol']