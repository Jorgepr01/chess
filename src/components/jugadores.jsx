import React, { useEffect, useState } from 'react';
import api from "../api.js"; // Asegúrate de que este archivo apunte a tu servidor FastAPI (http://127.0.0.1:8000)

const PerfilJugador = () => {
  const [busqueda, setBusqueda] = useState('');
  const [perfil, setPerfil] = useState(null);
  const [topPlayers, setTopPlayers] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('blitz');
  const [error, setError] = useState(null);

  // ESTADO NUEVO: Favoritos (Cargamos desde localStorage al inicio)
  const [favoritos, setFavoritos] = useState(() => {
    const guardados = localStorage.getItem('chessFavoritos');
    return guardados ? JSON.parse(guardados) : [];
  });

  // EFECTO: Guardar en localStorage cada vez que cambian los favoritos
  useEffect(() => {
    localStorage.setItem('chessFavoritos', JSON.stringify(favoritos));
  }, [favoritos]);

  // Función auxiliar para realizar la búsqueda (reutilizable)
  const realizarBusqueda = async (usuario) => {
    if (!usuario) return;
    
    // Actualizamos el input también por si viene de un clic en favoritos
    setBusqueda(usuario);

    try {
      setError(null);
      setPerfil(null);
      
      const response = await api.get(`/chessyo${usuario}`);
      setPerfil(response.data);
    } catch (err) {
      console.error("Error buscando perfil", err);
      setError("No se encontró el jugador o hubo un error.");
    }
  };

  // Manejador del botón Buscar
  const handleBuscar = () => {
    realizarBusqueda(busqueda);
  };

  // Función para añadir/quitar favoritos
  const toggleFavorito = () => {
    if (!perfil) return;

    const existe = favoritos.find(f => f.username === perfil.username);
    
    if (existe) {
      // Eliminar
      const nuevosFavoritos = favoritos.filter(f => f.username !== perfil.username);
      setFavoritos(nuevosFavoritos);
    } else {
      // Añadir (Guardamos solo lo básico: usuario y avatar)
      const nuevoFavorito = { username: perfil.username, avatar: perfil.avatar };
      setFavoritos([...favoritos, nuevoFavorito]);
    }
  };

  // Cargar Top Global
  const fetchTopPlayers = async () => {
    try {
      const response = await api.get('/top-players');
      setTopPlayers(response.data);
    } catch (err) {
      console.error("Error fetching top players", err);
    }
  };

  useEffect(() => {
    fetchTopPlayers();
  }, []);

  // Verificar si el perfil actual es favorito
  const esFavorito = perfil && favoritos.some(f => f.username === perfil.username);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Chess.com Explorer</h1>

      {/* --- BARRA DE HERRAMIENTAS UNIFICADA --- */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: '20px', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        backgroundColor: '#f4f4f4',
        padding: '20px',
        borderRadius: '8px'
      }}>
        {/* Buscador */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="Usuario (ej: hikaru)" 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ padding: '10px', fontSize: '16px', width: '200px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <button 
              onClick={handleBuscar}
              style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#7fa650', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Buscar
            </button>
        </div>

        <div style={{ width: '1px', height: '40px', backgroundColor: '#ccc', margin: '0 10px' }}></div>

        {/* Filtro */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label htmlFor="cat-select" style={{ fontWeight: 'bold', fontSize: '16px' }}>
              Ver Top:
            </label>
            <select 
              id="cat-select"
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
              style={{ padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '120px' }}
            >
              <option value="blitz">Blitz</option>
              <option value="rapidas">Rápidas</option>
              <option value="bala">Bala</option>
            </select>
        </div>
      </div>

      {/* --- BARRA DE FAVORITOS --- */}
      {favoritos.length > 0 && (
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>⭐ Mis Favoritos (Clic para ver)</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
            {favoritos.map(fav => (
              <div 
                key={fav.username} 
                onClick={() => realizarBusqueda(fav.username)}
                style={{ cursor: 'pointer', textAlign: 'center', width: '60px' }}
                title={`Ver perfil de ${fav.username}`}
              >
                <img 
                  src={fav.avatar || 'https://www.chess.com/bundles/web/images/user-image.svg'} 
                  alt={fav.username} 
                  style={{ width: '50px', height: '50px', borderRadius: '50%', border: '2px solid #7fa650', objectFit: 'cover' }}
                />
                <div style={{ fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {fav.username}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- RESULTADO DEL PERFIL --- */}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      {perfil && (
        <div style={{ 
          border: '1px solid #ddd', 
          padding: '20px', 
          borderRadius: '10px', 
          marginBottom: '40px', 
          backgroundColor: '#e8f5e9', 
          textAlign: 'center', 
          maxWidth: '500px', 
          margin: '0 auto 40px auto',
          position: 'relative' // Para posicionar el botón de favorito
        }}>
          
          {/* BOTÓN DE FAVORITOS */}
          <button 
            onClick={toggleFavorito}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: esFavorito ? '#FFD700' : '#ccc' // Dorado si es favorito, gris si no
            }}
            title={esFavorito ? "Quitar de favoritos" : "Añadir a favoritos"}
          >
            {esFavorito ? '★' : '☆'}
          </button>

          <h2 style={{ marginTop: 0 }}>Perfil Encontrado</h2>
          {perfil.avatar && (
            <img 
              src={perfil.avatar} 
              alt="Avatar" 
              style={{ width: '100px', borderRadius: '50%', marginBottom: '10px' }} 
            />
          )}
          <h3>{perfil.username} ({perfil.title || 'Sin título'})</h3>
          <p><strong>Seguidores:</strong> {perfil.followers}</p>
          <p><strong>País:</strong> {perfil.country ? perfil.country.split('/').pop() : 'N/A'}</p>
          <a href={perfil.url} target="_blank" rel="noopener noreferrer" style={{ color: '#7fa650', fontWeight: 'bold' }}>
            Ver en Chess.com
          </a>
        </div>
      )}

      {/* --- SECCIÓN TOP GLOBAL --- */}
      <h2 style={{ textAlign: 'center', borderTop: '2px solid #eee', paddingTop: '20px' }}>Top Global (Top 50)</h2>
      
      {!topPlayers ? (
        <p style={{ textAlign: 'center' }}>Cargando ranking mundial...</p>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            
            {categoriaSeleccionada === 'blitz' && (
              <ListaRanking titulo="Blitz" jugadores={topPlayers.blitz} />
            )}

            {categoriaSeleccionada === 'rapidas' && (
              <ListaRanking titulo="Rápidas" jugadores={topPlayers.rapidas} />
            )}

            {categoriaSeleccionada === 'bala' && (
              <ListaRanking titulo="Bala" jugadores={topPlayers.bala} />
            )}
            
        </div>
      )}
    </div>
  );
};

// Componente auxiliar para la lista
const ListaRanking = ({ titulo, jugadores }) => (
  <div style={{ width: '100%', maxWidth: '500px', border: '1px solid #eee', borderRadius: '8px', padding: '20px', boxShadow: '0 4px 8px rgba(0,0,0,0.05)' }}>
    <h3 style={{ textAlign: 'center', color: '#333', marginTop: 0, borderBottom: '2px solid #7fa650', paddingBottom: '10px' }}>{titulo}</h3>
    <ul style={{ listStyle: 'none', padding: 0, maxHeight: '500px', overflowY: 'auto' }}>
      {jugadores && jugadores.length > 0 ? (
        jugadores.map((jugador) => (
          <li key={jugador.player_id} style={{ borderBottom: '1px solid #f0f0f0', padding: '12px 0', fontSize: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ backgroundColor: '#eee', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', color: '#555' }}>
                {jugador.rank}
              </span>
              {jugador.username}
            </span>
            <span style={{ color: '#7fa650', fontWeight: 'bold', fontSize: '16px' }}>{jugador.score}</span>
          </li>
        ))
      ) : (
        <li style={{ textAlign: 'center', padding: '10px' }}>No hay datos disponibles.</li>
      )}
    </ul>
  </div>
);

export default PerfilJugador;