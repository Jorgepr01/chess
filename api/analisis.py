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

def data_first_level(games, user):
    rhythm = {}
    user = user.lower()
    games.sort(key=lambda x: x.get('end_time', 0))
    for game in games:
        type_r = game.get("time_class", "")
        if not type_r: continue
            
        if type_r not in rhythm:
            rhythm[type_r] = get_new_stats_template()
        eco_url = game.get("eco", "")
        if eco_url:
            raw_name = eco_url.split("/")[-1]
            opening_name = raw_name.replace("-", " ").split(".")[0]
            rhythm[type_r]["aperturas"][opening_name] += 1

        white_ = game.get("white", {})
        black_ = game.get("black", {})
        rhythm[type_r]["cantidad_games"] += 1
        
        if white_["username"].lower() == user:
            my_color, user_rating = "white", white_["rating"]
            result, opponent_name = white_["result"], black_["username"]
            opponent_result = black_["result"]
        else:
            my_color, user_rating = "black", black_["rating"]
            result, opponent_name = black_["result"], white_["username"]
            opponent_result = white_["result"]

        if user_rating > rhythm[type_r]["elo_max"]: rhythm[type_r]["elo_max"] = user_rating
        if user_rating < rhythm[type_r]["elo_min"]: rhythm[type_r]["elo_min"] = user_rating

        if result == "win":
            if my_color == "white": rhythm[type_r]["w_with"] += 1
            else: rhythm[type_r]["w_black"] += 1
            
            rhythm[type_r]["reason_win"][opponent_result] += 1
            rhythm[type_r]["pet"][opponent_name] += 1
            
            rhythm[type_r]["racha_cache"] += 1
            if rhythm[type_r]["racha_cache"] > rhythm[type_r]["racha"]:
                rhythm[type_r]["racha"] = rhythm[type_r]["racha_cache"]
        else:
            rhythm[type_r]["racha_cache"] = 0 # Reiniciar racha
            if result in ["checkmated", "timeout", "resigned", "abandoned"]:
                rhythm[type_r]["reason_loss"][result] += 1
                rhythm[type_r]["nemesis"][opponent_name] += 1

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
        
        if stats_mes['elo_min'] < stats_gen['elo_min']:
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