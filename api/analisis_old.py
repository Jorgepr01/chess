from collections import Counter 
import json
import os
nombre_games_11 = "jorgepr1_2025_11_games.json"
with open(nombre_games_11, 'r', encoding='utf-8') as f:
    data_mes_11 = json.load(f)["games"]
user="jorgepr1"


def get_new_stats_template():
    """Retorna un diccionario limpio con los valores por defecto."""
    return {
        "cantidad_games": 0,
        "elo_max": 0,
        "elo_min": 10000, # Tu valor inicial personalizado
        "w_with": 0,
        "w_black": 0,
        "reason_loss": Counter(),
        "reason_win": Counter(),
        "racha": 0,
        "racha_cache": 0,
        "nemesis": Counter(), 
        "pet": Counter(),
        "aperturas": Counter() 
    }

#limpiar la data
def data_first_level(games, user="jorgepr1"):
    rhythm = {}
    user = user.lower()

    for game in games:
        type_r = game.get("time_class", "")
        if type_r not in rhythm:
            rhythm[type_r] = get_new_stats_template()
        
        eco_url = game.get("eco", "")
        if eco_url:
            raw_name = eco_url.split("/")[-1] 
            opening_name = raw_name.replace("-", " ")
            
            opening_name = opening_name.split(".")[0] 

            if opening_name not in rhythm[type_r]["aperturas"]:
                rhythm[type_r]["aperturas"][opening_name] = 0
            rhythm[type_r]["aperturas"][opening_name] += 1

        white_ = game.get("white", {})
        black_ = game.get("black", {})
        rhythm[type_r]["cantidad_games"] += 1
        
        if white_["username"].lower() == user:
            # Eres Blancas
            user_rating = white_["rating"]
            opponent_name = black_["username"]
            result = white_["result"]
            opponent_result = black_["result"]

            if user_rating > rhythm[type_r]["elo_max"]: rhythm[type_r]["elo_max"] = user_rating
            if user_rating < rhythm[type_r]["elo_min"]: rhythm[type_r]["elo_min"] = user_rating

            if result == "win":
                rhythm[type_r]["w_with"] += 1
                if opponent_result not in rhythm[type_r]["reason_win"]: rhythm[type_r]["reason_win"][opponent_result] = 0
                rhythm[type_r]["reason_win"][opponent_result] += 1
                if opponent_name not in rhythm[type_r]["pet"]: rhythm[type_r]["pet"][opponent_name] = 0
                rhythm[type_r]["pet"][opponent_name] += 1
                rhythm[type_r]["racha_cache"] += 1
                if rhythm[type_r]["racha_cache"] > rhythm[type_r]["racha"]: rhythm[type_r]["racha"] = rhythm[type_r]["racha_cache"]
            else:
                if result in ["checkmated", "timeout", "resigned", "abandoned"]:
                    if result not in rhythm[type_r]["reason_loss"]: rhythm[type_r]["reason_loss"][result] = 0
                    rhythm[type_r]["reason_loss"][result] += 1
                    if opponent_name not in rhythm[type_r]["nemesis"]: rhythm[type_r]["nemesis"][opponent_name] = 0
                    rhythm[type_r]["nemesis"][opponent_name] += 1
                    rhythm[type_r]["racha_cache"] = 0
                elif result in ["stalemate", "repetition", "insufficient", "agreed"]:
                     rhythm[type_r]["racha_cache"] = 0

        else:
            # Eres Negras
            user_rating = black_["rating"]
            opponent_name = white_["username"]
            result = black_["result"]
            opponent_result = white_["result"]

            if user_rating > rhythm[type_r]["elo_max"]: rhythm[type_r]["elo_max"] = user_rating
            if user_rating < rhythm[type_r]["elo_min"]: rhythm[type_r]["elo_min"] = user_rating

            if result == "win":
                rhythm[type_r]["w_black"] += 1
                if opponent_result not in rhythm[type_r]["reason_win"]: rhythm[type_r]["reason_win"][opponent_result] = 0
                rhythm[type_r]["reason_win"][opponent_result] += 1
                if opponent_name not in rhythm[type_r]["pet"]: rhythm[type_r]["pet"][opponent_name] = 0
                rhythm[type_r]["pet"][opponent_name] += 1
                rhythm[type_r]["racha_cache"] += 1
                if rhythm[type_r]["racha_cache"] > rhythm[type_r]["racha"]: rhythm[type_r]["racha"] = rhythm[type_r]["racha_cache"]
            else:
                if result in ["checkmated", "timeout", "resigned", "abandoned"]:
                    if result not in rhythm[type_r]["reason_loss"]: rhythm[type_r]["reason_loss"][result] = 0
                    rhythm[type_r]["reason_loss"][result] += 1
                    if opponent_name not in rhythm[type_r]["nemesis"]: rhythm[type_r]["nemesis"][opponent_name] = 0
                    rhythm[type_r]["nemesis"][opponent_name] += 1
                    rhythm[type_r]["racha_cache"] = 0
                elif result in ["stalemate", "repetition", "insufficient", "agreed"]:
                     rhythm[type_r]["racha_cache"] = 0
    return rhythm

def data_mid_level(mes_data,user="jorgepr1",mes="2023-11"):
    data_mes_low=data_first_level(mes_data,user=user)
    for modo in data_mes_low:
        #modificar los la lista del mes
        data_mes_low[modo]['nemesis']=dict(data_mes_low[modo]['nemesis'].most_common(3))
        data_mes_low[modo]['pet']=dict(data_mes_low[modo]['pet'].most_common(3))
        data_mes_low[modo]['aperturas']=dict(data_mes_low[modo]['aperturas'].most_common(5))
        if modo not in total_general:
            total_general[modo]=get_new_stats_template()
        
        total_general[modo]['cantidad_games'] += data_mes_low[modo]['cantidad_games']
        if data_mes_low[modo]['elo_max'] > total_general[modo]['elo_max']:
            total_general[modo]['elo_max'] = data_mes_low[modo]['elo_max']
            total_general[modo]['mes_elo_max']=mes
        
        if data_mes_low[modo]['elo_min'] < total_general[modo]['elo_min']:
            total_general[modo]['elo_min'] = data_mes_low[modo]['elo_min']
            total_general[modo]['mes_elo_min']=mes
        total_general[modo]['w_with'] += data_mes_low[modo]['w_with']
        total_general[modo]['w_black'] += data_mes_low[modo]['w_black']

        total_general[modo]['racha'] = max(data_mes_low[modo]['racha'], total_general[modo]['racha'])
        total_general[modo]['reason_loss'].update(data_mes_low[modo]['reason_loss']) 
        total_general[modo]['reason_win'].update(data_mes_low[modo]['reason_win'])
        total_general[modo]['nemesis'].update(data_mes_low[modo]['nemesis'])
        total_general[modo]['pet'].update(data_mes_low[modo]['pet'])
        total_general[modo]['aperturas'].update(data_mes_low[modo]['aperturas'])

    if mes not in lotal_months:
        lotal_months[mes]=data_mes_low
    return data_mes_low



def data_high_level(user="jorgepr1",year="2025"):
    total_general={} 
    lotal_months={}
    archives={
    "archives": [
        "https://api.chess.com/pub/player/jorgepr1/games/2020/11",
        "https://api.chess.com/pub/player/jorgepr1/games/2020/12",
        "https://api.chess.com/pub/player/jorgepr1/games/2021/01",
        "https://api.chess.com/pub/player/jorgepr1/games/2021/02",
        "https://api.chess.com/pub/player/jorgepr1/games/2021/03",
        "https://api.chess.com/pub/player/jorgepr1/games/2021/04",
        "https://api.chess.com/pub/player/jorgepr1/games/2021/06",
        "https://api.chess.com/pub/player/jorgepr1/games/2021/07",
        "https://api.chess.com/pub/player/jorgepr1/games/2021/08",
        "https://api.chess.com/pub/player/jorgepr1/games/2021/09",
        "https://api.chess.com/pub/player/jorgepr1/games/2021/12",
        "https://api.chess.com/pub/player/jorgepr1/games/2022/01",
        "https://api.chess.com/pub/player/jorgepr1/games/2022/02",
        "https://api.chess.com/pub/player/jorgepr1/games/2022/03",
        "https://api.chess.com/pub/player/jorgepr1/games/2022/04",
        "https://api.chess.com/pub/player/jorgepr1/games/2022/05",
        "https://api.chess.com/pub/player/jorgepr1/games/2022/09",
        "https://api.chess.com/pub/player/jorgepr1/games/2022/10",
        "https://api.chess.com/pub/player/jorgepr1/games/2022/11",
        "https://api.chess.com/pub/player/jorgepr1/games/2022/12",
        "https://api.chess.com/pub/player/jorgepr1/games/2023/01",
        "https://api.chess.com/pub/player/jorgepr1/games/2023/02",
        "https://api.chess.com/pub/player/jorgepr1/games/2023/03",
        "https://api.chess.com/pub/player/jorgepr1/games/2023/04",
        "https://api.chess.com/pub/player/jorgepr1/games/2023/05",
        "https://api.chess.com/pub/player/jorgepr1/games/2023/06",
        "https://api.chess.com/pub/player/jorgepr1/games/2023/07",
        "https://api.chess.com/pub/player/jorgepr1/games/2023/08",
        "https://api.chess.com/pub/player/jorgepr1/games/2023/09",
        "https://api.chess.com/pub/player/jorgepr1/games/2023/10",
        "https://api.chess.com/pub/player/jorgepr1/games/2023/11",
        "https://api.chess.com/pub/player/jorgepr1/games/2023/12",
        "https://api.chess.com/pub/player/jorgepr1/games/2024/06",
        "https://api.chess.com/pub/player/jorgepr1/games/2024/12",
        "https://api.chess.com/pub/player/jorgepr1/games/2025/01",
        "https://api.chess.com/pub/player/jorgepr1/games/2025/02",
        "https://api.chess.com/pub/player/jorgepr1/games/2025/03",
        "https://api.chess.com/pub/player/jorgepr1/games/2025/04",
        "https://api.chess.com/pub/player/jorgepr1/games/2025/05",
        "https://api.chess.com/pub/player/jorgepr1/games/2025/06",
        "https://api.chess.com/pub/player/jorgepr1/games/2025/07",
        "https://api.chess.com/pub/player/jorgepr1/games/2025/08",
        "https://api.chess.com/pub/player/jorgepr1/games/2025/09",
        "https://api.chess.com/pub/player/jorgepr1/games/2025/10",
        "https://api.chess.com/pub/player/jorgepr1/games/2025/11",
        "https://api.chess.com/pub/player/jorgepr1/games/2025/12"
    ]
    }
    for archive_url in archives["archives"]:
        parts=archive_url.split("/")
        if parts[-2]==year:
            month=parts[-1]
            datos=fetch_games_archived  (user,year,parts[-1])
            data_mid_level(datos["games"],user=user,mes=month)

    print(total_general)
    print("a")
    print(lotal_months)
    print("b")
(data_mid_level(data_mes_11))

