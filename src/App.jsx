import React, { useState, useEffect } from 'react';
import BodyRigth from './components/BodyR';
// import StatsDashboard from './components/StatsDashboard';
import api from "./api.js";
import { BarChart3} from 'lucide-react';
import ChessWrapped from './components/ChessWrapped';


const ChessDashboard = () => {
  const [topPlayer, setTopPlayer] = useState([]); 
  const [perfil, setPerfil] = useState(null)
  const [selectedGameMode, setSelectedGameMode] = useState('bullet');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [favorites, setFavorites] = useState([]);
  
  const[playerStats, setPlayerStats]= useState(null);
  const handleAnalyze = (player) => {
    setSelectedPlayer(player);
    fetchStast(player.username);
  };
  
  const fetchTopPlayers = async () => {
  try {
    const response = await api.get('/top-players');
    setTopPlayer(response.data);
  } catch (err) {
    console.error("Error fetching top players", err);
  }
  };

  const fetchUser = async () => {
  try {
    const response = await api.get('/chessyo/jorgepr1');
    setPerfil(response.data);
  } catch (err) {
    console.error("Error fetching top players", err);
  }
  };
  const fetchStast = async (username) => {
  try {
    const response =await api.get('/chessstats/'+username);
    setPlayerStats(response.data);
  }
  catch(err){
    console.error("el error es", err);
  };
  }



  const handleFavorite = (player) => {
    setFavorites(prev => {
      const exists = prev.find(f => f.player_id === player.player_id);
      if (exists) {
        return prev.filter(f => f.player_id !== player.player_id);
      }
      return [...prev, player];
    });
  };
  

  const isFavorited = (player) => {
    return favorites.some(f => f.player_id === player.player_id);
  };


  const amigos = [
    { id: 'friend1', name: 'Ana Rodríguez', gamesPlayed: 45, stats: { totalGames: 234, wins: 134, losses: 89, draws: 11, winRate: 57.3, favoriteOpening: 'Defensa Francesa', currentStreak: 3, nemesis: 'Juan García', mascot: 'Dama Blanca', winsReasons: ['Jaque mate: 50%', 'Rendición: 35%', 'Tiempo: 15%'], lossReasons: ['Jaque mate: 48%', 'Error: 32%', 'Tiempo: 20%'], recentGames: [{ opponent: 'Juan García', result: 'Victoria', date: '2024-11-28' }] } },
    { id: 'friend2', name: 'Pedro López', gamesPlayed: 38, stats: { totalGames: 189, wins: 98, losses: 78, draws: 13, winRate: 51.9, favoriteOpening: 'Apertura Italiana', currentStreak: 2, nemesis: 'Ana Rodríguez', mascot: 'Peón Valiente', winsReasons: ['Jaque mate: 45%', 'Rendición: 40%', 'Tiempo: 15%'], lossReasons: ['Jaque mate: 55%', 'Error: 25%', 'Tiempo: 20%'], recentGames: [] } },
    { id: 'friend3', name: 'Ana Rodríguez', gamesPlayed: 45, stats: { totalGames: 234, wins: 134, losses: 89, draws: 11, winRate: 57.3, favoriteOpening: 'Defensa Francesa', currentStreak: 3, nemesis: 'Juan García', mascot: 'Dama Blanca', winsReasons: ['Jaque mate: 50%', 'Rendición: 35%', 'Tiempo: 15%'], lossReasons: ['Jaque mate: 48%', 'Error: 32%', 'Tiempo: 20%'], recentGames: [{ opponent: 'Juan García', result: 'Victoria', date: '2024-11-28' }] } },
    { id: 'friend4', name: 'Pedro López', gamesPlayed: 38, stats: { totalGames: 189, wins: 98, losses: 78, draws: 13, winRate: 51.9, favoriteOpening: 'Apertura Italiana', currentStreak: 2, nemesis: 'Ana Rodríguez', mascot: 'Peón Valiente', winsReasons: ['Jaque mate: 45%', 'Rendición: 40%', 'Tiempo: 15%'], lossReasons: ['Jaque mate: 55%', 'Error: 25%', 'Tiempo: 20%'], recentGames: [] } },
    { id: 'friend5', name: 'Ana Rodríguez', gamesPlayed: 45, stats: { totalGames: 234, wins: 134, losses: 89, draws: 11, winRate: 57.3, favoriteOpening: 'Defensa Francesa', currentStreak: 3, nemesis: 'Juan García', mascot: 'Dama Blanca', winsReasons: ['Jaque mate: 50%', 'Rendición: 35%', 'Tiempo: 15%'], lossReasons: ['Jaque mate: 48%', 'Error: 32%', 'Tiempo: 20%'], recentGames: [{ opponent: 'Juan García', result: 'Victoria', date: '2024-11-28' }] } },
    { id: 'friend6', name: 'Pedro López', gamesPlayed: 38, stats: { totalGames: 189, wins: 98, losses: 78, draws: 13, winRate: 51.9, favoriteOpening: 'Apertura Italiana', currentStreak: 2, nemesis: 'Ana Rodríguez', mascot: 'Peón Valiente', winsReasons: ['Jaque mate: 45%', 'Rendición: 40%', 'Tiempo: 15%'], lossReasons: ['Jaque mate: 55%', 'Error: 25%', 'Tiempo: 20%'], recentGames: [] } },
    { id: 'friend7', name: 'María Torres', gamesPlayed: 32, stats: { totalGames: 156, wins: 89, losses: 56, draws: 11, winRate: 57.1, favoriteOpening: 'Apertura Inglesa', currentStreak: 4, nemesis: 'Pedro López', mascot: 'Torre Firme', winsReasons: ['Jaque mate: 52%', 'Rendición: 33%', 'Tiempo: 15%'], lossReasons: ['Jaque mate: 50%', 'Error: 30%', 'Tiempo: 20%'], recentGames: [] } }
  ];

  useEffect(() => {
    fetchTopPlayers();
    fetchUser();
  }, []);


  useEffect(() => {
    if (selectedPlayer) {
      console.log("El estado ya se actualizó:", selectedPlayer["username"]);
    }
  }, [selectedPlayer]);
  return (

      
      <div className="flex h-screen w-full bg-white overflow-hidden">
        
        <div className="w-[60%] border-r border-gray-200 flex flex-col bg-white h-full">
            <div className="flex-1 h-full">
            <BodyRigth
                Datosuser={perfil || {}}
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
          {selectedPlayer ? (
            // <StatsDashboard
            //   player={selectedPlayer} 
            //   playerData={playerStats ? { stats: playerStats } : null}
            // />
            <ChessWrapped 
              player={selectedPlayer} 
              playerData={playerStats ? { stats: playerStats } : null}
            />
          ) : (
            // Opcional: Mostrar algo si no hay jugador seleccionado
            <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <BarChart3 size={64} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Selecciona un jugador para ver sus estadísticas</p>
                </div>
              </div>
          )}
        </main>
      </div>
  )
}

export default ChessDashboard;