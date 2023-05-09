import React from 'react';

const ChallengeArea = ({ selectedUser, isChallenging, incomingChallenge, socket, setIsChallenging, setIncomingChallenge }) => {
  return (
    <div className="button-container">
      {selectedUser && !isChallenging && (
        <button
          onClick={() => {
            socket.emit("challenge", { challenged_username: selectedUser, game_time: 300 });
            setIsChallenging(true);
          }}
        >
          Challenge {selectedUser}
        </button>
      )}
      {isChallenging && (
        <button
          onClick={() => {
            socket.emit("cancel_challenge");
            setIsChallenging(false);
          }}
        >
          Cancel challenge
        </button>
      )}
      {incomingChallenge && (
        <>
          <div className="incoming-challenge-message">
            {incomingChallenge['challenger']} has challenged you! for time {incomingChallenge['time']}
          </div>
          <button onClick={() => socket.emit("accept_challenge")}>
            Accept
          </button>
          <button
            onClick={() => {
              socket.emit("reject_challenge");
              setIncomingChallenge(null);
            }}
          >
            Reject
          </button>
        </>
      )}
    </div>
  );
};

export default ChallengeArea;
