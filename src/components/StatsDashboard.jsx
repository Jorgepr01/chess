import React from 'react';
import {BarChart3,TrendingUp,Trophy,Target,Zap,Brain,Activity,Medal,Calendar} from 'lucide-react';

const StatsDashboard = ({ player, playerData }) => {

  const isTopPlayer = player.rank !== undefined;
  
  const stats = playerData?.stats || {};
  
  // Cálculo de totales (igual que antes)
  const calculateTotals = () => {
    const modes = ['chess_daily', 'chess_rapid', 'chess_bullet', 'chess_blitz'];
    let wins = 0, losses = 0, draws = 0;

    for (let i = 0; i < modes.length; i++) {
      const mode = modes[i]; // Obtenemos el nombre del modo (ej: 'chess_rapid')

      if (stats[mode] && stats[mode].record) {
        wins += stats[mode].record.win || 0;
        losses += stats[mode].record.loss || 0;
        draws += stats[mode].record.draw || 0;
      }
    }

    if (wins === 0 && isTopPlayer) {
        wins = player.win_count || 0;
        losses = player.loss_count || 0;
        draws = player.draw_count || 0;
    }

    const total = wins + losses + draws;
    const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : 0;
    return { wins, losses, draws, total, winRate };
  };

  const totals = calculateTotals();

  const GameModeCard = ({ title, data, icon: Icon, color }) => {
    if (!data) return null;
    return (
      <div className={`p-4 border rounded-lg ${color}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon size={20} />
            <h3 className="font-semibold text-gray-900 capitalize">{title}</h3>
          </div>
          <span className="text-sm font-bold bg-white px-2 py-1 rounded shadow-sm">
            {data.last?.rating || 'N/A'}
          </span>
        </div>
        <div className="space-y-1 text-sm text-gray-600">
          <p>Mejor: <span className="font-medium text-gray-900">{data.best?.rating || 'N/A'}</span></p>
          <div className="flex gap-2 text-xs mt-2">
            <span className="text-green-600">G: {data.record?.win}</span>
            <span className="text-red-600">P: {data.record?.loss}</span>
            <span className="text-gray-500">T: {data.record?.draw}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="space-y-6">
        
        {/* ENCABEZADO ADAPTATIVO */}
        <div className="border-b border-gray-200 pb-4 flex items-center gap-4">
            <div className="relative">
                {player.avatar ? (
                    <img src={player.avatar} alt={player.username} className="w-16 h-16 rounded-full border-2 border-gray-100" />
                ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                        <BarChart3 />
                    </div>
                )}
                {/* Si tiene titulo (GM, FM) lo mostramos */}
                {player.title && (
                    <span className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm border border-white">
                        {player.title}
                    </span>
                )}
            </div>
            
            <div>
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-gray-900">{player.name || player.username}</h2>
                    {/* Badge de Status (Premium/Basic) */}
                    {player.status === 'premium' && (
                        <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 rounded-full border border-yellow-200">
                            PRO
                        </span>
                    )}
                </div>

                {/* Renderizado Condicional según tipo de Datos */}
                {isTopPlayer ? (
                    // DISEÑO PARA TOP PLAYERS (Rank, Score)
                    <div className="flex gap-3 text-sm mt-1">
                        <div className="flex items-center gap-1 text-amber-600 font-medium">
                            <Medal size={14} />
                            <span>Rank Global #{player.rank}</span>
                        </div>
                        <div className="text-gray-500">
                            Score: <span className="text-gray-900 font-semibold">{player.score}</span>
                        </div>
                    </div>
                ) : (
                    // DISEÑO PARA PERFIL NORMAL (Joined, League)
                    <div className='flex gap-2 mt-1'>
                        {player.joined && (
                            <p className="text-gray-500 text-sm flex items-center gap-1">
                                <Calendar size={12} />
                                {new Date(player.joined * 1000).getFullYear()}
                            </p>
                        )}
                        {player.league && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
                                {player.league}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* TARJETAS PRINCIPALES */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="text-blue-600" size={20} />
              <p className="text-sm text-gray-600">Total Partidas</p>
            </div>
            {/* Usamos totals.total o calculamos sumando wins+loss del objeto player top */}
            <p className="text-3xl font-bold text-gray-900">
                {totals.total || (player.win_count + player.loss_count + player.draw_count) || 0}
            </p>
          </div>
          
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-green-600" size={20} />
              <p className="text-sm text-gray-600">% Victoria</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totals.winRate}%</p>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Victorias</p>
            <p className="text-2xl font-bold text-green-600">{totals.wins}</p>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Derrotas</p>
            <p className="text-2xl font-bold text-red-600">{totals.losses}</p>
          </div>
        </div>

        {/* Si NO hay stats cargados aún pero es Top Player, mostramos aviso o loading */}
        {(!stats.chess_rapid && !stats.chess_blitz) && (
            <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">Cargando detalles de partidas...</p>
            </div>
        )}

        {/* SECCIÓN DE MODOS DE JUEGO (Solo se muestra si 'stats' tiene datos) */}
        {(stats.chess_rapid || stats.chess_blitz || stats.chess_bullet) && (
            <>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Target size={20} className="text-gray-500"/>
                        Ratings por Modo
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <GameModeCard title="Rapid" data={stats.chess_rapid} icon={Activity} color="bg-green-50 border-green-200 text-green-700"/>
                        <GameModeCard title="Blitz" data={stats.chess_blitz} icon={Zap} color="bg-yellow-50 border-yellow-200 text-yellow-700"/>
                        <GameModeCard title="Bullet" data={stats.chess_bullet} icon={Target} color="bg-orange-50 border-orange-200 text-orange-700"/>
                        <GameModeCard title="Daily" data={stats.chess_daily} icon={Brain} color="bg-blue-50 border-blue-200 text-blue-700"/>
                    </div>
                </div>

                <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg bg-indigo-50">
                    <div className="flex items-center gap-2 mb-3">
                    <Brain className="text-indigo-600" size={20} />
                    <h3 className="font-semibold text-gray-900">Entrenamiento Mental</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Táctica (Highest)</p>
                        <p className="font-medium text-2xl text-gray-900">
                            {stats.tactics?.highest?.rating || 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Puzzle Rush</p>
                        <p className="font-medium text-2xl text-gray-900">
                            {stats.puzzle_rush?.best?.score || 0}
                        </p>
                    </div>
                    </div>
                </div>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default StatsDashboard;