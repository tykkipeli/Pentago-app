users_in_lobby = set()
challenges = {}
sid_to_username = {}

def get_sid_by_username(username):
    for sid, user in sid_to_username.items():
        if user == username:
            return sid
    return None

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

    new_board = board.copy()
    for i in range(3):
        for j in range(3):
            new_board[start_row + i][start_col + j] = rotated_quadrant[i][j]

    return new_board

def is_game_over_on_board(board):
    # Check rows
    for row in board:
        for i in range(2):
            if row[i:i+5] == [row[i]] * 5 and row[i] != 0:
                return True, row[i]

    # Check columns
    for col in range(6):
        for row in range(2):
            if all(board[row+i][col] == board[row][col] for i in range(5)) and board[row][col] != 0:
                return True, board[row][col]

    # Check main diagonals
    for row in range(2):
        for col in range(2):
            if all(board[row+i][col+i] == board[row][col] for i in range(5)) and board[row][col] != 0:
                return True, board[row][col]

    # Check secondary diagonals
    for row in range(2):
        for col in range(4, 6):
            if all(board[row+i][col-i] == board[row][col] for i in range(5)) and board[row][col] != 0:
                return True, board[row][col]

    # Check for a draw
    for row in board:
        for cell in row:
            if cell == 0:
                return False, None

    return True, None  # Draw
