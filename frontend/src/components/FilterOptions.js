import React, { useState, useEffect } from 'react';
import './FilterOptions.css';
 
const FilterOptions = ({ filterOptions, setFilterOptions, onApplyFilters, considerSymmetrical, handleConsiderSymmetricalChange }) => {
  const [color, setColor] = useState(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [whiteRatingMin, setWhiteRatingMin] = useState('');
  const [whiteRatingMax, setWhiteRatingMax] = useState('');
  const [blackRatingMin, setBlackRatingMin] = useState('');
  const [blackRatingMax, setBlackRatingMax] = useState('');
  const [daysAgo, setDaysAgo] = useState('');
 
  /*
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFilterOptions((prevOptions) => ({ ...prevOptions, [name]: value }));
  };
  */
 
  const handleInputChange = (event) => {
    const { value } = event.target;
    setUsernameInput(value);
  };
 
  const handleColorChange = (color) => {
    setColor(color);
  };
 
  const handleWhiteRatingMinChange = (event) => {
    const { value } = event.target;
    setWhiteRatingMin(value);
  };
 
  const handleWhiteRatingMaxChange = (event) => {
    const { value } = event.target;
    setWhiteRatingMax(value);
  };
 
  const handleBlackRatingMinChange = (event) => {
    const { value } = event.target;
    setBlackRatingMin(value);
  };
 
  const handleBlackRatingMaxChange = (event) => {
    const { value } = event.target;
    setBlackRatingMax(value);
  };
 
  const handleDaysAgoChange = (event) => {
    const { value } = event.target;
    setDaysAgo(value);
  };
 
  const handleApplyFilters = () => {
    setFilterOptions((prevOptions) => ({
      ...prevOptions,
      usernameWhite: color === 'white' ? usernameInput : '',
      usernameBlack: color === 'black' ? usernameInput : '',
      whiteRatingMin,
      whiteRatingMax,
      blackRatingMin,
      blackRatingMax,
      daysAgo
    }));
  };
 
  useEffect(() => {
    console.log("here");
    onApplyFilters();
  }, [filterOptions]);
 
  return (
    <div className="filter-options">
      <div className='upper-filter'>
        <h3>Filter Options</h3>
        <div className='labeled-input'>
          <label>User:</label>
          <input
            type="text"
            name="username"
            value={usernameInput}
            onChange={handleInputChange}
          />
        </div>
        <div className='labeled-input'>
          <label>Color:</label>
          <div>
            <button className={`color-button ${color === 'white' ? 'active' : ''}`} onClick={() => handleColorChange('white')}>
              <div className="circle white-circle"></div>
            </button>
            <button className={`color-button ${color === 'black' ? 'active' : ''}`} onClick={() => handleColorChange('black')}>
              <div className="circle black-circle"></div>
            </button>
          </div>
        </div>
      </div>
      <div className='middle-filter'>
        <div className='labeled-input'>
          <label>White rating Range:</label>
          <div className='rating-range'>
            <input
              type="number"
              name="whiteRatingMin"
              value={whiteRatingMin}
              onChange={handleWhiteRatingMinChange}
            />
            <label>-</label>
            <input
              type="number"
              name="whiteRatingMax"
              value={whiteRatingMax}
              onChange={handleWhiteRatingMaxChange}
            />
          </div>
        </div>
        <div className='labeled-input'>
          <label>Black rating range:</label>
          <div className='rating-range'>
            <input
              type="number"
              name="blackRatingMin"
              value={blackRatingMin}
              onChange={handleBlackRatingMinChange}
            />
            <label>-</label>
            <input
              type="number"
              name="blackRatingMax"
              value={blackRatingMax}
              onChange={handleBlackRatingMaxChange}
            />
          </div>
        </div>
        <div className='labeled-input'>
          <label>Days ago:</label>
          <input
            type="number"
            name="daysAgo"
            value={daysAgo}
            onChange={handleDaysAgoChange}
          />
        </div>
      </div>
      <div className='lower-filter'>
        <div className="consider-symmetrical">
          <input
              type="checkbox"
              id="considerSymmetrical"
              checked={considerSymmetrical}
              onChange={handleConsiderSymmetricalChange}
            />
          <label htmlFor="considerSymmetrical">
            Consider symmetrical positions equal
          </label>
        </div>
        <button onClick={handleApplyFilters}>Apply Filters</button>
        <div>
        </div>
      </div>
    </div>
  );
};
 
export default FilterOptions;