import json
import os
#nombre de archivos
nombre_profil = "jorgepr1_profile.json"
nombre_stats = "jorgepr1_archives.json"
nombre_archives = "jorgepr1_stats.json"
nombre_games_11 = "jorgepr1_2025_11_games.json"
nombre_top="top.json"
#avrir y guardar archivos
#with open(nombre_profil, 'r', encoding='utf-8') as f:
#    data_perfil = json.load(f)
#with open(nombre_stats, 'r', encoding='utf-8') as f:
#    data_stats = json.load(f)
#with open(nombre_archives, 'r', encoding='utf-8') as f:
#    data_archives = json.load(f)
with open(nombre_games_11, 'r', encoding='utf-8') as f:
    data_mes_11 = json.load(f)["games"]

with open(nombre_top, 'r', encoding='utf-8') as f:
    data_top = json.load(f)

user="jorgepr1"


def get_new_stats_template():
    """Retorna un diccionario limpio con los valores por defecto."""
    return {
        "cantidad_games": 0,
        "elo_max": 0,
        "elo_min": 10000, # Tu valor inicial personalizado
        "w_with": 0,
        "w_black": 0,
        "reson_loss": {}, 
        "reson_win": {}, 
        "racha": 0,
        "racha_cache": 0,
        "nemesis": {}, 
        "pet": {},
        "aperturas": {} 
    }

#limpiar la data
def data_first_level(games, user="jorgepr1"):
    rhythm = {}
    user = user.lower()

    for game in games:
        type_r = game.get("time_class", "")
        
        # 1. Inicializar estructura (agregamos "aperturas")
        if type_r not in rhythm:
            rhythm[type_r] = get_new_stats_template()
        
        eco_url = game.get("eco", "")
        if eco_url:
            raw_name = eco_url.split("/")[-1] 
            opening_name = raw_name.replace("-", " ")
            
            # Opcional: Si quieres nombres más cortos, puedes cortar antes del primer punto
            # Ej: "Pirc Defense Maroczy..." -> "Pirc Defense Maroczy Defense"
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
                if opponent_result not in rhythm[type_r]["reson_win"]: rhythm[type_r]["reson_win"][opponent_result] = 0
                rhythm[type_r]["reson_win"][opponent_result] += 1
                if opponent_name not in rhythm[type_r]["pet"]: rhythm[type_r]["pet"][opponent_name] = 0
                rhythm[type_r]["pet"][opponent_name] += 1
                rhythm[type_r]["racha_cache"] += 1
                if rhythm[type_r]["racha_cache"] > rhythm[type_r]["racha"]: rhythm[type_r]["racha"] = rhythm[type_r]["racha_cache"]
            else:
                if result in ["checkmated", "timeout", "resigned", "abandoned"]:
                    if result not in rhythm[type_r]["reson_loss"]: rhythm[type_r]["reson_loss"][result] = 0
                    rhythm[type_r]["reson_loss"][result] += 1
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
                if opponent_result not in rhythm[type_r]["reson_win"]: rhythm[type_r]["reson_win"][opponent_result] = 0
                rhythm[type_r]["reson_win"][opponent_result] += 1
                if opponent_name not in rhythm[type_r]["pet"]: rhythm[type_r]["pet"][opponent_name] = 0
                rhythm[type_r]["pet"][opponent_name] += 1
                rhythm[type_r]["racha_cache"] += 1
                if rhythm[type_r]["racha_cache"] > rhythm[type_r]["racha"]: rhythm[type_r]["racha"] = rhythm[type_r]["racha_cache"]
            else:
                if result in ["checkmated", "timeout", "resigned", "abandoned"]:
                    if result not in rhythm[type_r]["reson_loss"]: rhythm[type_r]["reson_loss"][result] = 0
                    rhythm[type_r]["reson_loss"][result] += 1
                    if opponent_name not in rhythm[type_r]["nemesis"]: rhythm[type_r]["nemesis"][opponent_name] = 0
                    rhythm[type_r]["nemesis"][opponent_name] += 1
                    rhythm[type_r]["racha_cache"] = 0
                elif result in ["stalemate", "repetition", "insufficient", "agreed"]:
                     rhythm[type_r]["racha_cache"] = 0
    return rhythm

print(data_first_level(data_mes_11))

