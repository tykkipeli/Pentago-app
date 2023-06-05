import copy
from bitboard import bitboards_to_board, board_to_bitboards
from threading import Lock

users_in_lobby = []
challenges = {}  # {challenger_username: {"challenged": challenged_username, "time": game_time}}
sid_to_username = {}
lobby_lock = Lock()


def get_sid_by_username(username):
    for sid, user in sid_to_username.items():
        if user == username:
            return sid
    return None


def print_bitboard(white_bitboard, black_bitboard):
    print_game_board(bitboards_to_board(white_bitboard, black_bitboard))


def print_game_board(board):
    for row in board:
        rivi = ""
        for x in row:
            if x == 0:
                rivi += ' '
            else:
                rivi += str(x)
            rivi += "|"
        print(rivi)
    print()


def generate_reachable_positions(white_bb, black_bb):
    board = bitboards_to_board(white_bb, black_bb)
    reachable_positions = set()
    white_count = bin(white_bb).count("1")
    black_count = bin(black_bb).count("1")
    current_player = 1 if white_count == black_count else 2

    for row in range(6):
        for col in range(6):
            if board[row][col] == 0:
                new_board = copy.deepcopy(board)
                new_board[row][col] = current_player

                for quadrant in range(4):
                    for direction in ('ccw', 'cw'):
                        rotated_board = rotate_quadrant(
                            new_board, quadrant, direction)
                        rotated_white_bb, rotated_black_bb = board_to_bitboards(
                            rotated_board)
                        reachable_positions.add(
                            (rotated_white_bb, rotated_black_bb))

    return reachable_positions


def generate_symmetrical_positions(white_bitboard, black_bitboard):
    def flip_board(board):
        return [row[::-1] for row in board]

    def rotate_board(board, direction):
        if direction == 'cw':
            return [[board[5 - j][i] for j in range(6)] for i in range(6)]
        elif direction == 'ccw':
            return [[board[j][5 - i] for j in range(6)] for i in range(6)]

    board = bitboards_to_board(white_bitboard, black_bitboard)
    symmetrical_positions = []

    for _ in range(2):
        for _ in range(4):
            white_bb, black_bb = board_to_bitboards(board)
            symmetrical_positions.append((white_bb, black_bb))
            board = rotate_board(board, 'cw')
        board = flip_board(board)

    return symmetrical_positions


def group_next_positions_info(next_positions_info, white_bitboard, black_bitboard):
    reachable_positions = generate_reachable_positions(white_bitboard, black_bitboard)
    #for pos in reachable_positions:
    #    print_bitboard(pos[0], pos[1])
    #print(len(reachable_positions))
    grouped_positions = {}

    for pos_info in next_positions_info:
        white_bb = pos_info['white_bb']
        black_bb = pos_info['black_bb']
        #key = get_minimal_reachable_position(white_bb, black_bb, reachable_positions)
        key = min(generate_symmetrical_positions(white_bb, black_bb))
        if key in grouped_positions:
            grouped_positions[key]['times_reached'] += pos_info['times_reached']
            grouped_positions[key]['white_wins'] += pos_info['white_wins']
            grouped_positions[key]['black_wins'] += pos_info['black_wins']
        else:
            grouped_positions[key] = pos_info

    # Update the dictionary to replace the keys with positions in reachable_positions
    for key, value in grouped_positions.items():
        new_bitboard = key
        for bitboard in generate_symmetrical_positions(key[0], key[1]):
            if bitboard in reachable_positions:
                new_bitboard = bitboard
                break
        grouped_positions[key]['white_bb'] = new_bitboard[0]
        grouped_positions[key]['black_bb'] = new_bitboard[1]
    return list(grouped_positions.values())


def rotate_quadrant(board, quadrant, direction):
    start_row = 0 if quadrant < 2 else 3
    start_col = 0 if quadrant % 2 == 0 else 3

    quadrant_data = [row[start_col:start_col + 3]
                     for row in board[start_row:start_row + 3]]

    rotated_quadrant = []
    if direction == 'ccw':
        rotated_quadrant = [[quadrant_data[j][2 - i]
                             for j in range(3)] for i in range(3)]
    elif direction == 'cw':
        rotated_quadrant = [[quadrant_data[2 - j][i]
                             for j in range(3)] for i in range(3)]

    new_board = copy.deepcopy(board)
    #new_board = board.copy()
    for i in range(3):
        for j in range(3):
            new_board[start_row + i][start_col + j] = rotated_quadrant[i][j]

    return new_board


#return True if game is over, the second value is the winner symbol
def is_game_over_on_board(board):
    result = [False, False, False]
    # Check rows
    for row in board:
        for i in range(2):
            if row[i:i+5] == [row[i]] * 5 and row[i] != 0:
                result[row[i]] = True

    # Check columns
    for col in range(6):
        for row in range(2):
            if all(board[row+i][col] == board[row][col] for i in range(5)) and board[row][col] != 0:
                result[board[row][col]] = True

    # Check main diagonals
    for row in range(2):
        for col in range(2):
            if all(board[row+i][col+i] == board[row][col] for i in range(5)) and board[row][col] != 0:
                result[board[row][col]] = True

    # Check secondary diagonals
    for row in range(2):
        for col in range(4, 6):
            if all(board[row+i][col-i] == board[row][col] for i in range(5)) and board[row][col] != 0:
                result[board[row][col]] = True

    if result[1] and result[2]:
        return True, None
    if result[1]:
        return True, 1
    if result[2]:
        return True, 2
    # Check for a draw
    for row in board:
        for cell in row:
            if cell == 0:
                return False, None

    return True, None  # Draw


def is_valid_integer(s):
    try:
        int(s)
        return True
    except ValueError:
        return False

def valid_game_time(game_time):
    return game_time in [3*60, 5*60, 10*60, 20*60, 60*60]