import React, { useState, useEffect } from 'react';
import BodyRigth from './components/BodyR';
import StatsDashboard from './components/StatsDashboard';
import { MOCK_DATA } from './components/mockData';
import api from "./api.js";



const ChessDashboard = () => {
  const [perfil, setPerfil] = useState(null);
  const [topPlayer, setTopPlayer] = useState(null);
  const [selectedGameMode, setSelectedGameMode] = useState('bullet');
  // const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [favorites, setFavorites] = useState([]);

  const handleAnalyze = (player) => {
    setSelectedPlayer(player);
  };

  const fetchTopPlayers = async () => {
  try {
    const response = await api.get('/top-players');
    setTopPlayer(response.data);
  } catch (err) {
    console.error("Error fetching top players", err);
  }
  };

  const fetchuser = async () => {
  try {
    const response = await api.get('/chessyo/jorgepr1');
    setPerfil(response.data);
  } catch (err) {
    console.error("Error fetching top players", err);
  }
  };

  useEffect(() => {
    fetchTopPlayers();
    fetchuser();
  }, []);

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
    <div className="flex h-screen w-full bg-white overflow-hidden">
      <div className="w-[60%] border-r border-gray-200 flex flex-col bg-white h-full">
           <div className="flex-1 h-full">
           <BodyRigth
              Datosuser={perfil}
              topPlayers={topPlayer}
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
      {/* parte derecha stats */}
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