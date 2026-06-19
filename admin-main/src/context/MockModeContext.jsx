import React, { createContext, useContext, useState } from "react";

const MockModeContext = createContext();

export const MockModeProvider = ({ children }) => {
  const [isMockMode, setIsMockMode] = useState(true); // Default to mock mode

  return (
    <MockModeContext.Provider value={{ isMockMode, setIsMockMode }}>
      {children}
    </MockModeContext.Provider>
  );
};

export const useMockMode = () => {
  const context = useContext(MockModeContext);
  if (!context) {
    throw new Error("useMockMode must be used within a MockModeProvider");
  }
  return context;
};
