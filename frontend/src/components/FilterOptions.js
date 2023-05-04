import React from 'react';

const FilterOptions = ({ filterOptions, setFilterOptions, onApplyFilters}) => {
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFilterOptions((prevOptions) => ({ ...prevOptions, [name]: value }));
  };

  return (
    <div className="filter-options">
      <h3>Filter Options</h3>
      <div>
        <label>Username (White):</label>
        <input
          type="text"
          name="usernameWhite"
          value={filterOptions.usernameWhite}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label>Username (Black):</label>
        <input
          type="text"
          name="usernameBlack"
          value={filterOptions.usernameBlack}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label>White Rating (Min):</label>
        <input
          type="number"
          name="whiteRatingMin"
          value={filterOptions.whiteRatingMin}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label>White Rating (Max):</label>
        <input
          type="number"
          name="whiteRatingMax"
          value={filterOptions.whiteRatingMax}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label>Black Rating (Min):</label>
        <input
          type="number"
          name="blackRatingMin"
          value={filterOptions.blackRatingMin}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label>Black Rating (Max):</label>
        <input
          type="number"
          name="blackRatingMax"
          value={filterOptions.blackRatingMax}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label>Days Ago:</label>
        <input
          type="number"
          name="daysAgo"
          value={filterOptions.daysAgo}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <button onClick={onApplyFilters}>Apply Filters</button>
      </div>
    </div>
  );
};

export default FilterOptions;
