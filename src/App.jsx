import React, { useState } from 'react';
import BodyRigth from './components/BodyR';
import StatsDashboard from './components/StatsDashboard';
import { MOCK_DATA } from './components/mockData';
const ChessDashboard = () => {
  const [selectedGameMode, setSelectedGameMode] = useState('bullet');
  // const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [favorites, setFavorites] = useState([]);

  const handleAnalyze = (player) => {
    setSelectedPlayer(player);
  };

  const handleFavorite = (player) => {
    setFavorites(prev => {
      const exists = prev.find(f => f.id === player.id);
      if (exists) {
        return prev.filter(f => f.id !== player.id);
      }
      return [...prev, player];
    });
  };

  const isFavorited = (player) => {
    return favorites.some(f => f.id === player.id);
  };


  const user = MOCK_DATA.currentUser;
  const topPlayers = MOCK_DATA.topPlayers;
  const amigos = MOCK_DATA.friends;

  


  return (
    // 1. CONTENEDOR PRINCIPAL: Ocupa toda la altura (h-screen) y no deja que la pagina entera haga scroll (overflow-hidden)
    <div className="flex h-screen w-full bg-white overflow-hidden">
      
      {/* 2. PANEL IZQUIERDO (Navegación y Lista) */}
      {/* w-1/3: Ocupa un tercio del ancho. border-r: línea divisoria a la derecha */}
      <div className="w-[60%] border-r border-gray-200 flex flex-col bg-white h-full">
           <div className="flex-1 h-full">
           <BodyRigth 
              Datosuser={user}
              topPlayers={topPlayers}
              amigos={amigos}
              handleAnalyze={handleAnalyze}  
              selectedGameMode={selectedGameMode}
              setSelectedGameMode={setSelectedGameMode}
              handleFavorite={handleFavorite}
              isFavorited={isFavorited}
              favorites={favorites}
            />
        </div>
      </div>

      <main className="flex-1 bg-gray-50 flex flex-col h-full">
        <StatsDashboard 
          player={selectedPlayer} 
          playerData={selectedPlayer?.stats ? { stats: selectedPlayer.stats } : MOCK_DATA.currentUser}
        />

      </main>
    </div>
  )
}

export default ChessDashboard;