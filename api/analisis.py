from collections import Counter

def get_new_stats_template():
    return {
        "cantidad_games": 0,
        "elo_max": 0,
        "elo_min": 10000,
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

def process_month_data(mes_data, total_general, user, mes):
    """Acumula la data de un mes en el diccionario total_general."""
    data_mes_low = data_first_level(mes_data, user=user)
    
    for modo in data_mes_low:
        if modo not in total_general:
            total_general[modo] = get_new_stats_template()
        stats_mes = data_mes_low[modo]
        stats_gen = total_general[modo]
        # Sumas simples
        stats_gen['cantidad_games'] += stats_mes['cantidad_games']
        stats_gen['w_with'] += stats_mes['w_with']
        stats_gen['w_black'] += stats_mes['w_black']
        
        # Comparaciones (Max/Min)
        if stats_mes['elo_max'] > stats_gen['elo_max']:
            stats_gen['elo_max'] = stats_mes['elo_max']
            stats_gen['mes_elo_max'] = mes
        
        if stats_gen['elo_min'] == 10000 or (0 < stats_mes['elo_min'] < stats_gen['elo_min']):
            stats_gen['elo_min'] = stats_mes['elo_min']
            stats_gen['mes_elo_min'] = mes
        stats_gen['racha'] = max(stats_mes['racha'], stats_gen['racha'])

        # Suma de Contadores
        stats_gen['reason_loss'] += stats_mes['reason_loss']
        stats_gen['reason_win'] += stats_mes['reason_win']
        stats_gen['nemesis'] += stats_mes['nemesis']
        stats_gen['pet'] += stats_mes['pet']
        stats_gen['aperturas'] += stats_mes['aperturas']

def clean_stats_for_json(total_general):

    for modo in total_general:
        total_general[modo]['nemesis'] = dict(total_general[modo]['nemesis'].most_common(5))
        total_general[modo]['pet'] = dict(total_general[modo]['pet'].most_common(5))
        total_general[modo]['aperturas'] = dict(total_general[modo]['aperturas'].most_common(10))
        total_general[modo]['reason_loss'] = dict(total_general[modo]['reason_loss'])
        total_general[modo]['reason_win'] = dict(total_general[modo]['reason_win'])
    return total_general

def datos_Importantes(stats):
    resumen = {
        'total_games': 0,
        'total_win': 0,
        'racha_final': 0,
        'timeGame':0,
        'nemesis': Counter(),
        'pet': Counter(),
        'aperturas': Counter(),
        'reason_loss': Counter(),
        'reason_win': Counter()
    }

    total_games,total_win,racha_final,tiempo = 0
    for modo in stats:   
        data_modo = stats[modo]
        total_games += data_modo.get("cantidad_games", 0)
        total_win += data_modo.get("w_with", 0) + data_modo.get("w_black", 0)
        if data_modo.get("racha", 0) > racha_final:
            racha_final = data_modo.get("racha", 0)
        resumen["nemesis"].update(data_modo.get("nemesis", Counter()))
        resumen["pet"].update(data_modo.get("pet", Counter()))
        resumen["aperturas"].update(data_modo.get("aperturas", Counter()))
        resumen["reason_loss"].update(data_modo.get("reason_loss", Counter()))
        resumen["reason_win"].update(data_modo.get("reason_win", Counter()))
        if modo=="bullet":
            tiempo+=2
        elif modo=="blitz":
            tiempo+=5
        elif modo=="rapid":
            tiempo+=10
        elif modo=="tactics":
            tiempo+=1
    
    
    resumen['total_games'] = total_games
    resumen['total_win'] = total_win
    resumen['racha_final'] = racha_final
    resumen['timeGame'] = tiempo
    resumen['nemesis'] = dict(resumen['nemesis'].most_common(1))
    resumen['pet'] = dict(resumen['pet'].most_common(1))
    resumen['aperturas'] = dict(resumen['aperturas'].most_common(1))
    resumen['reason_loss'] = dict(resumen['reason_loss'].most_common(1))
    resumen['reason_win'] = dict(resumen['reason_win'].most_common(1))