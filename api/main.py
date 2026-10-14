# main.py
import concurrent.futures
import json
import os
import tempfile

import analisis as chess_engine
import analisis_hib as chess_engine_hib
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from modelos.esquemas import FiltroPartidas

app = FastAPI()
HEADERS = {"User-Agent": "JorgesPiApp/1.0 (jorge.santamariadc9b@gmail.com)"}
origins = ["http://localhost:5173", "http://127.0.0.1:5173", "*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def json_serial_default(obj):
    if hasattr(obj, "item"):
        return obj.item()
    if isinstance(obj, (int, float)):
        return obj
    return str(obj)


def fetch_and_cache(url, filename):
    temp_dir = tempfile.gettempdir()
    safe_filename = os.path.basename(filename)
    file_path = os.path.join(temp_dir, safe_filename)
    if os.path.exists(file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            try:
                os.remove(file_path)
            except OSError:
                pass
    try:
        response = requests.get(url, headers=HEADERS, timeout=12)
        if response.status_code == 200:
            data = response.json()
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=4, default=json_serial_default)
            return data
    except requests.RequestException as e:
        print(f"Error fetching {url}: {e}")
        return None
    return None


@app.get("/api/", tags=["Home"])
def home():
    return {"Hello": "Chess API is running split in 2 files"}


@app.get("/api/chessyo/{user}", tags=["consultas"])
def user_profile(user: str):
    data = fetch_and_cache(
        f"https://api.chess.com/pub/player/{user}", f"{user}_profile.json"
    )
    if data:
        return data
    raise HTTPException(status_code=404, detail="User not found")


@app.get("/api/chessstats/{user}", tags=["consultas"])
def stats(user: str):
    data = fetch_and_cache(
        f"https://api.chess.com/pub/player/{user}/stats", f"{user}_stats.json"
    )
    if data:
        return data
    raise HTTPException(status_code=404, detail="Stats not found")


@app.get("/api/chessarchives/{user}", tags=["consultas"])
def archives(user: str):
    data = fetch_and_cache(
        f"https://api.chess.com/pub/player/{user}/games/archives",
        f"{user}_archives.json",
    )
    if data:
        return data
    raise HTTPException(status_code=404, detail="Archives not found")


@app.get("/api/chessgames/{user}/{year}/{month}", tags=["consultas"])
def games(user: str, year: str, month: str):
    data = fetch_and_cache(
        f"https://api.chess.com/pub/player/{user}/games/{year}/{month}",
        f"{user}_{year}_{month}_games.json",
    )
    if not data:
        return {"games": []}
    return data


@app.get("/api/chesswrapped/{user}/{year}", tags=["analytics"])
def generate_year_report(user: str, year: str):
    temp_dir = tempfile.gettempdir()
    report_filename = f"{user}_{year}_wrapped.json"
    file_path = os.path.join(temp_dir, report_filename)
    if os.path.exists(file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            try:
                os.remove(file_path)
            except OSError:
                pass
    total_general = {}
    rachas_temporales = {}
    meses = [f"{i:02d}" for i in range(1, 13)]
    monthly_data = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as executor:
        futures = {
            executor.submit(games, user, year, mes): mes
            for mes in meses
        }
        for future in concurrent.futures.as_completed(futures):
            mes = futures[future]
            try:
                monthly_data[mes] = future.result()
            except Exception as e:
                print(f"Error descargando mes {mes} de {year}: {e}")
                monthly_data[mes] = {"games": []}

    for mes in sorted(monthly_data.keys()):
        data = monthly_data[mes]
        if "games" in data and data["games"]:
            for modo, racha_val in rachas_temporales.items():
                if modo in total_general:
                    total_general[modo]["racha_cache"] = racha_val
            chess_engine.process_month_data(
                data["games"], total_general, user, f"{year}-{mes}"
            )
            for modo in total_general:
                rachas_temporales[modo] = total_general[modo]["racha_cache"]

    total_general = chess_engine.clean_stats_for_json(total_general)
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(total_general, f, ensure_ascii=False, indent=4, default=json_serial_default)
    return total_general


@app.get("/api/chesswrappedpandas/{user}/{year}", tags=["analytics"])
def generate_year_report_pandas(user: str, year: str):
    user = user.lower()
    temp_dir = tempfile.gettempdir()
    report_filename = f"{user}_{year}_wrapped_pandas.json"
    file_path = os.path.join(temp_dir, report_filename)

    # Si ya existe el reporte, lo devolvemos
    if os.path.exists(file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            try:
                os.remove(file_path)
            except OSError:
                pass

    meses = [f"{i:02d}" for i in range(1, 13)]
    heatmap_total = [[0 for _ in range(8)] for _ in range(8)]
    filas_pandas = []
    piezas_total = {"P": 0, "N": 0, "B": 0, "R": 0, "Q": 0, "K": 0}

    # Descarga concurrente paralela de los 12 meses
    monthly_data = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as executor:
        futures = {
            executor.submit(games, user, year, mes): mes
            for mes in meses
        }
        for future in concurrent.futures.as_completed(futures):
            mes = futures[future]
            try:
                monthly_data[mes] = future.result()
            except Exception as e:
                print(f"Error descargando mes {mes} de {year}: {e}")
                monthly_data[mes] = {"games": []}

    # Procesar en orden cronológico (01 a 12) para que las rachas se calculen correctamente
    for mes in sorted(monthly_data.keys()):
        data = monthly_data[mes]
        if "games" in data and data["games"]:
            datos_mes, heatmap_mes, conteo_mes = chess_engine_hib.limpieza_fila(
                data["games"], user=user
            )
            filas_pandas.extend(datos_mes)
            for f in range(8):
                for c in range(8):
                    heatmap_total[f][c] += heatmap_mes[f][c]
            for pieza, cantidad in conteo_mes.items():
                piezas_total[pieza] += cantidad

    # Generar análisis con Pandas
    datafinal = chess_engine_hib.analisis_pandas(filas_pandas)

    # Validar que tengamos datos antes de continuar
    if datafinal is None or not isinstance(datafinal, dict):
        print(f"DEBUG: No hay datos para {user} en {year}")
        raise HTTPException(
            status_code=404,
            detail=f"No se encontraron partidas para {user} en el año {year}.",
        )

    # Normalizar Heatmap
    flat_heatmap = [val for fila in heatmap_total for val in fila]
    max_valor = max(flat_heatmap) if flat_heatmap else 0

    heatmap_normalizado = []
    if max_valor > 0:
        for fila in heatmap_total:
            nueva_fila = [valor / max_valor for valor in fila]
            heatmap_normalizado.append(nueva_fila)
    else:
        heatmap_normalizado = heatmap_total

    # Agregar datos extra al reporte final
    datafinal["heatmap"] = heatmap_normalizado
    datafinal["piezas_movidas"] = piezas_total

    # Guardar en caché
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(datafinal, f, ensure_ascii=False, indent=4, default=json_serial_default)

    return datafinal


@app.get("/api/top-players", tags=["consultas"])
def top_players():
    filename = "top.json"
    data = fetch_and_cache("https://api.chess.com/pub/leaderboards", filename)
    if not data or not isinstance(data, dict):
        raise HTTPException(
            status_code=502,
            detail="No se pudo obtener la tabla de líderes de Chess.com."
        )
    filtered_data = {
        "rapid": data.get("live_rapid", []),
        "blitz": data.get("live_blitz", []),
        "bullet": data.get("live_bullet", []),
        "tactics": data.get("tactics", []),
    }
    return filtered_data


@app.post("/api/analizar")
def analizar_partidas(filtros: FiltroPartidas):

    temp_dir = tempfile.gettempdir()
    report_filename = f"{filtros.username}_{filtros.start_date}_{filtros.end_date}_wrapped_filtro.json"
    file_path = os.path.join(temp_dir, report_filename)
    if os.path.exists(file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            try:
                os.remove(file_path)
            except OSError:
                pass

    heatmap_total = [[0 for _ in range(8)] for _ in range(8)]
    filas_pandas = []
    piezas_total = {"P": 0, "N": 0, "B": 0, "R": 0, "Q": 0, "K": 0}
    fechas = []

    for i in range(filtros.start_date.year, filtros.end_date.year + 1):
        if filtros.start_date.year == filtros.end_date.year:
            for j in range(filtros.start_date.month, filtros.end_date.month + 1):
                fechas.append((i, j))
        elif i == filtros.end_date.year:
            for j in range(1, filtros.end_date.month + 1):
                fechas.append((i, j))
        elif i == filtros.start_date.year:
            for j in range(filtros.start_date.month, 13):
                fechas.append((i, j))
        else:
            for j in range(1, 13):
                fechas.append((i, j))

    # Descarga paralela concurrente de todos los meses en el rango
    fechas_data = {}
    workers = min(12, max(1, len(fechas)))
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {
            executor.submit(games, filtros.username, str(year), f"{mes:02d}"): (year, mes)
            for year, mes in fechas
        }
        for future in concurrent.futures.as_completed(futures):
            clave = futures[future]
            try:
                fechas_data[clave] = future.result()
            except Exception as e:
                print(f"Error descargando {clave}: {e}")
                fechas_data[clave] = {"games": []}

    # Procesamiento ordenado cronológicamente
    for year, mes in fechas:
        data = fechas_data.get((year, mes), {"games": []})
        if "games" in data and data["games"]:
            datos_mes, heatmap_mes, conteo_mes = chess_engine_hib.limpieza_fila(
                data["games"], filtros, user=filtros.username
            )
            filas_pandas.extend(datos_mes)
            for f in range(8):
                for c in range(8):
                    heatmap_total[f][c] += heatmap_mes[f][c]
            for pieza, cantidad in conteo_mes.items():
                piezas_total[pieza] += cantidad

    datafinal = chess_engine_hib.analisis_pandas(filas_pandas, filtros)

    if datafinal is None or not isinstance(datafinal, dict):
        raise HTTPException(
            status_code=404,
            detail="No se encontraron partidas para los criterios seleccionados.",
        )

    # Normalizar Heatmap
    flat_heatmap = [val for fila in heatmap_total for val in fila]
    max_valor = max(flat_heatmap) if flat_heatmap else 0

    heatmap_normalizado = []
    if max_valor > 0:
        for fila in heatmap_total:
            nueva_fila = [valor / max_valor for valor in fila]
            heatmap_normalizado.append(nueva_fila)
    else:
        heatmap_normalizado = heatmap_total

    datafinal["heatmap"] = heatmap_normalizado
    datafinal["piezas_movidas"] = piezas_total

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(datafinal, f, ensure_ascii=False, indent=4, default=json_serial_default)

    return datafinal
