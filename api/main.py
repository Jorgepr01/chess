# main.py
import json
import os
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import analisis as chess_engine
import analisis_hib as chess_engine_hib
from modelos.esquemas import FiltroPartidas
import time





app = FastAPI()
HEADERS = {'User-Agent': 'JorgesPiApp/1.0 (jorge.santamariadc9b@gmail.com)'}
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
def fetch_and_cache(url, filename):
    if os.path.exists(filename):
        with open(filename, 'r', encoding='utf-8') as f:
            return json.load(f)
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200:
        data = response.json()
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        return data
    return None



@app.get("/", tags=["Home"])
def home():
    return {"Hello": "Chess API is running split in 2 files"}

@app.get("/chessyo/{user}", tags=["consultas"])
def user_profile(user: str):
    data = fetch_and_cache(
        f'https://api.chess.com/pub/player/{user}', 
        f"{user}_profile.json"
    )
    if data: return data
    raise HTTPException(status_code=404, detail="User not found")

@app.get("/chessstats/{user}", tags=["consultas"])
def stats(user: str):
    data = fetch_and_cache(
        f'https://api.chess.com/pub/player/{user}/stats', 
        f"{user}_stats.json"
    )
    if data: return data
    raise HTTPException(status_code=404, detail="Stats not found")

@app.get("/chessarchives/{user}", tags=["consultas"])
def archives(user: str):
    data = fetch_and_cache(
        f'https://api.chess.com/pub/player/{user}/games/archives', 
        f"{user}_archives.json"
    )
    if data: return data
    raise HTTPException(status_code=404, detail="Archives not found")

@app.get("/chessgames/{user}/{year}/{month}", tags=["consultas"])
def games(user: str, year: str, month: str):
    data = fetch_and_cache(
        f'https://api.chess.com/pub/player/{user}/games/{year}/{month}',
        f"{user}_{year}_{month}_games.json"
    )
    if not data:
         return {"games": []}
    return data

@app.get("/chesswrapped/{user}/{year}", tags=["analytics"])
def generate_year_report(user: str, year: str):
    report_filename = f"{user}_{year}_wrapped.json"
    if os.path.exists(report_filename):
        with open(report_filename, 'r', encoding='utf-8') as f:
            return json.load(f)
    total_general = {}
    rachas_temporales = {} 
    meses = [f"{i:02d}" for i in range(1, 13)]
    for mes in meses:
        data = games(user, year, mes)
        if "games" in data and data["games"]:
            for modo, racha_val in rachas_temporales.items():
                if modo in total_general:
                    total_general[modo]["racha_cache"] = racha_val
            chess_engine.process_month_data(data["games"], total_general, user, f"{year}-{mes}")
            for modo in total_general:
                rachas_temporales[modo] = total_general[modo]["racha_cache"]

    total_general = chess_engine.clean_stats_for_json(total_general)
    with open(report_filename, 'w', encoding='utf-8') as f:
        json.dump(total_general, f, ensure_ascii=False, indent=4)
    return total_general


@app.get("/chesswrappedpandas/{user}/{year}", tags=["analytics"])
def generate_year_report_pandas(user: str, year: str):
    user=user.lower()
    report_filename = f"{user}_{year}_wrapped_pandas.json"
    if os.path.exists(report_filename):
        with open(report_filename, 'r', encoding='utf-8') as f:
            return json.load(f)
    meses = [f"{i:02d}" for i in range(1, 13)]
    heatmap_total=[[0 for _ in range(8)] for _ in range(8)]
    filas_pandas=[]
    piezas_total = {'P': 0, 'N': 0, 'B': 0, 'R': 0, 'Q': 0, 'K': 0}
    for mes in meses:
        print(f"Procesando mes {mes}_{year}")
        print("Dato")
        data = games(user, year, mes)
        if "games" in data and data["games"]:
            datos_mes,heatmap_mes,conteo_mes=chess_engine_hib.limpieza_fila(data["games"],user=user)
            filas_pandas.extend(datos_mes)
            for f in range(8):
                for c in range(8):
                    heatmap_total[f][c] += heatmap_mes[f][c]
            for pieza, cantidad in conteo_mes.items():
                piezas_total[pieza] += cantidad
    datafinal=chess_engine_hib.analisis_pandas(filas_pandas)
    # AGREGAMOS EL HEATMAP AL JSON FINAL
    #normalizamos
    max_valor = max(max(fila) for fila in heatmap_total)

    heatmap_normalizado = []
    for fila in heatmap_total:
        nueva_fila = [valor / max_valor for valor in fila] # Da 0.0 a 1.0
        heatmap_normalizado.append(nueva_fila)

    datafinal['heatmap'] = heatmap_normalizado
    datafinal['piezas_movidas'] = piezas_total
    with open(report_filename, 'w', encoding='utf-8') as f:
        json.dump(datafinal, f, ensure_ascii=False, indent=4)
    return datafinal



@app.get("/top-players", tags=["consultas"])
def top_players():
    filename = "top.json"
    data = fetch_and_cache("https://api.chess.com/pub/leaderboards", filename)  
    filtered_data = {
        "rapid": data.get("live_rapid", []), 
        "blitz":   data.get("live_blitz", []),
        "bullet":    data.get("live_bullet", []),
        "tactics":    data.get("tactics", [])
    }
    return filtered_data



















@app.get("/chessw_amalisis_filtro/{user}/{year}", tags=["analytics"])
def generate_year_report_filtros(user: str, year: str):
    user=user.lower()
    report_filename = f"{user}_{year}_wrapped_pandas.json"
    if os.path.exists(report_filename):
        with open(report_filename, 'r', encoding='utf-8') as f:
            return json.load(f)
    meses = [f"{i:02d}" for i in range(1, 13)]
    heatmap_total=[[0 for _ in range(8)] for _ in range(8)]
    filas_pandas=[]
    piezas_total = {'P': 0, 'N': 0, 'B': 0, 'R': 0, 'Q': 0, 'K': 0}
    for mes in meses:
        print(f"Procesando mes {mes}_{year}")
        print("Dato")
        data = games(user, year, mes)
        if "games" in data and data["games"]:
            datos_mes,heatmap_mes,conteo_mes=chess_engine_hib.limpieza_fila(data["games"],user=user)
            filas_pandas.extend(datos_mes)
            for f in range(8):
                for c in range(8):
                    heatmap_total[f][c] += heatmap_mes[f][c]
            for pieza, cantidad in conteo_mes.items():
                piezas_total[pieza] += cantidad
    datafinal=chess_engine_hib.analisis_pandas(filas_pandas)
    # AGREGAMOS EL HEATMAP AL JSON FINAL
    #normalizamos
    max_valor = max(max(fila) for fila in heatmap_total)

    heatmap_normalizado = []
    for fila in heatmap_total:
        nueva_fila = [valor / max_valor for valor in fila] # Da 0.0 a 1.0
        heatmap_normalizado.append(nueva_fila)

    datafinal['heatmap'] = heatmap_normalizado
    datafinal['piezas_movidas'] = piezas_total
    with open(report_filename, 'w', encoding='utf-8') as f:
        json.dump(datafinal, f, ensure_ascii=False, indent=4)
    return datafinal




@app.post("/api/analizar")
async def analizar_partidas(filtros: FiltroPartidas):
    report_filename = f"{filtros.username}_{filtros.start_date}_wrapped_filtro.json"
    if os.path.exists(report_filename):
        with open(report_filename, 'r', encoding='utf-8') as f:
            return json.load(f)
    heatmap_total=[[0 for _ in range(8)] for _ in range(8)]
    filas_pandas=[]
    piezas_total = {'P': 0, 'N': 0, 'B': 0, 'R': 0, 'Q': 0, 'K': 0}
    fechas=[]
    for i in range(filtros.start_date.year, filtros.end_date.year+1):
        if filtros.start_date.year == filtros.end_date.year:
            for j in range(filtros.start_date.month, filtros.end_date.month+1):
                fechas.append((i,j))
        elif i == filtros.end_date.year:
            for j in range(1, filtros.end_date.month+1):
                fechas.append((i,j))
        elif i == filtros.start_date.year:
            for j in range(filtros.start_date.month, 13):
                fechas.append((i,j))
        else:
            for j in range(1, 13):
                fechas.append((i,j))
        print(fechas)
    
    for year,mes in fechas:
        mes_formateado = f"{mes:02d}"
        print(f"Procesando mes {mes_formateado}_{year}")
        print("Dato")
        data = games(filtros.username, year, mes_formateado)
        if "games" in data and data["games"]:
            datos_mes,heatmap_mes,conteo_mes=chess_engine_hib.limpieza_fila(data["games"],filtros,user=filtros.username)
            filas_pandas.extend(datos_mes)
            for f in range(8):
                for c in range(8):
                    heatmap_total[f][c] += heatmap_mes[f][c]
            for pieza, cantidad in conteo_mes.items():
                piezas_total[pieza] += cantidad
        time.sleep(0.5)
    datafinal=chess_engine_hib.analisis_pandas(filas_pandas,filtros)

    if datafinal==None:
        return "No hay datos"
    # AGREGAMOS EL HEATMAP AL JSON FINAL
    #normalizamos
    max_valor = max(max(fila) for fila in heatmap_total)

    heatmap_normalizado = []
    for fila in heatmap_total:
        nueva_fila = [valor / max_valor for valor in fila] # Da 0.0 a 1.0
        heatmap_normalizado.append(nueva_fila)

    datafinal['heatmap'] = heatmap_normalizado
    datafinal['piezas_movidas'] = piezas_total
    with open(report_filename, 'w', encoding='utf-8') as f:
        json.dump(datafinal, f, ensure_ascii=False, indent=4)
    return datafinal


# @app.post("/api/analizar")
# async def analizar_partidas(filtros: FiltroPartidas):
#     # Aquí ya tienes los datos limpios y validados
#     print(f"Buscando partidas desde {filtros.start_date} hasta {filtros.end_date}")
#     print(f"Días seleccionados: {filtros.days_played}")

#     # --- EJEMPLO DE USO CON SQLALCHEMY / ORM ---
#     # query = session.query(Partida).filter(
#     #     Partida.fecha >= filtros.start_date,
#     #     Partida.fecha <= filtros.end_date,
#     #     Partida.dia_semana.in_(filtros.days_played)
#     # )
    
#     return {
#         "status": "ok", 
#         "mensaje": f"Análisis iniciado para {len(filtros.days_played)} días"
#     }