from datetime import date

import analisis_hib as chess_engine_hib
import pandas as pd
import requests
from modelos.esquemas import FiltroPartidas

filtros = FiltroPartidas(
    start_date=date(2025, 1, 1),
    end_date=date(2025, 12, 31),
    win_types=[
        "checkmated",
        "timeout",
        "resigned",
        "agreed",
        "timevsinsufficient",
        "abandoned",
        "repetition",
        "stalemate",
        "insufficient",
    ],
    days_played=[
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ],
    time_control=["blitz", "rapid", "bullet", "daily"],
    aperturas=["A", "B", "C", "D", "E", "Z"],
    username="",
)


HEADERS = {"User-Agent": "JorgesPiApp/1.0 (jorge.santamariadc9b@gmail.com)"}


def crear_db():
    # pedir datos de la api
    user = input("Enter your chess.com username: ")
    date_game = requests.get(
        f"https://api.chess.com/pub/player/{user}/games/archives", headers=HEADERS
    )
    filas_pandas = []
    print(date_game.json())
    data = date_game.json()
    for fecha in data["archives"]:
        month = fecha.split("/")[-1]
        print(month)
        year = fecha.split("/")[-2]
        filtros.start_date = date(int(year), int(month), 1)
        filtros.end_date = date(int(year), int(month), 20)
        filtros.username = user
        date_game = requests.get(
            f"https://api.chess.com/pub/player/{user}/games/{year}/{month}",
            headers=HEADERS,
        ).json()
        if "games" in date_game and date_game["games"]:
            datos_mes, heatmap_mes, conteo_mes = chess_engine_hib.limpieza_fila(
                date_game["games"], filtros, user=filtros.username
            )
            filas_pandas.extend(datos_mes)
            print("datos_mes")
    df_anual = pd.DataFrame(filas_pandas)
    df_anual.to_csv(f"{user}_games.csv", index=False)
    return df_anual


crear_db()
