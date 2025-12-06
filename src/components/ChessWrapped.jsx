import React, { useRef, useState, useEffect } from 'react';
import Stories from 'react-insta-stories';
import { Trophy, Target, Zap, Brain, Activity, Volume2, VolumeX } from 'lucide-react';

const MUSIC_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

const ChessWrapped = ({ player, playerData }) => {
  const audioRef = useRef(null);
  
  const [isMuted, setIsMuted] = useState(true);

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = 0.15;
      if (audio.paused) audio.play();
    }
    setIsMuted(!isMuted);
  };

  // Efecto de AutoPlay
  useEffect(() => {
    if (audioRef.current && playerData) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
          console.log("Autoplay bloqueado (raro si está muteado):", error);
      });
    }
  }, [playerData]);

  // Validación de datos
  if (!playerData || !playerData.stats) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white">
        <Activity className="animate-spin mb-4 text-green-500" size={40} />
        <p>Calculando estadísticas...</p>
      </div>
    );
  }

  const stats = playerData.stats;

  // Procesamiento de datos
  const getWrappedData = () => {
    const modes = ['chess_daily', 'chess_rapid', 'chess_bullet', 'chess_blitz'];
    let totalGames = 0, totalWins = 0, bestRating = 0, bestMode = 'N/A';
    
    modes.forEach(mode => {
        if (stats[mode]?.record) {
            const wins = stats[mode].record.win || 0;
            const loss = stats[mode].record.loss || 0;
            const draw = stats[mode].record.draw || 0;
            
            totalGames += (wins + loss + draw);
            totalWins += wins;

            if (stats[mode].best?.rating > bestRating) {
                bestRating = stats[mode].best.rating;
                bestMode = mode.replace('chess_', '');
            }
        }
    });

    const winRate = totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(1) : 0;

    return { 
        totalGames, 
        totalWins, 
        winRate,
        bestRating, 
        bestMode: bestMode.charAt(0).toUpperCase() + bestMode.slice(1), 
        puzzleRecord: stats.puzzle_rush?.best?.score || 0, 
        tacticsRating: stats.tactics?.highest?.rating || 0 
    };
  };

  const data = getWrappedData();

  const StoryLayout = ({ bg, children }) => (
    <div className={`w-full h-full flex flex-col items-center justify-center p-8 ${bg} text-white`}>
      {children}
    </div>
  );

  const stories = [
    {
      content: () => (
        <StoryLayout bg="bg-gradient-to-br from-gray-900 to-black">
          {player.avatar && (
              <img src={player.avatar} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-green-500 mb-6 shadow-xl" />
          )}
          <h1 className="text-4xl font-bold mb-2">{player.username}</h1>
          <h2 className="text-2xl font-bold text-green-400 mb-6">CHESS WRAPPED</h2>
          <p className="text-gray-400">Resumen de Estadísticas</p>
        </StoryLayout>
      ),
    },
    {
      content: () => (
        <StoryLayout bg="bg-gradient-to-br from-indigo-600 to-blue-700">
          <Activity size={80} className="mb-6 text-white/80" />
          <h2 className="text-7xl font-black mb-2">{data.totalGames}</h2>
          <p className="text-2xl font-medium mb-8">Partidas Jugadas</p>
          <div className="bg-white/20 px-6 py-3 rounded-full">
            <p className="text-lg">¡No paraste de jugar!</p>
          </div>
        </StoryLayout>
      ),
    },
    {
      content: () => (
        <StoryLayout bg="bg-gradient-to-br from-emerald-600 to-green-800">
          <Trophy size={80} className="mb-6 text-yellow-300 drop-shadow-lg" />
          <h2 className="text-7xl font-black mb-2">{data.totalWins}</h2>
          <p className="text-2xl font-medium">Victorias</p>
          <p className="text-green-200 mt-2 text-lg">({data.winRate}% Win Rate)</p>
        </StoryLayout>
      ),
    },
    {
       content: () => (
        <StoryLayout bg="bg-gradient-to-br from-orange-500 to-red-600">
          <Zap size={80} className="mb-6 text-yellow-200" />
          <p className="text-xl text-orange-100 mb-4 font-light">TU PICO MÁXIMO</p>
          <div className="bg-black/20 backdrop-blur-md p-8 rounded-2xl border border-white/10 text-center w-full max-w-xs">
            <h2 className="text-6xl font-black">{data.bestRating}</h2>
            <p className="text-2xl mt-2 font-bold uppercase tracking-widest">{data.bestMode}</p>
          </div>
        </StoryLayout>
      ), 
    },
    {
        content: () => (
         <StoryLayout bg="bg-gradient-to-br from-purple-600 to-pink-600">
           <Brain size={80} className="mb-6 text-white/90" />
           <div className="space-y-8 w-full max-w-xs text-center">
             <div>
                <p className="text-purple-200 text-sm uppercase tracking-wider mb-1">Mejor Táctica</p>
                <h3 className="text-5xl font-bold">{data.tacticsRating}</h3>
             </div>
             <div className="h-px bg-white/30 w-full"></div>
             <div>
                <p className="text-pink-200 text-sm uppercase tracking-wider mb-1">Puzzle Rush</p>
                <h3 className="text-5xl font-bold">{data.puzzleRecord}</h3>
             </div>
           </div>
         </StoryLayout>
       ), 
     }
  ];
  
  return (
    <div className="w-full h-full bg-black relative shadow-2xl overflow-hidden">
      <audio ref={audioRef} src={MUSIC_URL} loop muted={isMuted}/>
      
      {/* CAMBIOS CLAVE:
         1. position: fixed -> Se asegura que esté pegado a la pantalla, por encima de todo.
         2. z-[9999] -> Un número muy alto para ganarle a la librería.
         3. pointer-events-auto -> Fuerza a que el botón reciba clics.
      */}
      <button 
            onClick={(e) => {
                e.stopPropagation(); // Evita que el clic pase a las historias
                toggleAudio();
                console.log("¡Clic recibido!");
            }}
            className="fixed top-6 right-6 z-[9999] cursor-pointer pointer-events-auto bg-black/50 hover:bg-black/80 backdrop-blur-md text-white p-3 rounded-full border border-white/20 transition-transform hover:scale-110"
            style={{ isolation: 'isolate' }} // Crea un nuevo contexto de apilamiento
        >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </button>

      {/* El contenedor de historias va debajo */}
      <div className="absolute inset-0 z-0">
          <Stories
                stories={stories}
                defaultInterval={7000}
                width="100%"
                height="100%"
                loop={true}
                storyContainerStyles={{ overflow: 'hidden' }}
            />
      </div>
    </div>
  );
};

export default ChessWrapped;