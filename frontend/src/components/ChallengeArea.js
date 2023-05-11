import React from 'react';

const ChallengeArea = ({ selectedUser, isChallenging, incomingChallenge, socket, setIsChallenging, setIncomingChallenge }) => {
  const hasChallenge = isChallenging || incomingChallenge;
  return (
    <div className={`button-container ${hasChallenge ? "challenge-active" : ""}`}>
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
          <div className="incoming-challenge-container">
            <div className="incoming-challenge-message">
              {incomingChallenge['challenger']} has challenged you for {incomingChallenge['time'] / 60} min!
            </div>
            <div className="challenge-buttons">
              <button onClick={() => socket.emit("accept_challenge")}>
                Accept
              </button>
              <button
                className="reject-button"
                onClick={() => {
                  socket.emit("reject_challenge");
                  setIncomingChallenge(null);
                }}
              >
                Reject
              </button>
            </div>
          </div>
        </>
      )}
      {!hasChallenge && <div>No pending challenges</div>}
    </div>
  );
};

export default ChallengeArea;
