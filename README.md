# Chess Wrapped

Chess Wrapped es una aplicación web interactiva que permite a los usuarios de Chess.com generar y visualizar un resumen estadístico de sus partidas, inspirado en el popular formato de "Spotify Wrapped".

## 🚀 Características Principales

*   **Resumen Anual:** Visualiza tu desempeño, porcentaje de victorias, derrotas y empates.
*   **Análisis de Aperturas:** Descubre cuáles son tus aperturas más utilizadas tanto con piezas blancas como negras.
*   **Personalidad de Juego:** Identifica tu estilo de juego basado en tus estadísticas (ej. agresivo, rápido).
*   **Némesis y Cliente VIP:** Descubre a qué jugador le has ganado más veces (tu cliente) y quién te ha derrotado en más ocasiones (tu némesis).
*   **Mapa de Calor (Heatmap):** Visualización interactiva de las casillas del tablero que más transitas durante tus partidas.
*   **Presentación Animada:** Resultados presentados en un formato de "historias" visuales e interactivas con música de fondo.

## 🛠️ Stack Tecnológico

### Frontend
*   **React** (con **Vite** como empaquetador)
*   **Tailwind CSS** para el diseño y los estilos
*   **Framer Motion** para animaciones fluidas
*   Componentes de interfaz de usuario de **shadcn/ui**
*   **Lucide React** para iconos

### Backend
*   **Python** con **FastAPI**
*   `python-chess` para la lectura y procesamiento de archivos PGN de las partidas de ajedrez.
*   `pandas` para el análisis de datos y cálculos estadísticos avanzados.
*   `requests` para consumir y comunicarse con la API pública de Chess.com.

## ⚙️ Estructura del Proyecto

*   `api/`: Contiene el código del backend (Python/FastAPI) encargado de conectarse a Chess.com, descargar el historial de partidas, limpiarlo y calcular las métricas.
*   `src/`: Contiene el código fuente de la aplicación frontend (React), incluyendo componentes, vistas y estilos.
*   `public/`: Directorio para archivos estáticos, imágenes, iconos y audios.

## 💡 Cómo Empezar

*Instrucciones pendientes para la instalación y ejecución local del entorno de desarrollo frontend y backend.*
