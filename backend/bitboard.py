def board_to_bitboards(board):
    white_bitboard = 0
    black_bitboard = 0

    for row in range(6):
        for col in range(6):
            position = row * 6 + col
            if board[row][col] == 1:
                white_bitboard |= 1 << position
            elif board[row][col] == 2:
                black_bitboard |= 1 << position

    return white_bitboard, black_bitboard

def bitboards_to_board(white_bitboard, black_bitboard):
    board = [[0 for _ in range(6)] for _ in range(6)]

    for row in range(6):
        for col in range(6):
            position = row * 6 + col
            if white_bitboard & (1 << position):
                board[row][col] = 1
            elif black_bitboard & (1 << position):
                board[row][col] = 2

    return board

import random

def random_position():
    board = [[0 for _ in range(6)] for _ in range(6)]
    for row in range(6):
        for col in range(6):
            board[row][col] = random.choice([0, 1, 2])
    return board


def test():
    # Generate a random position
    board = random_position()

    # Convert the board to bitboards
    white_bitboard, black_bitboard = board_to_bitboards(board)

    # Convert the bitboards back to the original board format
    reconstructed_board = bitboards_to_board(white_bitboard, black_bitboard)

    # Check if the original and reconstructed boards are the same
    if board == reconstructed_board:
        print("The functions work correctly!")
        return True
    else:
        print("There's an issue with the functions.")
        return False

def print_game_positions(game_id):
    from database.models import Games, Positions
    from utils import print_game_board
    game = Games.query.get(game_id)
    if game is None:
        print("Game not found.")
        return

    positions = Positions.query.filter_by(game_id=game_id).order_by(Positions.id).all()

    for position in positions:
        print(f"Position {position.id}:")
        board = bitboards_to_board(position.white_bitboard, position.black_bitboard)
        print_game_board(board)
        print("\n")

from app import app
with app.app_context():
    pass
    #print_game_positions(4)