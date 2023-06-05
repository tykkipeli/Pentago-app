import React, { createContext, useContext, useState } from 'react';

// Create Context object
const UserContext = createContext();

// Create a provider which will house the state
export const UserProvider = ({ children }) => {
  const [rating, setRating] = useState(0);
  const [numGames, setNumGames] = useState(0);

  return (
    <UserContext.Provider value={{ rating, setRating, numGames, setNumGames }}>
      {children}
    </UserContext.Provider>
  );
};

// Create a custom hook to use the user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
