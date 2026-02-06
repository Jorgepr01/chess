import React, { useState, useEffect, useRef } from 'react';
import HomeSearch from './HomeSearch.jsx'
import ChessDashboard from "./Dashboard.jsx"

const App = () => {
  // Estado para saber qué usuario estamos viendo
  const [currentUser, setCurrentUser] = useState(null);

  // Si no hay usuario, mostramos el BUSCADOR
  if (!currentUser) {
    return <HomeSearch onSearch={(name) => setCurrentUser(name)} />;
  }

  // Si hay usuario, mostramos el DASHBOARD
  return (
    <ChessDashboard 
      initialUser={currentUser} 
      onBack={() => setCurrentUser(null)} 
    />
  );
};

export default App;