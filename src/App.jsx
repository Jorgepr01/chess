import React, { useState, useEffect, useRef } from 'react';
import HomeSearch from './HomeSearch.jsx'
import ChessDashboard from "./Dashboard.jsx"

const App = () => {
  // Estado para saber qué usuario y año estamos viendo
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedYear, setSelectedYear] = useState('2025');

  // Si no hay usuario, mostramos el BUSCADOR
  if (!currentUser) {
    return <HomeSearch onSearch={(name, year) => {
      setCurrentUser(name);
      setSelectedYear(year);
    }} />;
  }

  // Si hay usuario, mostramos el DASHBOARD
  return (
    <ChessDashboard 
      initialUser={currentUser} 
      initialYear={selectedYear}
      onBack={() => setCurrentUser(null)} 
    />
  );
};

export default App;