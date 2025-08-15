import React, { createContext, useState, useContext } from 'react';

// 1. Create the context
const UserContext = createContext();

// 2. Create the provider
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    uid: null,
    name: '',
    email: '',
    gender: '',
    fitbit_permission:'false'
    // Add other fields here
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// 3. Optional: custom hook to use context
export const useUser = () => useContext(UserContext);
