// Mock Data extracted from App.jsx
export const MOCK_DATA = {
  currentUser: {
    id: 'user1',
    name: 'Juan García',
    stats: {
      totalGames: 342,
      wins: 189,
      losses: 131,
      draws: 22,
      winRate: 55.3,
      favoriteOpening: 'Defensa Siciliana',
      currentStreak: 5,
      nemesis: 'Ana Rodríguez',
      mascot: 'Caballo Blanco',
      winsReasons: ['Jaque mate: 45%', 'Rendición: 35%', 'Tiempo: 20%'],
      lossReasons: ['Jaque mate: 50%', 'Error grave: 30%', 'Tiempo: 20%'],
      recentGames: [
        { opponent: 'Pedro López', result: 'Victoria', date: '2024-11-28' },
        { opponent: 'María Torres', result: 'Victoria', date: '2024-11-27' },
        { opponent: 'Carlos Díaz', result: 'Derrota', date: '2024-11-26' }
      ]
    }
  },
  topPlayers: {
    bullet: [
      { id: 'top1', name: 'Magnus Carlsen', rating: 2847, stats: { totalGames: 5234, wins: 3845, losses: 1123, draws: 266, winRate: 73.5, favoriteOpening: 'Apertura Española', currentStreak: 12, nemesis: 'Hikaru Nakamura', mascot: 'Rey Dorado', winsReasons: ['Jaque mate: 60%', 'Rendición: 30%', 'Tiempo: 10%'], lossReasons: ['Jaque mate: 55%', 'Error: 25%', 'Tiempo: 20%'], recentGames: [{ opponent: 'Hikaru Nakamura', result: 'Victoria', date: '2024-11-28' }, { opponent: 'Fabiano Caruana', result: 'Victoria', date: '2024-11-27' }] } },
      { id: 'top2', name: 'Hikaru Nakamura', rating: 2821, stats: { totalGames: 4892, wins: 3456, losses: 1234, draws: 202, winRate: 70.7, favoriteOpening: 'Defensa India del Rey', currentStreak: 8, nemesis: 'Magnus Carlsen', mascot: 'Torre Invencible', winsReasons: ['Jaque mate: 55%', 'Rendición: 35%', 'Tiempo: 10%'], lossReasons: ['Jaque mate: 50%', 'Error: 30%', 'Tiempo: 20%'], recentGames: [{ opponent: 'Magnus Carlsen', result: 'Derrota', date: '2024-11-28' }] } },
      { id: 'top3', name: 'Alireza Firouzja', rating: 2804, stats: { totalGames: 3456, wins: 2345, losses: 987, draws: 124, winRate: 67.8, favoriteOpening: 'Gambito de Dama', currentStreak: 6, nemesis: 'Magnus Carlsen', mascot: 'Alfil Negro', winsReasons: ['Jaque mate: 58%', 'Rendición: 32%', 'Tiempo: 10%'], lossReasons: ['Jaque mate: 52%', 'Error: 28%', 'Tiempo: 20%'], recentGames: [] } }
    ],
    blitz: [
      { id: 'top4', name: 'Magnus Carlsen', rating: 2847, stats: { totalGames: 5234, wins: 3845, losses: 1123, draws: 266, winRate: 73.5, favoriteOpening: 'Apertura Española', currentStreak: 12, nemesis: 'Hikaru Nakamura', mascot: 'Rey Dorado', winsReasons: ['Jaque mate: 60%', 'Rendición: 30%', 'Tiempo: 10%'], lossReasons: ['Jaque mate: 55%', 'Error: 25%', 'Tiempo: 20%'], recentGames: [{ opponent: 'Hikaru Nakamura', result: 'Victoria', date: '2024-11-28' }] } }
    ],
    rapid: [
      { id: 'top5', name: 'Magnus Carlsen', rating: 2847, stats: { totalGames: 5234, wins: 3845, losses: 1123, draws: 266, winRate: 73.5, favoriteOpening: 'Apertura Española', currentStreak: 12, nemesis: 'Hikaru Nakamura', mascot: 'Rey Dorado', winsReasons: ['Jaque mate: 60%', 'Rendición: 30%', 'Tiempo: 10%'], lossReasons: ['Jaque mate: 55%', 'Error: 25%', 'Tiempo: 20%'], recentGames: [{ opponent: 'Hikaru Nakamura', result: 'Victoria', date: '2024-11-28' }] } }
    ]
  },
  friends: [
    { id: 'friend1', name: 'Ana Rodríguez', gamesPlayed: 45, stats: { totalGames: 234, wins: 134, losses: 89, draws: 11, winRate: 57.3, favoriteOpening: 'Defensa Francesa', currentStreak: 3, nemesis: 'Juan García', mascot: 'Dama Blanca', winsReasons: ['Jaque mate: 50%', 'Rendición: 35%', 'Tiempo: 15%'], lossReasons: ['Jaque mate: 48%', 'Error: 32%', 'Tiempo: 20%'], recentGames: [{ opponent: 'Juan García', result: 'Victoria', date: '2024-11-28' }] } },
    { id: 'friend2', name: 'Pedro López', gamesPlayed: 38, stats: { totalGames: 189, wins: 98, losses: 78, draws: 13, winRate: 51.9, favoriteOpening: 'Apertura Italiana', currentStreak: 2, nemesis: 'Ana Rodríguez', mascot: 'Peón Valiente', winsReasons: ['Jaque mate: 45%', 'Rendición: 40%', 'Tiempo: 15%'], lossReasons: ['Jaque mate: 55%', 'Error: 25%', 'Tiempo: 20%'], recentGames: [] } },
    { id: 'friend3', name: 'Ana Rodríguez', gamesPlayed: 45, stats: { totalGames: 234, wins: 134, losses: 89, draws: 11, winRate: 57.3, favoriteOpening: 'Defensa Francesa', currentStreak: 3, nemesis: 'Juan García', mascot: 'Dama Blanca', winsReasons: ['Jaque mate: 50%', 'Rendición: 35%', 'Tiempo: 15%'], lossReasons: ['Jaque mate: 48%', 'Error: 32%', 'Tiempo: 20%'], recentGames: [{ opponent: 'Juan García', result: 'Victoria', date: '2024-11-28' }] } },
    { id: 'friend4', name: 'Pedro López', gamesPlayed: 38, stats: { totalGames: 189, wins: 98, losses: 78, draws: 13, winRate: 51.9, favoriteOpening: 'Apertura Italiana', currentStreak: 2, nemesis: 'Ana Rodríguez', mascot: 'Peón Valiente', winsReasons: ['Jaque mate: 45%', 'Rendición: 40%', 'Tiempo: 15%'], lossReasons: ['Jaque mate: 55%', 'Error: 25%', 'Tiempo: 20%'], recentGames: [] } },
    { id: 'friend5', name: 'Ana Rodríguez', gamesPlayed: 45, stats: { totalGames: 234, wins: 134, losses: 89, draws: 11, winRate: 57.3, favoriteOpening: 'Defensa Francesa', currentStreak: 3, nemesis: 'Juan García', mascot: 'Dama Blanca', winsReasons: ['Jaque mate: 50%', 'Rendición: 35%', 'Tiempo: 15%'], lossReasons: ['Jaque mate: 48%', 'Error: 32%', 'Tiempo: 20%'], recentGames: [{ opponent: 'Juan García', result: 'Victoria', date: '2024-11-28' }] } },
    { id: 'friend6', name: 'Pedro López', gamesPlayed: 38, stats: { totalGames: 189, wins: 98, losses: 78, draws: 13, winRate: 51.9, favoriteOpening: 'Apertura Italiana', currentStreak: 2, nemesis: 'Ana Rodríguez', mascot: 'Peón Valiente', winsReasons: ['Jaque mate: 45%', 'Rendición: 40%', 'Tiempo: 15%'], lossReasons: ['Jaque mate: 55%', 'Error: 25%', 'Tiempo: 20%'], recentGames: [] } },
    { id: 'friend7', name: 'María Torres', gamesPlayed: 32, stats: { totalGames: 156, wins: 89, losses: 56, draws: 11, winRate: 57.1, favoriteOpening: 'Apertura Inglesa', currentStreak: 4, nemesis: 'Pedro López', mascot: 'Torre Firme', winsReasons: ['Jaque mate: 52%', 'Rendición: 33%', 'Tiempo: 15%'], lossReasons: ['Jaque mate: 50%', 'Error: 30%', 'Tiempo: 20%'], recentGames: [] } }
  ]
};
