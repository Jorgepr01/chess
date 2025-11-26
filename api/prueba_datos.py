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

user="jorgepr1"

def data_first_level(games,user="jorgepr1"):
    rhythm={}
    for game in games:
        type_r=game.get("time_class", "")
        if type_r not in rhythm:
            rhythm[type_r] = {
                "cantidad_games":0,#siempre-
                "elo_max":0,#gane-
                "elo_min":0,#perdi-
                "w_with":0,#gane-
                "w_black":0,#gane
                "reson_loss":{},#perdi
                "reson_win":{},#gane-
                "racha":0,#gane-
                "racha_cache":0,#cache de racha
                "nemesis":{},#perdi
                "pet":{},#gane-
            }
        white_=game.get("white", {})
        black_=game.get("black", {})
        rhythm[type_r]["cantidad_games"]+=1
        if white_["username"]==user:
            if white_["result"]=="win":
                rhythm[type_r]["w_with"]+=1

                if white_["rating"]>rhythm[type_r]["elo_max"]:
                    rhythm[type_r]["elo_max"]=white_["rating"]
                ##Agregar reson of win 
                if black_["result"] not in rhythm[type_r]["reson_win"]:
                    rhythm[type_r]["reson_win"][black_["result"]]=0
                rhythm[type_r]["reson_win"][black_["result"]]+=1
                ##add pet
                if black_["username"] not in rhythm[type_r]["pet"]:
                    rhythm[type_r]["pet"][black_["username"]]=0
                rhythm[type_r]["pet"][black_["username"]]+=1
                
                #racha
                rhythm[type_r]["racha_cache"]+=1
                if rhythm[type_r]["racha_cache"]>rhythm[type_r]["racha"]:
                    rhythm[type_r]["racha"]=rhythm[type_r]["racha_cache"]
                
            else:
                if black_["rating"]<rhythm[type_r]["elo_min"]:
                    rhythm[type_r]["elo_min"]=black_["rating"]
                #reson of loss
                if white_["result"] not in rhythm[type_r]["reson_loss"]:
                    rhythm[type_r]["reson_loss"][white_["result"]]=0
                rhythm[type_r]["reson_loss"][white_["result"]]+=1
                ##Nemesis
                if white_["username"] not in rhythm[type_r]["nemesis"]:
                    rhythm[type_r]["nemesis"][white_["username"]]=0
                rhythm[type_r]["nemesis"][white_["username"]]+=1

                rhythm[type_r]["racha_cache"]=0

        else:
            if black_["result"]=="win":
                rhythm[type_r]["w_black"]+=1

                if black_["rating"]>rhythm[type_r]["elo_max"]:
                    rhythm[type_r]["elo_max"]=black_["rating"]
                ##Agregar reson of win 
                if white_["result"] not in rhythm[type_r]["reson_win"]:
                    rhythm[type_r]["reson_win"][white_["result"]]=0
                rhythm[type_r]["reson_win"][white_["result"]]+=1
                ##add pet
                if white_["username"] not in rhythm[type_r]["pet"]:
                    rhythm[type_r]["pet"][white_["username"]]=0
                rhythm[type_r]["pet"][white_["username"]]+=1
                
                #racha
                rhythm[type_r]["racha_cache"]+=1
                if rhythm[type_r]["racha_cache"]>rhythm[type_r]["racha"]:
                    rhythm[type_r]["racha"]=rhythm[type_r]["racha_cache"]
                
            else:
                if black_["rating"]<rhythm[type_r]["elo_min"]:
                    rhythm[type_r]["elo_min"]=black_["rating"]
                #reson of loss
                if black_["result"] not in rhythm[type_r]["reson_loss"]:
                    rhythm[type_r]["reson_loss"][black_["result"]]=0
                rhythm[type_r]["reson_loss"][black_["result"]]+=1
                ##Nemesis
                if black_["username"] not in rhythm[type_r]["nemesis"]:
                    rhythm[type_r]["nemesis"][black_["username"]]=0
                rhythm[type_r]["nemesis"][black_["username"]]+=1

                rhythm[type_r]["racha_cache"]=0
    return rhythm

print(data_first_level(data_mes_11))

