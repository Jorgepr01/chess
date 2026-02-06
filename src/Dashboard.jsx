import React, { useState, useEffect, useRef } from 'react';
import BodyRigth from './components/BodyR';
import api from "./api.js";
import { BarChart3, ArrowLeft } from 'lucide-react'; // Asegúrate de tener instalada lucide-react
import ChessWrapped from './components/ChessWrapped';


// ==========================================
// 2. TU DASHBOARD (ADAPTADO PARA RECIBIR USUARIO)
// ==========================================
const ChessDashboard = ({ initialUser, onBack }) => {
  const [topPlayer, setTopPlayer] = useState([]); 
  const [perfil, setPerfil] = useState(null)
  const [selectedGameMode, setSelectedGameMode] = useState('bullet');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [favorites, setFavorites] = useState([]);
  
  const [playerStats, setPlayerStats]= useState(null);
  const [misAmigos, setMisAmigos] = useState([]);
  
  // const isFirstLoad = useRef(true); // (Opcional si no lo usas)

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

  // MODIFICADO: Ahora intenta buscar el perfil del usuario seleccionado
  const fetchUser = async (username) => {
    try {
      // Intenta usar el usuario dinámico, si falla usa el default
      // Nota: Asegúrate de que tu backend soporte '/chessyo/usuario'
      // Si tu backend SOLO soporta '/chessyo/jorgepr1', deja la línea de abajo como estaba.
      const target = username || 'jorgepr1'; 
      const response = await api.get(`/chessyo/${target}`); 
      setPerfil(response.data);
    } catch (err) {
      console.error("Error fetching user profile", err);
    }
  };

  const fetchStats = async (username, isMainUser = false) => {
    try {
      const response = await api.get('/chesswrappedpandas/'+username+"/2025");
      const data = response.data
      setPlayerStats(data);
      if (isMainUser && data.total && data.total.amigos) {
           const rivalsObj = data.total.amigos;
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

  // --- AQUÍ ESTÁ LA MAGIA ---
  // Este useEffect se activa cuando cambia el "initialUser" (lo que escribiste en el buscador)
  useEffect(() => {
    const usuarioActual = initialUser || 'jorgepr1';
    
    fetchTopPlayers();
    fetchUser(usuarioActual); 
    fetchStats(usuarioActual, true);
    // Auto-seleccionamos al usuario para que se muestre el Wrapped directamente
    // setSelectedPlayer({ username: usuarioActual });
    
  }, [initialUser]);


  return (
      <div className="flex flex-col h-screen w-full bg-white overflow-hidden">
        
        {/* BARRA SUPERIOR DE NAVEGACIÓN */}
        {/* <div className="h-12 border-b border-gray-200 flex items-center px-4 bg-white shadow-sm z-10">
            <button 
                onClick={onBack} 
                className="flex items-center text-gray-500 hover:text-blue-600 transition-colors font-medium text-sm"
            >
                <ArrowLeft size={16} className="mr-2"/> 
                Volver a buscar
            </button>
            <div className="mx-4 h-4 w-[1px] bg-gray-300"></div>
            <span className="text-sm text-gray-400">Analizando a: <span className="text-gray-700 font-bold">{initialUser}</span></span>
        </div> */}

        <div className="flex flex-1 overflow-hidden">
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
            {selectedPlayer ? (
                <ChessWrapped
                key={selectedPlayer.username}
                player={selectedPlayer} 
                playerData={playerStats}
                />
            ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <BarChart3 size={64} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">Selecciona un jugador para ver sus estadísticas</p>
                  </div>
                </div>
            )}
            </main>
        </div>
      </div>
  )
}


export default ChessDashboard;