from flask import Flask, request, jsonify

app = Flask(__name__)

# Initialize game state and current player
game_state = [[None] * 6 for _ in range(6)]
current_player = 1

def check_winner(board, player):
    # Check rows
    for row in range(6):
        for col in range(2):
            if all(board[row][col+i] == player for i in range(5)):
                return True

    # Check columns
    for col in range(6):
        for row in range(2):
            if all(board[row+i][col] == player for i in range(5)):
                return True

    # Check diagonals
    for row in range(2):
        for col in range(2):
            if all(board[row+i][col+i] == player for i in range(5)):
                return True
            if all(board[row+4-i][col+i] == player for i in range(5)):
                return True

    return False


@app.route('/api/game-action', methods=['POST'])
def game_action():
    global game_state, current_player
    data = request.get_json()

    # Process the game action and update the game state
    action_type = data['type']
    quadrant = data['quadrant']
    row = data['row']
    col = data['col']
    direction = data['direction']

    # Handle cell click
    if action_type == 'cell_click':
        game_state[row][col] = current_player
        current_player = 3 - current_player

    # Handle quadrant rotation
    elif action_type == 'quadrant_rotation':
        # Implement the rotation logic here
        pass

    # Check for a winner
    winner = check_winner(game_state, current_player)

    response_data = {
        'game_state': game_state,
        'game_status': 'won' if winner else 'ongoing',
        'current_player': current_player
    }
    return jsonify(response_data)

if __name__ == '__main__':
    app.run()
