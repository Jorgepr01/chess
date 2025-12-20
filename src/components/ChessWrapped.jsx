import React, { useRef, useState, useEffect, useMemo } from 'react';
import Stories from 'react-insta-stories';
import { 
  Trophy, Zap, Activity, Volume2, VolumeX, 
  Flame, Skull, Sword, Crown, Clock, Heart,
  Hourglass, Target, Brain
} from 'lucide-react';

const MUSIC_URL = "https://cdn.pixabay.com/audio/2023/12/31/audio_dbcb35517e.mp3";



const ChessWrapped = ({ player, playerData }) => {
  const audioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  // --- AUDIO CONTROL ---
  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted) {
      audio.volume = 0.15;
      if (audio.paused) audio.play();
    }
    setIsMuted(!isMuted);
  };

  useEffect(() => {
    if (audioRef.current && playerData) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
          console.log("Autoplay bloqueado:", error);
      });
    }
  }, [playerData]);

  const data = useMemo(() => {
    if (!playerData || !playerData.stats) return null;

    const stats = playerData.stats;
    
    // Configuración de tiempos y colores
    const modesConfig = {
        bullet: { label: 'Bullet', timePerGame: 2, color: 'from-orange-500 to-red-600', icon: <Zap size={80} className="mb-4 text-yellow-300"/> },
        blitz:  { label: 'Blitz',  timePerGame: 10, color: 'from-purple-600 to-indigo-700', icon: <Flame size={80} className="mb-4 text-orange-300"/> },
        rapid:  { label: 'Rapid',  timePerGame: 20, color: 'from-emerald-500 to-teal-700', icon: <Hourglass size={80} className="mb-4 text-emerald-200"/> },
        daily:  { label: 'Daily',  timePerGame: 5,  color: 'from-blue-500 to-cyan-600', icon: <Brain size={80} className="mb-4 text-white"/> } 
    };
    
    let totalGames = 0;
    let totalWins = 0; // Necesario para la slide de personalidad antigua
    let totalMinutesPlayed = 0;
    const categoryDetails = [];
    let bestModeName = 'blitz';
    let maxGamesInMode = 0;
    let maxStreakGlobal = 0;

    // 1. Iterar por categorías
    Object.keys(modesConfig).forEach(key => {
        if (stats[key] && stats[key].cantidad_games > 0) {
            const s = stats[key];
            const config = modesConfig[key];
            
            const games = s.cantidad_games || 0;
            const wins = (s.w_with || 0) + (s.w_black || 0);
            const winRate = games > 0 ? ((wins / games) * 100).toFixed(1) : 0;
            
            totalGames += games;
            totalWins += wins;
            totalMinutesPlayed += (games * config.timePerGame);

            if (games > maxGamesInMode) {
                maxGamesInMode = games;
                bestModeName = key;
            }
            if (s.racha > maxStreakGlobal) maxStreakGlobal = s.racha;

            categoryDetails.push({
                mode: key,
                label: config.label,
                games,
                wins,
                winRate,
                eloMax: s.elo_max,
                streak: s.racha,
                gradient: config.color,
                icon: config.icon
            });
        }
    });
    Object.keys(modesConfig).forEach(key => {
      if (stats[key] && stats[key].cantidad_games > 0) {
      
      }
    });
    const sumaTotal=(obj)=>{
      if (!obj || Object.keys(obj).length === 0) return { name: 'N/A', count: 0 };

    }


    // 2. Extraer datos del modo principal (Némesis/Pet/Apertura)
    const mainStats = stats[bestModeName] || {};
    
    const getTop1 = (obj) => {
        if (!obj || Object.keys(obj).length === 0) return { name: 'N/A', count: 0 };
        console.log("Objeto recibido para pet/nemesis:", obj);
        const sorted = Object.entries(obj).sort((a, b) => b[1] - a[1]);
        return { name: sorted[0][0], count: sorted[0][1] };
    };
    const getMainpet_nemesis = (obj) => {
      console.log("Objeto recibido para pet/nemesis:", obj);
    }

    const topOpening = getTop1(mainStats.aperturas);
    const topNemesis = getTop1(mainStats.nemesis);
    const topPet = getTop1(mainStats.pet); // Recuperamos al "Hijo"
    
    const totalHours = Math.floor(totalMinutesPlayed / 60);
    const totalDays = (totalHours / 24).toFixed(1);
    const globalWinRate = totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(1) : 0;

    const reasonWin = mainStats.reason_win || {};
    const mates = reasonWin.checkmated || 0;
    const resigns = reasonWin.resigned || 0;
    const timeouts = reasonWin.timeout || 0;
    
    let personality = "Equilibrado";
    let personalityIcon = <Trophy size={80} className="mb-6 text-yellow-300" />;

    if (mates > resigns && mates > timeouts) {
        personality = "El Carnicero"; // Gana por mate
        personalityIcon = <Sword size={80} className="mb-6 text-red-500" />;
    } else if (timeouts > mates && timeouts > resigns) {
        personality = "El Sucio (Flagger)"; // Gana por tiempo
        personalityIcon = <Clock size={80} className="mb-6 text-blue-300" />;
    } else if (resigns > mates) {
        personality = "El Dominante"; // Se rinden ante él
        personalityIcon = <Crown size={80} className="mb-6 text-purple-400" />;
    }

    return {
        totalGames,
        totalWins,
        globalWinRate, // Agregado para la slide antigua
        totalMinutesPlayed,
        totalHours,
        totalDays,
        categoryDetails,
        maxStreakGlobal,
        topOpening,
        topNemesis,
        topPet, // Agregado para la slide antigua
        personality,
        personalityIcon // Agregado para la slide antigua
    };
  }, [playerData]);

  if (!data) return <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white">
          <Activity className="animate-spin mb-4 text-green-500" size={40} />
          <p>Calculando estadísticas...</p>
        </div>;

  // --- LAYOUT ---
  const StoryLayout = ({ bg, children }) => (
    <div className={`w-full h-full flex flex-col items-center justify-center p-6 ${bg} text-white text-center`}>
      {children}
    </div>
  );

  // --- CONSTRUCCIÓN DE STORIES ---
  const storiesList = [
    // 1. INTRO
    {
      content: () => (
        <StoryLayout bg="bg-gradient-to-b from-gray-900 via-gray-800 to-black">
          {player.avatar && (
              <img src={player.avatar} alt="Avatar" className="w-32 h-32 rounded-full border-4 border-green-500 mb-6 shadow-2xl" />
          )}
          <h1 className="text-4xl font-bold mb-2">{player.username}</h1>
          <h2 className="text-2xl font-bold text-green-400 mb-6">CHESS WRAPPED 2025</h2>
          <p className="text-gray-400">¿Estás listo para ver tus números?</p>
        </StoryLayout>
      ),
    },
    // 2. TIEMPO TOTAL
    {
      content: () => (
        <StoryLayout bg="bg-gradient-to-br from-slate-800 to-black">
          <Clock size={80} className="mb-6 text-blue-400 animate-pulse" />
          <h2 className="text-7xl font-black mb-2">{data.totalHours}</h2>
          <p className="text-2xl font-medium mb-2 text-blue-200">Horas Jugadas</p>
          <div className="w-20 h-1 bg-blue-500 my-4 rounded-full"></div>
          <p className="text-lg">Eso equivale a <span className="font-bold text-yellow-400">{data.totalDays} días</span> enteros sin dormir.</p>
        </StoryLayout>
      ),
    }
  ];

  // 3. DIAPOSITIVAS POR CATEGORÍA
  data.categoryDetails.forEach(cat => {
    storiesList.push({
        content: () => (
            <StoryLayout bg={`bg-gradient-to-br ${cat.gradient}`}>
                {cat.icon}
                <h2 className="text-5xl font-black uppercase tracking-wider mb-1">{cat.label}</h2>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 w-full max-w-sm border border-white/20 mt-6 shadow-xl">
                    <div className="mb-6">
                        <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Pico de ELO</p>
                        <h3 className="text-6xl font-black text-white drop-shadow-md">{cat.eloMax}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-left">
                        <div className="bg-black/20 p-3 rounded-lg">
                            <p className="text-xs opacity-70">Win Rate</p>
                            <p className="text-2xl font-bold text-green-300">{cat.winRate}%</p>
                        </div>
                        <div className="bg-black/20 p-3 rounded-lg">
                            <p className="text-xs opacity-70">Mejor Racha</p>
                            <p className="text-2xl font-bold text-yellow-300">x{cat.streak}</p>
                        </div>
                    </div>
                </div>
            </StoryLayout>
        )
    });
  });

  // 4. DIAPOSITIVAS FINALES (Las que te gustaron)
  const funStories = [
     {
        content: () => (
         <StoryLayout bg="bg-gradient-to-br from-pink-600 to-purple-800">
           <Target size={80} className="mb-6 text-white" />
           <p className="text-xl opacity-80 mb-2">Tu Arma Favorita</p>
           <h2 className="text-3xl font-black mb-4 px-2 leading-tight bg-black/20 py-2 rounded-lg">
             {data.topOpening.name}
           </h2>
           <p>La usaste <span className="font-bold text-yellow-300 text-2xl">{data.topOpening.count}</span> veces.</p>
         </StoryLayout>
       ), 
     },
     // 6. NÉMESIS VS PET (Restaurada original)
     (data.topNemesis.count > 0 || data.topPet.count > 0) && {
        content: () => (
         <StoryLayout bg="bg-gradient-to-br from-gray-900 to-red-900">
            {data.topNemesis.count > 0 && (
                <div className="mb-8 w-full">
                    <div className="flex items-center justify-center gap-2 mb-2 text-red-400">
                        <Skull size={24} /> <span className="uppercase font-bold tracking-widest">Tu Pesadilla</span>
                    </div>
                    <h3 className="text-3xl font-bold">{data.topNemesis.name}</h3>
                    <p className="text-sm text-red-200">Te ganó {data.topNemesis.count} veces</p>
                </div>
            )}
            
            {data.topNemesis.count > 0 && data.topPet.count > 0 && (
                <div className="w-16 h-1 bg-white/20 my-2 rounded-full"></div>
            )}

            {data.topPet.count > 0 && (
                <div className="mt-8 w-full">
                    <div className="flex items-center justify-center gap-2 mb-2 text-green-400">
                        <Heart size={24} /> <span className="uppercase font-bold tracking-widest">Tu Cliente VIP</span>
                    </div>
                    <h3 className="text-3xl font-bold">{data.topPet.name}</h3>
                    <p className="text-sm text-green-200">Le ganaste {data.topPet.count} veces</p>
                </div>
            )}
         </StoryLayout>
       ), 
     },
     // 7. PERSONALIDAD (Restaurada original)
     {
        content: () => (
         <StoryLayout bg="bg-gradient-to-br from-pink-600 to-rose-800">
           {data.personalityIcon}
           <p className="text-xl mb-4 opacity-80">Tu Estilo de Victoria</p>
           <h2 className="text-5xl font-black mb-6 uppercase">{data.personality}</h2>
           <div className="grid grid-cols-2 gap-4 w-full max-w-xs text-left text-sm bg-black/20 p-4 rounded-xl">
                <div>Win Rate Global:</div>
                <div className="text-right font-bold">{data.globalWinRate}%</div>
                <div>Total Wins:</div>
                <div className="text-right font-bold">{data.totalWins}</div>
           </div>
         </StoryLayout>
       ), 
     },
  ].filter(Boolean);

  const finalStories = [...storiesList, ...funStories];

  return (
    <div className="w-full h-full bg-black relative shadow-2xl overflow-hidden rounded-md">
      <audio ref={audioRef} src={MUSIC_URL} loop muted={isMuted}/>
      
      <button 
            onClick={(e) => {
                e.stopPropagation(); 
                toggleAudio();
            }}
            className="fixed top-6 right-6 z-[9999] cursor-pointer pointer-events-auto bg-black/50 hover:bg-black/80 backdrop-blur-md text-white p-3 rounded-full border border-white/20 transition-transform hover:scale-110"
            style={{ isolation: 'isolate' }}
        >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </button>

      <div className="absolute inset-0 z-0">
          <Stories
                stories={finalStories}
                defaultInterval={8000}
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