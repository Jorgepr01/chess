import json
import os
#nombre de archivos
nombre_profil = "jorgepr1_profile.json"
nombre_stats = "jorgepr1_archives.json"
nombre_archives = "jorgepr1_stats.json"
nombre_games_11 = "jorgepr1_2025_11_games.json"
#avrir y guardar archivos
#with open(nombre_profil, 'r', encoding='utf-8') as f:
#    data_perfil = json.load(f)
#with open(nombre_stats, 'r', encoding='utf-8') as f:
#    data_stats = json.load(f)
#with open(nombre_archives, 'r', encoding='utf-8') as f:
#    data_archives = json.load(f)
with open(nombre_games_11, 'r', encoding='utf-8') as f:
    data_mes_11 = json.load(f)["games"]


def rhythm_game_month(games):
    data=[]
    for game in games:
        data.append({
            "url":game.get("url", ""),
            "time_control":game.get("time_control", ""),
            "rated":game.get("rated", ""),
            "time_class":game.get("time_class", ""),
            "rules":game.get("rules", ""),
            "white":game.get("white", {}),
            "black":game.get("black", {}),
            "eco":game.get("eco", ""),
        })
        
    return data

print(rhythm_game_month(data_mes_11))