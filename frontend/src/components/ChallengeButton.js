import React, { useState } from 'react';
import backArrow from '../assets/back_arrow_placeholder.png';
import './ChallengeButton.css';

const ChallengeButton = ({ username, socket, setIsChallenging, setChallengedUser, setChallengeTime }) => {
  const [showChallengeOptions, setShowChallengeOptions] = useState(false);

  const handleChallengeClick = (game_time) => {
    socket.emit("challenge", { challenged_username: username, game_time });
    setShowChallengeOptions(false);
    setIsChallenging(true);
    setChallengedUser(username);
    setChallengeTime(game_time/60);
  };

  /*
    if (showChallengeOptions) {
      return (
        <div className='choose-time-wrapper'>
          <button className="fixed-size-button" onClick={() => setShowChallengeOptions(false)}>
            <img src={backArrow} alt="Back" />
          </button>
          <button className="fixed-size-button" onClick={() => handleChallengeClick(180)}>3</button>
          <button className="fixed-size-button" onClick={() => handleChallengeClick(300)}>5</button>
          <button className="fixed-size-button" onClick={() => handleChallengeClick(600)}>10</button>
          <button className="fixed-size-button" onClick={() => handleChallengeClick(1200)}>20</button>
          <button className="fixed-size-button" onClick={() => handleChallengeClick(3600)}>60</button>
        </div>
      );
    }
  */

  const timeOptions = [180, 300, 600, 1200, 3600];

  if (showChallengeOptions) {
    return (
      <div className='choose-time-wrapper'>
        <button
          className="fixed-size-button color0"
          onClick={() => setShowChallengeOptions(false)}
        >
          <img src={backArrow} alt="Back" />
        </button>
        {timeOptions.map((time, index) => (
          <button
            className={`fixed-size-button color${index + 1}`}
            onClick={() => handleChallengeClick(time)}
          >
            {time / 60}
          </button>
        ))}
      </div>
    );
  }

  return (
    <button onClick={() => setShowChallengeOptions(true)}>Challenge</button>
  );
};

export default ChallengeButton;
