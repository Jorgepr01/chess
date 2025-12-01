import React from 'react';
import { BarChart3, TrendingUp, Trophy, Target, Zap } from 'lucide-react';

const StatsDashboard = ({ player, playerData }) => {
  if (!player) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <BarChart3 size={64} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg">Selecciona un jugador para ver sus estadísticas</p>
        </div>
      </div>
    );
  }
  console.log('StatsDashboard playerData:', playerData);
  const stats = playerData?.stats || {};
  console.log('StatsDashboard stats:', stats);
  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-gray-900">{player.username}</h2>
          <p className="text-gray-500 mt-1">Resumen anual de estadísticas</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="text-blue-600" size={20} />
              <p className="text-sm text-gray-600">Total de Partidas</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalGames}</p>
          </div>
          
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-green-600" size={20} />
              <p className="text-sm text-gray-600">% de Victoria</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.winRate}%</p>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Partidas Ganadas</p>
            <p className="text-2xl font-bold text-green-600">{stats.wins}</p>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Partidas Perdidas</p>
            <p className="text-2xl font-bold text-red-600">{stats.losses}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Target className="text-blue-600" size={20} />
              <h3 className="font-semibold text-gray-900">Detalles de Juego</h3>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Apertura Favorita</p>
                <p className="font-medium text-gray-900">{stats.favoriteOpening}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Némesis</p>
                <p className="font-medium text-gray-900">{stats.nemesis}</p>
              </div>
              {stats.mascot && (
                <div>
                  <p className="text-sm text-gray-600">Mascota</p>
                  <p className="font-medium text-gray-900">{stats.mascot}</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="text-orange-600" size={20} />
              <h3 className="font-semibold text-gray-900">Racha Actual</h3>
            </div>
            <p className="text-2xl font-bold text-orange-600">{stats.currentStreak} victorias</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Razones de Victoria</h4>
              <div className="space-y-1">
                {stats.winsReasons?.map((reason, idx) => (
                  <p key={idx} className="text-sm text-gray-600">{reason}</p>
                ))}
              </div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Razones de Derrota</h4>
              <div className="space-y-1">
                {stats.lossReasons?.map((reason, idx) => (
                  <p key={idx} className="text-sm text-gray-600">{reason}</p>
                ))}
              </div>
            </div>
          </div>

          {stats.recentGames && stats.recentGames.length > 0 && (
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Últimas Partidas</h3>
              <div className="space-y-2">
                {stats.recentGames.map((game, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-600">{game.opponent}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">{game.date}</span>
                      <span className={`text-sm font-medium ${
                        game.result === 'Victoria' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {game.result}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
