import numpy as np
import random

def get_dynamic_k_factor(games_played):
    base_k = 16
    initial_k = 400
    decay_rate = 0.06

    k_factor = base_k + (initial_k - base_k) * np.exp(-decay_rate * games_played)
    return k_factor

def get_new_elo_ratings(rating1, rating2, games_played1, games_played2, outcome):
    k1 = get_dynamic_k_factor(games_played1)
    k2 = get_dynamic_k_factor(games_played2)

    expected_outcome1 = 1 / (1 + 10 ** ((rating2 - rating1) / 400))
    expected_outcome2 = 1 / (1 + 10 ** ((rating1 - rating2) / 400))

    new_rating1 = rating1 + k1 * (outcome - expected_outcome1)
    new_rating2 = rating2 + k2 * ((1 - outcome) - expected_outcome2)

    return new_rating1, new_rating2

def win_draw_probability(player1_rating, player2_rating):
    def expected_outcome(rating1, rating2):
        return 1 / (1 + 10 ** ((rating2 - rating1) / 400))

    draw_probability_factor = 0.5  # You can adjust this value based on the likelihood of draws in your game

    player1_win_prob = expected_outcome(player1_rating, player2_rating)
    player2_win_prob = expected_outcome(player2_rating, player1_rating)
    draw_prob = (1 - player1_win_prob - player2_win_prob) * draw_probability_factor

    # Normalize probabilities to ensure they sum up to 1
    total_prob = player1_win_prob + player2_win_prob + draw_prob
    player1_win_prob /= total_prob
    player2_win_prob /= total_prob
    draw_prob /= total_prob

    return player1_win_prob, player2_win_prob, draw_prob


def player1_wins(rating1, rating2):
    res = win_draw_probability(rating1, rating2)
    return random.uniform(0, 1) < res[0]

def example():
    # Example usage
    rating1 = 1500
    rating2 = 1500
    games_played1 = 0
    games_played2 = 0
    outcome = 1  # Player 1 wins (1), Player 2 wins (0)

    for i in range(1):
        rating1, rating2 = get_new_elo_ratings(rating1, rating2, games_played1, games_played2, outcome)
        games_played1 += 1
        games_played2 += 2
        print("Player 1 new rating:", rating1)
        print("Player 2 new rating:", rating2)

#example()

def k_factor_test():
    for i in range(200):
        print(get_dynamic_k_factor(i+1))

def test():
    true_ratings = [0, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000]
    current_ratings = [1500]*12
    games_played = [0]*12
    
    for i in range(100):  # simulate 10000 games
        player1, player2 = random.sample(range(1, 12), 2)  # pick two distinct players at random
        
        if player1_wins(true_ratings[player1], true_ratings[player2]):
            outcome = 1
        else:
            outcome = 0
        
        current_ratings[player1], current_ratings[player2] = get_new_elo_ratings(current_ratings[player1], current_ratings[player2], games_played[player1], games_played[player2], outcome)
        games_played[player1] += 1
        games_played[player2] += 1
        if i %10000 == 0:
            print(games_played)
            for i in range(1, 12):
                print(f"Player {i}: {current_ratings[i]}")
        
    print("Final ratings:")
    print(games_played)
    for i in range(1, 12):
        print(f"Player {i}: {current_ratings[i]}")



