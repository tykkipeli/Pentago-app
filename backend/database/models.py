from app import db

class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    rating = db.Column(db.Float, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'rating': self.rating
        }

    def __repr__(self):
        return f'<User {self.username}>'
    
class Games(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    black_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    white_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    winner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    date = db.Column(db.DateTime, nullable=False)
    move_count = db.Column(db.Integer, nullable=False)

    black = db.relationship('Users', foreign_keys=[black_id])
    white = db.relationship('Users', foreign_keys=[white_id])
    winner = db.relationship('Users', foreign_keys=[winner_id])

    def __repr__(self):
        return f'<Game {self.id}>'

class Positions(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey('games.id'), nullable=False)
    white_bitboard = db.Column(db.BigInteger, nullable=False)
    black_bitboard = db.Column(db.BigInteger, nullable=False)
    prev_position = db.Column(db.Integer, db.ForeignKey('positions.id'), nullable=True)

    game = db.relationship('Games', backref=db.backref('positions', lazy=True))

    def __repr__(self):
        return f'<Position {self.id}>'
