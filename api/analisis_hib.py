import io
import json
import os
from datetime import date

import chess
import chess.pgn
import numpy as np
import pandas as pd
from aperturas import datos_aperturas
from modelos.esquemas import FiltroPartidas

filtros_default = FiltroPartidas(
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
        "threecheck",
        "bughousepartnerlose",
        "kingofthehill",
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


def procesar_pgn(
    partida,
    heatmap_mes,
    diccionario_aperturas,
    es_blancas,
    conteo_piezas,
    filtro_apertura,
):
    # 1. Definimos datos_macro desde el principio para retornos seguros
    datos_macro = {
        "tiempos_usuario": [],
        "movimientos_usuario": 0,
        "movimientos_oponente": 0,
        "max_tiempo_pensado": 0.0,
        "texto_jugada_mas_larga": "",
        "turno_jugada_mas_larga": 0,
        "jaques": 0,
        "capturas": 0,
        "coronaciones": 0,
        "enroque": "Ninguno",
        "jugada_enroque": None,
        "promedio_tiempo": 0.0,
        "desviacion_tiempo": 0.0,
    }

    # Retornos tempranos unificados (devuelven 5 elementos siempre)
    if not partida:
        return "Desconocida", "Desconocida", heatmap_mes, conteo_piezas, datos_macro
    pgn = io.StringIO(partida)
    game = chess.pgn.read_game(pgn)
    if not game:
        return "Desconocida", "Desconocida", heatmap_mes, conteo_piezas, datos_macro

    # Validamos ECO de forma segura por si viene vacío
    eco_partida = game.headers.get("ECO", "Z")
    if eco_partida[0] not in filtro_apertura:
        print("filtro apertura")
        return None, None, heatmap_mes, conteo_piezas, datos_macro
    tipo_apertura = "Desconocida"
    if eco_partida[0] == "A":
        tipo_apertura = "Aperturas de flanco"
    elif eco_partida[0] == "B":
        tipo_apertura = "Aperturas semiabiertas"
    elif eco_partida[0] == "C":
        tipo_apertura = "Aperturas abiertas"
    elif eco_partida[0] == "D":
        tipo_apertura = "Aperturas cerradas y semicerradas"
    elif eco_partida[0] == "E":
        tipo_apertura = "Defensas Indias"
    elif eco_partida[0] == "Z":
        tipo_apertura = "Desconocida"

    nombre_apertura = diccionario_aperturas.get(eco_partida, "Desconocida")

    time_control = game.headers.get("TimeControl", "0")
    incremento = 0
    if "+" in time_control:
        try:
            incremento = float(time_control.split("+")[1])
        except ValueError:
            pass

    board = game.board()
    tiempo_anterior = None

    for node in game.mainline():
        move = node.move
        if board.turn == es_blancas:
            # TIEMPO
            tiempo_restante = node.clock()
            if tiempo_restante is not None:
                if tiempo_anterior is not None:
                    tiempo_gastado = (tiempo_anterior + incremento) - tiempo_restante
                    tiempo_gastado = max(
                        0.0, round(tiempo_gastado, 1)
                    )  # Evitamos negativos por lag
                    datos_macro["tiempos_usuario"].append(tiempo_gastado)

                    if tiempo_gastado > datos_macro["max_tiempo_pensado"]:
                        datos_macro["max_tiempo_pensado"] = tiempo_gastado
                        datos_macro["texto_jugada_mas_larga"] = board.san(move)
                        datos_macro["turno_jugada_mas_larga"] = board.fullmove_number
                tiempo_anterior = tiempo_restante

            # PIEZAS
            pieza = board.piece_at(move.from_square)
            if pieza:
                symbol = pieza.symbol().upper()
                conteo_piezas[symbol] = conteo_piezas.get(symbol, 0) + 1

            # HEATMAP
            casilla_destino = move.to_square
            fila = 7 - chess.square_rank(casilla_destino)
            columna = chess.square_file(casilla_destino)
            heatmap_mes[fila][columna] += 1

            # TÁCTICAS
            if board.gives_check(move):
                datos_macro["jaques"] += 1
            if board.is_capture(move):
                datos_macro["capturas"] += 1
            if move.promotion is not None:
                datos_macro["coronaciones"] += 1

            # ENROQUE Y MOVIMIENTOS
            datos_macro["movimientos_usuario"] += 1
            if board.is_castling(move):
                datos_macro["jugada_enroque"] = board.fullmove_number
                if board.is_kingside_castling(move):
                    datos_macro["enroque"] = "Corto (O-O)"
                elif board.is_queenside_castling(move):
                    datos_macro["enroque"] = "Largo (O-O-O)"

        else:
            # Corregido: accedemos al diccionario
            datos_macro["movimientos_oponente"] += 1

        board.push(move)

    # --- FUERA DEL BUCLE ---
    # Cálculos estadísticos seguros (evitando división por cero)
    tiempos = datos_macro["tiempos_usuario"]
    if len(tiempos) > 0:
        datos_macro["promedio_tiempo"] = round(sum(tiempos) / len(tiempos), 1)
        datos_macro["desviacion_tiempo"] = round(float(np.std(tiempos)), 1)

    # Retornamos todo agrupado limpiamente
    return nombre_apertura, tipo_apertura, heatmap_mes, conteo_piezas, datos_macro


def limpieza_fila(games, filtros: FiltroPartidas = filtros_default, user=""):
    # user=user.lower()
    if user != "":
        filtros.username = user
    stats_globales = {"racha_actual": 0, "mejor_racha": 0}
    filas_para_pandas = []
    heatmap_mes = [[0 for _ in range(8)] for _ in range(8)]
    conteo_piezas_mes = {"P": 0, "N": 0, "B": 0, "R": 0, "Q": 0, "K": 0}
    games.sort(key=lambda x: x["end_time"])
    # Cargar aperturas
    for game in games:
        ## FILTRO DE TIPO DE JUEGO
        if game["time_class"] not in filtros.time_control:
            print(game["time_class"])
            print("chao1")
            continue
        es_blancas = game["white"]["username"].lower() == filtros.username.lower()
        mi_color = "white" if es_blancas else "black"
        oponente_color = "black" if es_blancas else "white"
        elo_actual = game[mi_color]["rating"]
        mi_resultado = game[mi_color]["result"]
        oponente = game[oponente_color]["username"]
        elo_oponente = game[oponente_color]["rating"]
        if mi_resultado == "win":
            reason_result = game[oponente_color]["result"]
            ## FILTRO DE LA RAZON DE VICTORIA
            if reason_result not in filtros.win_types:
                print(reason_result)
                print("chao2")
                continue
            stats_globales["racha_actual"] += 1
            if stats_globales["racha_actual"] > stats_globales["mejor_racha"]:
                stats_globales["mejor_racha"] = stats_globales["racha_actual"]
        elif mi_resultado in [
            "agreed",
            "repetition",
            "stalemate",
            "insufficient",
            "timevsinsufficient",
            "50move",
        ]:
            reason_result = mi_resultado
            ## FILTRO DE LA RAZON DE VICTORIA
            if reason_result not in filtros.win_types:
                print(reason_result)
                print("chao3")
                continue
            mi_resultado = "draw"
        else:
            reason_result = mi_resultado
            ## FILTRO DE LA RAZON DE VICTORIA
            if reason_result not in filtros.win_types:
                print(reason_result)
                print("chao4")
                continue
            mi_resultado = "loss"
            stats_globales["racha_actual"] = 0

        try:
            time_control_str = game["time_control"].split("+")[0]
            tiempo_control_val = int(time_control_str)  # REEMPLAZO DE EVAL
        except (ValueError, IndexError):
            tiempo_control_val = 0
        # Analisis PGN

        partida = game.get("pgn")
        nombre_apertura, tipo_apertura, heatmap_mes, conteo_piezas_mes, datos_macro = (
            procesar_pgn(
                partida,
                heatmap_mes,
                datos_aperturas,
                es_blancas,
                conteo_piezas_mes,
                filtros.aperturas,
            )
        )
        if nombre_apertura is None:
            continue

        fila = {
            "fecha_ts": game["end_time"],  # Timestamp crudo
            "color": "Blanco" if es_blancas else "Negro",
            "resultado": mi_resultado,
            "reason_result": reason_result,
            "elo": elo_actual,
            "time_class": game["time_class"],
            "oponente": oponente,
            "elo_oponente": elo_oponente,
            "apertura": nombre_apertura,
            "tipo_apertura": tipo_apertura,
            "tiempo_control": tiempo_control_val,  ## sin contar el incremento
            "racha_en_este_juego": stats_globales["racha_actual"],
            # Nuevos campos de datos_macro
            "movimientos_usuario": datos_macro["movimientos_usuario"],
            "movimientos_oponente": datos_macro["movimientos_oponente"],
            "max_tiempo_pensado": datos_macro["max_tiempo_pensado"],
            "texto_jugada_mas_larga": datos_macro["texto_jugada_mas_larga"],
            "turno_jugada_mas_larga": datos_macro["turno_jugada_mas_larga"],
            "jaques": datos_macro["jaques"],
            "capturas": datos_macro["capturas"],
            "coronaciones": datos_macro["coronaciones"],
            "enroque": datos_macro["enroque"],
            "jugada_enroque": datos_macro["jugada_enroque"],
            "promedio_tiempo": datos_macro["promedio_tiempo"],
            "desviacion_tiempo": datos_macro["desviacion_tiempo"],
        }

        filas_para_pandas.append(fila)
    return filas_para_pandas, heatmap_mes, conteo_piezas_mes


def filters_is_default(filtros: FiltroPartidas, df=None):
    """
    Detecta si el filtro es el de por defecto (2025 completo)
    pero estamos analizando datos de otro año.
    """
    is_date_2025 = filtros.start_date == date(2025, 1, 1) and filtros.end_date == date(
        2025, 12, 31
    )

    # Si tenemos datos, chequeamos si el año de los datos es distinto de 2025
    if df is not None and not df.empty and is_date_2025:
        data_year = df["fecha"].dt.year.iloc[0]
        if data_year != 2025:
            return True

    return False


def analisis_pandas(games, filtros: FiltroPartidas = filtros_default):

    final = {"total": {}}
    if games == []:
        return None
    df_anual = pd.DataFrame(games)
    df_anual["fecha"] = pd.to_datetime(
        df_anual["fecha_ts"], unit="s", utc=True
    ).dt.tz_convert("America/Guayaquil")
    df_anual["fecha_date"] = df_anual["fecha"].dt.date
    df_anual["hora"] = df_anual["fecha"].dt.hour
    df_anual["dia_semana"] = df_anual["fecha"].dt.day_name()
    df_anual["mes"] = df_anual["fecha"].dt.month_name()

    #   ##FILTROS
    # Filtros fecha - Ajustamos dinámicamente si es el filtro por defecto
    if filters_is_default(filtros, df_anual):
        # Si es el filtro por defecto (2025) pero tenemos datos de otro año (ej. 2024),
        # no aplicamos el filtro de fecha de 2025 para no borrar los datos.
        pass
    else:
        mask_fecha = (df_anual["fecha_date"] >= filtros.start_date) & (
            df_anual["fecha_date"] <= filtros.end_date
        )
        df_anual = df_anual[mask_fecha]

    if filtros.days_played:
        df_anual = df_anual[df_anual["dia_semana"].isin(filtros.days_played)]

    if df_anual.empty:
        return None

    # print(df_anual)
    modos = df_anual["time_class"].unique()
    # print(df_anual)
    for modo in modos:
        print(modo)
        df_modo = df_anual[df_anual["time_class"] == modo]
        final[modo] = {}
        final[modo]["mode_type"] = modo
        final[modo]["total_partidas"] = len(df_modo)
        final[modo]["victorias"] = len(df_modo[df_modo["resultado"] == "win"])
        elo_maximo = int(df_modo["elo"].max())
        final[modo]["elo_maximo"] = elo_maximo
        final[modo]["elo_minimo"] = int(df_modo["elo"].min())
        final[modo]["elo_promedio"] = int(df_modo["elo"].mean())
        final[modo]["reason_result_top"] = dict(
            df_modo["reason_result"].value_counts().head(1).to_dict()
        )
        final[modo]["oponente_top"] = {
            "name": df_modo["oponente"].value_counts().idxmax(),
            "count": int(df_modo["oponente"].value_counts().max()),
        }
        final[modo]["apertura_top"] = {
            "name": df_modo["apertura"].value_counts().idxmax(),
            "count": int(df_modo["apertura"].value_counts().max()),
        }
        final[modo]["hora_top"] = {
            "name": int(df_modo["hora"].value_counts().idxmax()),
            "count": int(df_modo["hora"].value_counts().max()),
        }
        final[modo]["dia_semana_top"] = {
            "name": df_modo["dia_semana"].value_counts().idxmax(),
            "count": int(df_modo["dia_semana"].value_counts().max()),
        }
        final[modo]["mes_top"] = {
            "name": df_modo["mes"].value_counts().idxmax(),
            "count": int(df_modo["mes"].value_counts().max()),
        }
        final[modo]["racha_maxima"] = int(df_modo["racha_en_este_juego"].max())
        final[modo]["mes_elo_maximo"] = df_modo[df_modo["elo"] == elo_maximo][
            "mes"
        ].iloc[0]
        final[modo]["tiempo_jugado"] = int(df_modo["tiempo_control"].sum() * 2)

        # --- NUEVO: HISTORIAL DE ELO (Para el gráfico) ---
        # Ordenamos por fecha para asegurar la línea de tiempo
        df_modo = df_modo.sort_values("fecha")
        # Resampleamos por semana para que el gráfico sea fluido pero el JSON ligero
        # Tomamos el último ELO registrado en esa semana
        elo_history = (
            df_modo.set_index("fecha")["elo"].resample("W").last().ffill().dropna()
        )

        # Convertimos las fechas a string (YYYY-MM-DD) para que sea serializable a JSON
        final[modo]["elo_history"] = {
            str(date.date()): int(val) for date, val in elo_history.items()
        }
        # ------------------------------------------------

    # analisis del general potente
    cantidad_partidas = len(df_anual)
    final["total"]["total_partidas"] = cantidad_partidas
    final["total"]["victorias"] = len(df_anual[df_anual["resultado"] == "win"])
    elo_maximo = int(df_anual["elo"].max())
    final["total"]["elo_maximo"] = elo_maximo
    final["total"]["elo_minimo"] = int(df_anual["elo"].min())
    final["total"]["reason_result_top"] = dict(
        df_anual["reason_result"].value_counts().head(1).to_dict()
    )
    final["total"]["oponente_top"] = {
        "name": df_anual["oponente"].value_counts().idxmax(),
        "count": int(df_anual["oponente"].value_counts().max()),
    }
    vc = df_anual[df_anual["resultado"] == "loss"]["oponente"].dropna().value_counts()

    if vc.empty:
        final["total"]["nemesis"] = {"name": None, "count": 0}
    else:
        final["total"]["nemesis"] = {"name": vc.idxmax(), "count": int(vc.max())}
    vc = df_anual[df_anual["resultado"] == "win"]["oponente"].dropna().value_counts()

    if vc.empty:
        final["total"]["pet"] = {"name": None, "count": 0}
    else:
        final["total"]["pet"] = {"name": vc.idxmax(), "count": int(vc.max())}
    final["total"]["apertura_top"] = {
        "name": df_anual["apertura"].value_counts().idxmax(),
        "count": int(df_anual["apertura"].value_counts().max()),
    }
    final["total"]["hora_top"] = {
        "name": int(df_anual["hora"].value_counts().idxmax()),
        "count": int(df_anual["hora"].value_counts().max()),
    }
    final["total"]["dia_semana_top"] = {
        "name": df_anual["dia_semana"].value_counts().idxmax(),
        "count": int(df_anual["dia_semana"].value_counts().max()),
    }
    final["total"]["mes_top"] = {
        "name": df_anual["mes"].value_counts().idxmax(),
        "count": int(df_anual["mes"].value_counts().max()),
    }
    final["total"]["racha_maxima"] = int(df_anual["racha_en_este_juego"].max())
    final["total"]["mes_elo_maximo"] = df_anual[df_anual["elo"] == elo_maximo][
        "mes"
    ].iloc[0]
    final["total"]["tiempo_jugado"] = int(df_anual["tiempo_control"].sum())
    final["total"]["amigos"] = dict(
        df_anual["oponente"].value_counts().head(10).to_dict()
    )
    conteos_reason = df_anual["reason_result"].value_counts()

    cantidad_timeouts = int(conteos_reason.get("timeout", 0))
    cantidad_mates = int(conteos_reason.get("checkmated", 0))
    cantidad_resigns = int(conteos_reason.get("resigned", 0))
    cantidad_tablas = int(len(df_anual[df_anual["resultado"] == "draw"]))
    personality = "Equilibrado"

    if cantidad_tablas > cantidad_partidas / 6:
        personality = "El inexpugnable"  # muchas tablas
    if cantidad_mates > cantidad_resigns and cantidad_mates > cantidad_timeouts:
        personality = "El Carnicero"  # Gana por mate
    if cantidad_timeouts > cantidad_mates and cantidad_timeouts > cantidad_resigns:
        personality = "Barry Allen"  # Gana por tiempo
    if cantidad_resigns > cantidad_mates:
        personality = "El Dominante"  # Se rinden ante él

    final["total"]["personality"] = personality

    def get_color_stats(color_str):
        df_color = df_anual[df_anual["color"] == color_str]
        total = len(df_color)
        if total == 0:
            return {"wins": 0, "total": 0, "winrate": 0}
        wins = len(df_color[df_color["resultado"] == "win"])
        return {"wins": wins, "total": total, "winrate": int((wins / total) * 100)}

    final["total"]["stats_blancas"] = get_color_stats("Blanco")
    final["total"]["stats_negras"] = get_color_stats("Negro")
    # df_anual.to_csv(f'datos_{filtros.username}.xlsx', index=False, sheet_name='Hoja1')

    return final


# partidas=limpieza_fila(data_mes_11['games'],user='jorgepr1')
# analisis_pandas(partidas)
