import React, { useState, useEffect,useRef } from 'react';
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
  const [userError, setUserError] = useState(false);
  const[playerStats, setPlayerStats]= useState(null);
  const [misAmigos, setMisAmigos] = useState([]);
  const isFirstLoad = useRef(true);
  const handleAnalyze = (player) => {
    setSelectedPlayer(player);
    setPlayerStats(null); 
    fetchStats(player.username);
  };
  const analyzeFiltros = (player,data) =>{
    setSelectedPlayer(player);
    setPlayerStats(null); 
    setPlayerStats(data);
  }
  
  const fetchTopPlayers = async () => {
  try {
    const response = await api.get('/top-players');
    setTopPlayer(response.data);
  } catch (err) {
    console.error("Error fetching top players", err);
  }
  };

  const fetchUser = async (pathUsername) => {
  try {
    const response = await api.get('/chessyo/'+pathUsername);
    setPerfil(response.data);
  } catch (err) {
    console.error("Error fetching top players", err);
  }
  };


  
  const fetchStats = async (username,isMainUser = false) => {
  try {
    // const response =await api.get('/chesswrapped/'+username+"/2025");
    const response =await api.get('/chesswrappedpandas/'+username+"/2025");
    const data=response.data
    if (!data || data.error) {
       setUserError(true);
       return;
    }
    setPlayerStats(data);
    if (isMainUser && data.total && data.total.amigos) {
         const rivalsObj = data.total.amigos;
         
         // Convertimos el objeto de rivales a una lista limpia
         const listaAmigos = Object.keys(rivalsObj).map(nombre => ({
            username: nombre,
            player_id: nombre,
            avatar: null,
            games_count: rivalsObj[nombre]
          }));
          
          console.log("Amigos iniciales fijados:", listaAmigos);
          setMisAmigos(listaAmigos);
      }
  }
  catch(err){
    console.error("el error es", err);
    setUserError(true);
    setSelectedPlayer(null);
  };
  }



  const handleFavorite = (player) => {
    console.log(player)
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




  useEffect(() => {
    fetchTopPlayers();
    const pathUsername = window.location.pathname.split('/')[1];
    
    if (pathUsername) {
      // setSelectedPlayer({ username: pathUsername });
      fetchStats(pathUsername, true);
      fetchUser(pathUsername);
    } else {
      fetchStats('jorgepr1', true);
    }
  }, []);


  useEffect(() => {
    if (selectedPlayer) {
      console.log("El estado ya se actualizó:", selectedPlayer["username"]);
      console.log(selectedPlayer)
    }

  }, [selectedPlayer]);


  return (
      <div className="flex h-screen w-full bg-white overflow-hidden">
        
        <div className="w-[60%] border-r border-gray-200 flex flex-col bg-white h-full">
            <div className="flex-1 h-full">
            <BodyRigth
                Datosuser={perfil || {}}
                topPlayers={topPlayer}
                amigos={misAmigos}
                handleAnalyze={handleAnalyze}  
                selectedGameMode={selectedGameMode}
                setSelectedGameMode={setSelectedGameMode}
                handleFavorite={handleFavorite}
                isFavorited={isFavorited}
                favorites={favorites}
                analyzeFiltros= {analyzeFiltros}
              />
          </div>
        </div>
        {/* parte derecha stats */}
        <main className="flex-1 bg-gray-50 flex flex-col h-full">
          {userError ? (
            // CASO 1: El usuario no existe
            <div className="flex items-center justify-center h-full text-red-500">
              <div className="text-center">
                <p className="text-2xl font-bold">¡Ups!</p>
                <p className="text-lg text-gray-600">El usuario "{window.location.pathname.split('/')[1]}" no existe en Chess.com</p>
                <button 
                  onClick={() => window.location.href = '/'} 
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Volver al inicio
                </button>
              </div>
            </div>
          ) : selectedPlayer ? (
            // CASO 2: Todo bien, mostramos el análisis
            <ChessWrapped
              key={selectedPlayer.username}
              player={selectedPlayer} 
              playerData={playerStats}
            />
          ) : (
            // CASO 3: Estado inicial (esperando selección)
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