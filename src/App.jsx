import React, { useState, useEffect,useMemo } from 'react';
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
    setPlayerStats(null); 
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
    // const response =await api.get('/chesswrapped/'+username+"/2025");
    const response =await api.get('/chesswrappedpandas/'+username+"/2025");
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



const amigos = useMemo(() => {
    // Verificamos si existe la estructura correcta
    if (!playerStats || !playerStats.total || !playerStats.total.amigos) return [];

    const amigosObj = playerStats.total.amigos;
    
    // Convertimos las llaves del objeto (nombres) en un array para la lista lateral
    return Object.keys(amigosObj).map(nombre => ({
      username: nombre,
      player_id: nombre, // Usamos el nombre como ID temporal
      avatar: null,      // La API de stats no devuelve avatar del amigo, se queda null
      games_count: amigosObj[nombre] // Podemos pasar cuántos juegos jugaron
    }));
  }, []);



  useEffect(() => {
    fetchTopPlayers();
    fetchUser();
    fetchStast('jorgepr1');

    
    
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
              key={selectedPlayer.username}
              player={selectedPlayer} 
              playerData={playerStats}
            />
          ) : (
            //mostrar algo si no hay jugador seleccionado
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