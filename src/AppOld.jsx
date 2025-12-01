import { useState } from 'react';
import './App.css'; // Importamos el CSS
import PerfilJugador from './components/jugadores';

// --- NUEVO: Importar la imagen de ajedrez ---
// Asumo que tienes una imagen llamada 'chess-background.jpg' en la carpeta 'public'
// Si la pones en 'src', tendrías que importarla así: import chessImage from './assets/chess-background.jpg';
// Por simplicidad, la pondré en 'public' y la referenciaré directamente.
// Si no tienes una, buscaré una URL online genérica de un tablero.
// Para este ejemplo, usaré una URL de Unsplash. Puedes cambiarla si tienes una local.


function App() {
  return (
      <main>
        <PerfilJugador />
        
      </main>
   
  );
}

export default App;