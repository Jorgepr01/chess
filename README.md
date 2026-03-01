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

### Requisitos Previos
Asegúrate de tener instalados en tu sistema:
*   [Node.js](https://nodejs.org/)
*   [Python](https://www.python.org/)

### Instalación

1.  Clona el repositorio:
    ```bash
    git clone https://github.com/Jorgepr01/chess.git
    cd chess
    ```

2.  Crea y activa un entorno virtual de Python:
    ```bash
    python -m venv venv
    source venv/bin/activate  # En Windows usa: venv\Scripts\activate
    ```

3.  Instala las dependencias del backend:
    ```bash
    pip install -r requirements.txt
    ```

4.  Instala las dependencias del frontend:
    ```bash
    npm install
    ```

### Ejecución Local

Para ejecutar el proyecto localmente, necesitarás iniciar tanto el backend como el frontend en terminales separadas.

**1. Ejecutar el Backend (FastAPI):**
```bash
# Asegúrate de tener el entorno virtual activado
cd api
uvicorn main:app --reload
```
El backend estará corriendo en `http://localhost:8000`.

**2. Ejecutar el Frontend (React/Vite):**
Abre una nueva terminal en la raíz del proyecto y ejecuta:
```bash
npm run dev
```
El frontend estará corriendo en el puerto indicado por Vite (usualmente `http://localhost:5173`).
