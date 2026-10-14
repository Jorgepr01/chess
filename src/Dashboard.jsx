import React, { useState, useEffect, useRef } from 'react';
import BodyRigth from './components/BodyR';
import api from "./api.js";
import { BarChart3, ArrowLeft, AlertCircle } from 'lucide-react';
import ChessWrapped from './components/ChessWrapped';


// ==========================================
// 2. TU DASHBOARD (ADAPTADO PARA RECIBIR USUARIO)
// ==========================================
const ChessDashboard = ({ initialUser, initialYear, onBack }) => {
  const [topPlayer, setTopPlayer] = useState([]); 
  const [perfil, setPerfil] = useState(null)
  const [selectedGameMode, setSelectedGameMode] = useState('bullet');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [favorites, setFavorites] = useState([]);
  
  const [playerStats, setPlayerStats]= useState(null);
  const [misAmigos, setMisAmigos] = useState([]);
  const [statsError, setStatsError] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const handleAnalyze = (player) => {
    if (!player || !player.username) return;
    setSelectedPlayer(player);
    setPlayerStats(null); 
    setStatsError(null);
    fetchStats(player.username, false, initialYear);
  };

  const analyzeFiltros = (player,data) =>{
    setSelectedPlayer(player);
    setPlayerStats(null); 
    setPlayerStats(data);
    setStatsError(null);
  }
  
  const fetchTopPlayers = async () => {
    try {
      const response = await api.get('/top-players');
      setTopPlayer(response.data);
    } catch (err) {
      console.error("Error fetching top players", err);
    }
  };

  const fetchUser = async (username) => {
    try {
      const target = username || 'jorgepr1'; 
      const response = await api.get(`/chessyo/${target}`); 
      setPerfil(response.data);
      setSelectedPlayer(prev => {
        if (!prev || prev.username === target) {
          return { username: target, avatar: response.data?.avatar };
        }
        return prev;
      });
    } catch (err) {
      console.error("Error fetching user profile", err);
    }
  };

  const fetchStats = async (username, isMainUser = false, year = '2025') => {
    if (!username) return;
    setIsLoadingStats(true);
    setStatsError(null);
    try {
      const response = await api.get(`/chesswrappedpandas/${username}/${year}`);
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
      const msg = err.response?.data?.detail || "No se encontraron partidas para este jugador en el período solicitado.";
      setStatsError(msg);
    } finally {
      setIsLoadingStats(false);
    }
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

  // Se activa cuando cambia initialUser o initialYear
  useEffect(() => {
    const usuarioActual = initialUser || 'jorgepr1';
    const anioActual = initialYear || '2025';
    
    fetchTopPlayers();
    fetchUser(usuarioActual); 
    fetchStats(usuarioActual, true, anioActual);
    setSelectedPlayer({ username: usuarioActual, avatar: null });
    
  }, [initialUser, initialYear]);


  return (
      <div className="flex flex-col h-screen w-full bg-white overflow-hidden">
        
        {/* BARRA SUPERIOR DE NAVEGACIÓN */}
        <div className="h-12 border-b border-gray-200 flex items-center px-4 bg-white shadow-sm z-10 flex-shrink-0">
            <button 
                onClick={onBack} 
                className="flex items-center text-gray-500 hover:text-blue-600 transition-colors font-medium text-sm cursor-pointer"
            >
                <ArrowLeft size={16} className="mr-2"/> 
                Volver a buscar
            </button>
            <div className="mx-4 h-4 w-[1px] bg-gray-300"></div>
            <span className="text-sm text-gray-400">Analizando a: <span className="text-gray-700 font-bold">{initialUser || 'jorgepr1'}</span> ({initialYear || '2025'})</span>
        </div>

        <div className="flex flex-1 overflow-hidden">
            <div className="w-[60%] border-r border-gray-200 flex flex-col bg-white h-full">
                <div className="flex-1 h-full">
                <BodyRigth
                    Datosuser={perfil || { username: initialUser }}
                    topPlayers={topPlayer}
                    amigos={misAmigos}
                    handleAnalyze={handleAnalyze}  
                    selectedGameMode={selectedGameMode}
                    setSelectedGameMode={setSelectedGameMode}
                    handleFavorite={handleFavorite}
                    isFavorited={isFavorited}
                    favorites={favorites}
                    analyzeFiltros={analyzeFiltros}
                />
            </div>
            </div>
            {/* parte derecha stats */}
            <main className="flex-1 bg-gray-50 flex flex-col h-full overflow-hidden">
            {statsError ? (
                <div className="flex items-center justify-center h-full text-gray-500 p-8">
                  <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
                    <h3 className="text-lg font-bold text-gray-800 mb-2">No se pudo cargar el análisis</h3>
                    <p className="text-sm text-gray-600 mb-6">{statsError}</p>
                    <button 
                      onClick={() => fetchStats(selectedPlayer?.username || initialUser, true, initialYear)} 
                      className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl cursor-pointer transition-colors shadow-sm"
                    >
                      Reintentar
                    </button>
                  </div>
                </div>
            ) : selectedPlayer ? (
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