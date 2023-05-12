import React from 'react';

const RematchArea = ({ isChallenging, incomingChallenge, socket, setIsChallenging, setIncomingChallenge, opponentInGameRoom, handleRematch }) => {
  const hasChallenge = isChallenging || incomingChallenge;
  if (!opponentInGameRoom) {
    return (
        <div className='button-container'> 
            Your opponent has left the game room
        </div>
    );
  }
  if (!hasChallenge) {
    return (
        <div className='button-container' style={{ opacity: 1 }}> 
            <button onClick={handleRematch} >Rematch</button>
        </div>
    );
  }
  return (
    <div className={`button-container ${hasChallenge ? "challenge-active" : ""}`}>
      {isChallenging && (
        <div className="incoming-challenge-container">
          <div className="incoming-challenge-message">
            Offering rematch
          </div>
          <button
            onClick={() => {
              socket.emit("cancel_challenge");
              setIsChallenging(false);
            }}
          >
            Cancel challenge
          </button>
        </div>
      )}
      {incomingChallenge && (
        <>
          <div className="incoming-challenge-container">
            <div className="incoming-challenge-message">
              {incomingChallenge} wants a rematch!
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
    </div>
  );
};

export default RematchArea;
