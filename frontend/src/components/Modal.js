import React, { useEffect } from 'react';
import './Modal.css';

const Modal = ({ gameResult, modalOpen, onClose, whiteUsername, blackUsername }) => {

  useEffect(() => {
    // get the modal-overlay element
    const overlay = document.querySelector('.modal-overlay');

    // if the element doesn't exist, return immediately
    if (!overlay) {
      return;
    }

    // if the element exists, continue as normal
    const timeoutId = setTimeout(() => {
      overlay.style.opacity = '1';
    }, 100); // start the transition 100ms after the modal is rendered

    // clean up
    return () => {
      clearTimeout(timeoutId);
    };
  }, [gameResult, modalOpen]);

  if (!gameResult || !modalOpen) {
    return null;
  }

  const whiteChange = Math.round(gameResult.newRatings.white) - Math.round(gameResult.oldRatings.white);
  const blackChange = Math.round(gameResult.newRatings.black) - Math.round(gameResult.oldRatings.black);

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="modal-close" onClick={onClose}>X</button>
        <div className="modal-content">
            <h1 className="game-result-message"> {gameResult.message} </h1>
            <span className="game-result-reason"> {gameResult.reason} </span>
            <div className="player-area">
              <div className="player white-player">
                <h2>{whiteUsername}</h2>
                <h3 className={whiteChange >= 0 ? 'rating-increased' : 'rating-decreased'}> 
                  {Math.round(gameResult.newRatings.white)} 
                  <span className='rating-change'> {whiteChange >= 0 ? '+' : ''}{Math.round(whiteChange)}</span>
                </h3>
              </div>
              <div className="player black-player">
                <h2>{blackUsername}</h2>
                <h3 className={blackChange >= 0 ? 'rating-increased' : 'rating-decreased'}> 
                  {Math.round(gameResult.newRatings.black)} 
                  <span className='rating-change'> {blackChange >= 0 ? '+' : ''}{Math.round(blackChange)}</span>
                </h3>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
