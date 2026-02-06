import React, { useRef, useState, useEffect, useMemo } from 'react';
import Stories from 'react-insta-stories';
import { 
  Trophy, Zap, Volume2, VolumeX, 
  Flame, Skull, Sword, Crown, Clock, Heart,
  Hourglass, Target, Brain, Calendar, Watch, Users,Activity,Gamepad2
} from 'lucide-react';
import { ChessBishop,ChessKing,BadgeQuestionMark,ChessKnight,ChessRook,ChessQueen,ChessPawn } from 'lucide-react';
import miMusicaLocal from '../assets/piado-xhand-victory-183654.mp3';
import HeatmapSlide from './Analitics/ChessHeatmap'
// const MUSIC_URL = "https://cdn.pixabay.com/download/audio/2023/04/13/audio_845dd566d7.mp3?filename=phonk-furious-145636.mp3";
const MUSIC_URL = miMusicaLocal;



const StoryLayout = ({ bg, children }) => (
  <div className={`w-full h-full flex flex-col items-center justify-center p-6 ${bg} text-white text-center`}>
    {children}
  </div>
);

const getPieceInfo = (symbol) => {
    switch(symbol) {
        case 'P': return { name: 'El Peón', icon: <ChessPawn size={80} className="text-gray-300" />, desc: 'Alma del ajedrez' };
        case 'N': return { name: 'El Caballo', icon: <ChessKnight size={80} className="text-orange-400" />, desc: 'Maestro de la táctica' };
        case 'B': return { name: 'El Alfil', icon: <ChessBishop size={80} className="text-yellow-400" />, desc: 'Francotirador' };
        case 'R': return { name: 'La Torre', icon: <ChessRook size={80} className="text-yellow-400" />, desc: 'Fuerza bruta' };
        case 'Q': return { name: 'La Dama', icon: <ChessQueen size={80} className="text-yellow-400" />, desc: 'Poder absoluto' };
        case 'K': return { name: 'El Rey', icon: <ChessKing size={80} className="text-yellow-400" />, desc: 'El líder' };
        default: return { name: 'Desconocido', icon: <BadgeQuestionMark />, desc: '' };
    }
};

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
      audioRef.current.play().catch(error => console.log("Autoplay bloqueado:", error));
    }
  }, [playerData]);

  // --- CONFIGURACIÓN VISUAL ---
  const MODE_CONFIG = {
    bullet: { 
        label: 'Bullet', color: 'from-orange-500 to-red-600', 
        icon: <Zap size={80} className="mb-4 text-yellow-300 animate-pulse"/> 
    },
    blitz:  { 
        label: 'Blitz',  color: 'from-purple-600 to-indigo-700', 
        icon: <Flame size={80} className="mb-4 text-orange-300 animate-bounce"/> 
    },
    rapid:  { 
        label: 'Rapid',  color: 'from-emerald-500 to-teal-700', 
        icon: <Hourglass size={80} className="mb-4 text-emerald-200"/> 
    },
    daily:  { 
        label: 'Daily',  color: 'from-blue-500 to-cyan-600', 
        icon: <Brain size={80} className="mb-4 text-white"/> 
    }
  };

  // --- HELPER PARA LA HORA ---
  const formatHour = (hour24) => {
      const h = parseInt(hour24);
      if (isNaN(h)) return "N/A";
      if (h === 0) return "12 AM";
      if (h < 12) return `${h} AM`;
      if (h === 12) return "12 PM";
      return `${h - 12} PM`;
  };

  // --- PROCESAMIENTO DE DATOS ---
  const data = useMemo(() => {
    if (!playerData || !playerData.total) return null;
    
    const total = playerData.total;
    
    // 1. Tiempos
    const hoursPlayed = Math.floor(total.tiempo_jugado / 3600);
    const daysPlayed = (hoursPlayed / 24).toFixed(1);

    // 2. Personalidad
    let personalityIcon = <Trophy size={80} className="mb-6 text-yellow-300" />;
    if (total.personality === "Barry Allen") personalityIcon = <Zap size={80} className="mb-6 text-yellow-400 animate-pulse" />;
    if (total.personality === "El Carnicero") personalityIcon = <Sword size={80} className="mb-6 text-red-500" />;
    if (total.personality === "El Estratega") personalityIcon = <Brain size={80} className="mb-6 text-blue-300" />;

    // 3. Procesar Categorías
    const categorySlides = [];
    ['bullet', 'blitz', 'rapid', 'daily'].forEach(modeKey => {
        if (playerData[modeKey] && playerData[modeKey].total_partidas > 0) {
            const stats = playerData[modeKey];
            const config = MODE_CONFIG[modeKey];
            const winRate = stats.total_partidas > 0 
                ? ((stats.victorias / stats.total_partidas) * 100).toFixed(1) 
                : 0;

            categorySlides.push({
                mode: modeKey,
                label: config.label,
                icon: config.icon,
                gradient: config.color,
                eloMax: stats.elo_maximo,
                games: stats.total_partidas,
                winRate: winRate,
                streak: stats.racha_maxima
            });
        }
    });

    // 4. Procesar Amigos
    let topFriends = [];
    if (total.amigos) {
        topFriends = Object.entries(total.amigos)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([name, count]) => ({ name, count }));
    }

    const formattedTime = formatHour(total.hora_top.name);
    

    const heatmapMatrix = playerData.heatmap || null;
    const statsWhite = total.stats_blancas || { winrate: 0, total: 0 };
    const statsBlack = total.stats_negras || { winrate: 0, total: 0 };


    // pieza favorita
    let piezaFavorita = { name: 'N/A', count: 0, icon: null };
    
    // El backend nos manda: { P: 100, N: 50... } (Puede estar en playerData raíz o en total, revisa tu main.py)
    // Según mi código de main.py arriba, lo pusimos en datafinal['piezas_movidas'] -> playerData.piezas_movidas
    const piezasRaw = playerData.piezas_movidas || {};
    const PIECE_COUNTS = { P: 8, N: 2, B: 2, R: 2, Q: 1.5, K: 1.5 };
    if (Object.keys(piezasRaw).length > 0) {
        let maxScore = -1;
        let bestKey = null;
        let totalMovesAll = 0;

        Object.entries(piezasRaw).forEach(([key, rawCount]) => {
            totalMovesAll += rawCount;
            
            // FORMULA DE JUSTICIA:
            // Dividimos los movimientos entre la cantidad de piezas.
            // Ejemplo: 800 movs de peón / 8 = 100 puntos.
            //          300 movs de dama / 1 = 300 puntos. (Gana la Dama)
            const divisor = PIECE_COUNTS[key] || 1;
            const score = rawCount / divisor;

            if (score > maxScore) {
                maxScore = score;
                bestKey = key;
            }
        });

        if (bestKey) {
            const info = getPieceInfo(bestKey);
            piezaFavorita = {
                ...info,
                count: piezasRaw[bestKey], // Mostramos el número real (ej. 300)
                totalMoves: totalMovesAll
            };
        }
    }
    console.log()
    return {
        total,
        hoursPlayed,
        daysPlayed,
        personalityIcon,
        categorySlides,
        topFriends,
        formattedTime,
        heatmapMatrix,
        statsWhite,
        statsBlack,
        piezaFavorita
    };
  }, [playerData]);

    if (!data) return <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white">
          <Activity className="animate-spin mb-4 text-green-500" size={40} />
          <p>Calculando estadísticas...</p>
        </div>;

  // --- DEFINICIÓN DE HISTORIAS ---
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
          <div className="bg-white/10 px-4 py-2 rounded-full border border-white/20">
             <p className="text-gray-300 text-sm">Resumen Oficial</p>
          </div>
        </StoryLayout>
      ),
    },
    // 2. TIEMPO
    {
      content: () => (
        <StoryLayout bg="bg-gradient-to-br from-slate-800 to-black">
          <Watch size={80} className="mb-6 text-blue-400 animate-pulse" />
          
          <h2 className="text-7xl font-black mb-2">{data.hoursPlayed}</h2>
          <p className="text-2xl font-medium mb-2 text-blue-200">Horas Jugadas</p>
          
          <div className="w-20 h-1 bg-blue-500 my-4 rounded-full"></div>
          
          <p className="text-lg mb-8">Equivalente a <span className="font-bold text-yellow-400">{data.daysPlayed} días</span> enteros.</p>

          {/* --- AQUÍ ESTÁ EL NUEVO BLOQUE DE TOTAL DE PARTIDAS --- */}
          <div className="flex items-center gap-4 bg-white/10 px-6 py-3 rounded-xl border border-white/10 shadow-lg transform scale-100 hover:scale-105 transition-transform">
             <div className="bg-blue-500/20 p-2 rounded-full">
                <Gamepad2 className="text-blue-400" size={28} />
             </div>
             <div className="text-left">
                <p className="text-[10px] uppercase tracking-wider opacity-60 font-bold">Total Partidas</p>
                <p className="text-3xl font-bold text-white leading-none">{data.total.total_partidas}</p>
             </div>
          </div>
        </StoryLayout>
      ),
    },
    // 3. MOMENTO
    {
        content: () => (
          <StoryLayout bg="bg-gradient-to-br from-indigo-900 to-purple-900">
            <Calendar size={80} className="mb-6 text-purple-300" />
            <p className="text-xl opacity-80 mb-4">Tu Momento Favorito</p>
            <div className="bg-white/10 p-6 rounded-xl w-full max-w-sm mb-4 border border-white/5">
                <p className="text-sm uppercase tracking-widest text-purple-200">Día más activo</p>
                <h2 className="text-4xl font-bold">{data.total.dia_semana_top.name}</h2>
            </div>
            <div className="bg-white/10 p-6 rounded-xl w-full max-w-sm border border-white/5">
                <p className="text-sm uppercase tracking-widest text-purple-200">Hora de vicio</p>
                <h2 className="text-4xl font-bold">{data.formattedTime}</h2>
            </div>
          </StoryLayout>
        ),
    }
  ];

  // 4. DIAPOSITIVAS POR MODO
  data.categorySlides.forEach(cat => {
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
                    <p className="mt-4 text-xs opacity-50 text-center">{cat.games} partidas jugadas</p>
                </div>
            </StoryLayout>
        )
    });
  });

  // 5. FUN STORIES FINALES
  const funStories = [
     // APERTURA
     {
        content: () => (
         <StoryLayout bg="bg-gradient-to-br from-pink-600 to-purple-800">
           <Target size={80} className="mb-6 text-white animate-spin-slow" />
           <p className="text-xl opacity-80 mb-2">Tu Arma Favorita</p>
           <h2 className="text-3xl font-black mb-4 px-2 leading-tight bg-black/20 py-2 rounded-lg">
             {data.total.apertura_top.name}
           </h2>
           <p>La usaste <span className="font-bold text-yellow-300 text-2xl">{data.total.apertura_top.count}</span> veces.</p>
         </StoryLayout>
       ), 
     },
     {
        content: () => (
            <StoryLayout bg="bg-gradient-to-br from-gray-800 via-gray-900 to-black">
                <div className="flex flex-col items-center justify-center w-full h-full gap-8">
                    <h2 className="text-3xl font-black uppercase text-white mb-4">Tu Color Dominante</h2>
                    
                    {/* BLANCAS */}
                    <div className="w-full max-w-xs bg-gray-200 text-black p-4 rounded-xl shadow-lg transform -rotate-1">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-xl">Blancas</span>
                            <Crown size={24} className="text-yellow-600"/>
                        </div>
                        <div className="text-5xl font-black mb-1">{data.statsWhite.winrate}%</div>
                        <p className="text-xs opacity-60 font-bold uppercase">Victoria</p>
                        <p className="text-xs mt-2">{data.statsWhite.total} partidas</p>
                    </div>

                    {/* VS */}
                    <div className="font-black text-2xl text-red-500 italic">VS</div>

                    {/* NEGRAS */}
                    <div className="w-full max-w-xs bg-gray-900 text-white p-4 rounded-xl shadow-lg border border-gray-700 transform rotate-1">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-xl">Negras</span>
                            <Crown size={24} className="text-gray-500"/>
                        </div>
                        <div className="text-5xl font-black mb-1">{data.statsBlack.winrate}%</div>
                        <p className="text-xs opacity-60 font-bold uppercase">Victoria</p>
                         <p className="text-xs mt-2">{data.statsBlack.total} partidas</p>
                    </div>
                </div>
            </StoryLayout>
        )
     },
     // heatmapMatrix
     (data.heatmapMatrix) && {
        content: () => <HeatmapSlide matrix={data.heatmapMatrix} />
     },
     (data.piezaFavorita.count > 0) && {
        content: () => (
         <StoryLayout bg="bg-gradient-to-br from-indigo-900 via-purple-900 to-black">
           <div className="animate-bounce mb-6">
               {data.piezaFavorita.icon}
           </div>
           
           <p className="text-xl opacity-70 mb-2 uppercase tracking-widest">Tu Fiel Compañero</p>
           
           <h2 className="text-5xl font-black mb-2 text-white">
             {data.piezaFavorita.name}
           </h2>
           
           <div className="bg-white/10 px-6 py-2 rounded-full border border-white/20 mb-8 inline-block">
                <span className="text-purple-200 italic">"{data.piezaFavorita.desc}"</span>
           </div>

           <div className="grid grid-cols-2 gap-4 w-full max-w-xs text-left">
                <div className="bg-black/30 p-4 rounded-xl border border-white/10">
                    <p className="text-xs uppercase opacity-60 mb-1">Movimientos</p>
                    <p className="text-3xl font-bold text-purple-300">{data.piezaFavorita.count}</p>
                </div>
                <div className="bg-black/30 p-4 rounded-xl border border-white/10">
                    <p className="text-xs uppercase opacity-60 mb-1">% del Total</p>
                    <p className="text-3xl font-bold text-pink-300">
                        {((data.piezaFavorita.count / data.piezaFavorita.totalMoves) * 100).toFixed(0)}%
                    </p>
                </div>
           </div>
         </StoryLayout>
       ), 
     },

     // NÉMESIS VS PET
     (data.total.nemesis.count > 0 || data.total.pet.count > 0) && {
        content: () => (
         <StoryLayout bg="bg-gradient-to-br from-gray-900 to-red-900">
            {data.total.nemesis.count > 0 && (
                <div className="mb-6 w-full">
                    <div className="flex items-center justify-center gap-2 mb-2 text-red-400">
                        <Skull size={24} className="animate-bounce"/> <span className="uppercase font-bold tracking-widest">Tu Pesadilla</span>
                    </div>
                    <h3 className="text-3xl font-bold">{data.total.nemesis.name}</h3>
                    <p className="text-sm text-red-200">Te ganó {data.total.nemesis.count} veces</p>
                </div>
            )}
            {data.total.nemesis.count > 0 && data.total.pet.count > 0 && (
                <div className="w-16 h-1 bg-white/20 my-2 rounded-full"></div>
            )}
            {data.total.pet.count > 0 && (
                <div className="mt-6 w-full">
                    <div className="flex items-center justify-center gap-2 mb-2 text-green-400">
                        <Heart size={24} className="animate-pulse"/> <span className="uppercase font-bold tracking-widest">Tu Cliente VIP</span>
                    </div>
                    <h3 className="text-3xl font-bold">{data.total.pet.name}</h3>
                    <p className="text-sm text-green-200">Le ganaste {data.total.pet.count} veces</p>
                </div>
            )}
         </StoryLayout>
       ), 
     },

     // CÍRCULO SOCIAL
     (data.topFriends.length > 0) && {
        content: () => (
            <StoryLayout bg="bg-gradient-to-br from-cyan-600 to-blue-800">
                <Users size={80} className="mb-6 text-cyan-200" />
                <h2 className="text-3xl font-bold mb-6">Rivales Frecuentes</h2>
                <div className="w-full max-w-xs space-y-4">
                    {data.topFriends.map((friend, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-black/20 p-4 rounded-lg border border-white/10">
                            <div className="flex items-center gap-3">
                                <span className="text-cyan-300 font-bold">#{idx + 1}</span>
                                <span className="font-bold">{friend.name}</span>
                            </div>
                            <span className="bg-white/20 px-2 py-1 rounded text-xs">{friend.count} games</span>
                        </div>
                    ))}
                </div>
            </StoryLayout>
        )
     },

     // PERSONALIDAD
     {
        content: () => (
         <StoryLayout bg="bg-gradient-to-br from-green-600 to-emerald-900">
           {data.personalityIcon}
           <p className="text-xl mb-4 opacity-80">Tu Personalidad</p>
           <h2 className="text-5xl font-black mb-6 uppercase">{data.total.personality}</h2>
           <div className="grid grid-cols-2 gap-4 w-full max-w-xs text-left text-sm bg-black/20 p-4 rounded-xl">
                <div>Total Victorias:</div>
                <div className="text-right font-bold">{data.total.victorias}</div>
                <div>Racha Global:</div>
                <div className="text-right font-bold">{data.total.racha_maxima}</div>
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
                defaultInterval={20000}
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