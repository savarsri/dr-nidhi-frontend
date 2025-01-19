import React, { createContext, useState, useContext } from 'react';

const TreatmentContext = createContext();

export const TreatmentProvider = ({ children }) => {
  const [treatmentType, setTreatmentType] = useState('');

  return (
    <TreatmentContext.Provider value={{ treatmentType, setTreatmentType }}>
      {children}
    </TreatmentContext.Provider>
  );
};

export const useTreatment = () => useContext(TreatmentContext);
