# main.py
import json
import os
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import analisis as chess_engine
import pandas as pd
import analisis_hib as chess_engine_hib
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
    """Función genérica para revisar cache o descargar de internet"""
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
    filas_pandas=[]
    for mes in meses:
        print(f"Procesando mes {mes}_{year}")
        data = games(user, year, mes)
        if "games" in data and data["games"]:
            filas_pandas.extend(chess_engine_hib.limpieza_fila(data["games"],user=user))
    datafinal=chess_engine_hib.analisis_pandas(filas_pandas)
    with open(report_filename, 'w', encoding='utf-8') as f:
        json.dump(datafinal, f, ensure_ascii=False, indent=4)
    return datafinal



@app.get("/top-players", tags=["consultas"])
def top_players():
    filename = "top.json"
    if os.path.exists(filename):
        with open(filename, 'r', encoding='utf-8') as f:
            return json.load(f)
            
    response = requests.get("https://api.chess.com/pub/leaderboards", headers=HEADERS)
    if response.status_code == 200:
        data = response.json()
        filtered_data = {
            "rapid": data.get("live_rapid", []), 
            "blitz":   data.get("live_blitz", []),
            "bullet":    data.get("live_bullet", []),
            "tactics":    data.get("tactics", [])
        }
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(filtered_data, f, ensure_ascii=False, indent=4)
        return filtered_data
    else:
        raise HTTPException(status_code=response.status_code, detail="Error fetching leaderboards")