from collections import Counter
import pandas as pd
import json
import io
import json
import os
def limpieza_fila(games,user='jorgepr1'):
    user=user.lower()
    stats_globales = {
    "racha_actual": 0,
    "mejor_racha": 0
    }
    filas_para_pandas = []
    games.sort(key=lambda x: x['end_time'])
    for game in games:
        es_blancas = game['white']['username'].lower() == user
        mi_color='white' if es_blancas else 'black'
        oponente_color='black' if es_blancas else 'white'
        elo_actual = game[mi_color]['rating']
        mi_resultado = game[mi_color]['result']
        oponente=game[oponente_color]['username']
        elo_oponente=game[oponente_color]['rating']
        if mi_resultado == 'win':
            reason_result=game[oponente_color]['result']
            stats_globales['racha_actual']+=1
            if stats_globales['racha_actual']>stats_globales['mejor_racha']:
                stats_globales['mejor_racha']=stats_globales['racha_actual']
        elif mi_resultado in ['agreed', 'repetition', 'stalemate', 'insufficient', 'timevsinsufficient', '50move']:
            reason_result = mi_resultado
            mi_resultado = 'draw'
        else:
            reason_result = mi_resultado
            mi_resultado = 'loss'
            stats_globales['racha_actual'] = 0
        eco=game.get("eco", "")
        nombre_apertura = eco.split("/")[-1].replace("-"," ")
        fila = {
                'fecha_ts': game['end_time'], # Timestamp crudo
                'color': 'Blanco' if es_blancas else 'Negro',
                'resultado': mi_resultado,
                'reason_result':reason_result,
                'elo': elo_actual,
                'time_class':game['time_class'],
                'oponente': oponente,
                'elo_oponente':elo_oponente,
                'apertura': nombre_apertura,
                'tiempo_control': int(game['time_control'].split("+")[0]),## sin contar el incremento
                'racha_en_este_juego': stats_globales["racha_actual"]
            }
        filas_para_pandas.append(fila)
    return filas_para_pandas


def analisis_pandas(games):
  modesConfig = {
        'bullet': { 'label': 'Bullet', 'timePerGame': 2, 'color': 'from-orange-500 to-red-600', 'icon': '<Zap size={80} className="mb-4 text-yellow-300"/>' },
        'blitz':  { 'label': 'Blitz',  'timePerGame': 10, 'color': 'from-purple-600 to-indigo-700', 'icon': '<Flame size={80} className="mb-4 text-orange-300"/>' },
        'rapid':  { 'label': 'Rapid',  'timePerGame': 20, 'color': 'from-emerald-500 to-teal-700', 'icon': '<Hourglass size={80} className="mb-4 text-emerald-200"/>' },
        'daily':  { 'label': 'Daily',  'timePerGame': 5,  'color': 'from-blue-500 to-cyan-600', 'icon': '<Brain size={80} className="mb-4 text-white"/>' },
    };
  final={'total':{}}
  df_anual=pd.DataFrame(games)
  df_anual['fecha'] = pd.to_datetime(df_anual['fecha_ts'], unit='s')
  df_anual['hora'] = df_anual['fecha'].dt.hour
  df_anual['dia_semana'] = df_anual['fecha'].dt.day_name()
  df_anual['mes'] = df_anual['fecha'].dt.month_name()
  # print(df_anual['time_class'].unique())
  modos=df_anual['time_class'].unique()
  # print(df_anual)
  for modo in modos:
    df_modo=df_anual[df_anual['time_class'] == modo]
    final[modo]={}
    final[modo]['total_partidas']=len(df_modo)
    final[modo]['victorias']=len(df_modo[df_modo['resultado']=='win'])
    elo_maximo=int(df_modo['elo'].max())
    final[modo]['elo_maximo']=elo_maximo
    final[modo]['elo_minimo']=int(df_modo['elo'].min())
    final[modo]['elo_promedio']=int(df_modo['elo'].mean())
    final[modo]['reason_result_top']=dict(df_modo['reason_result'].value_counts().head(1).to_dict())
    final[modo]['oponente_top']=dict(df_modo['oponente'].value_counts().head(1).to_dict())
    final[modo]['apertura_top']=dict(df_modo['apertura'].value_counts().head(1).to_dict())
    final[modo]['hora_top']=dict(df_modo['hora'].value_counts().head(1).to_dict())
    final[modo]['dia_semana_top']=dict(df_modo['dia_semana'].value_counts().head(1).to_dict())
    final[modo]['mes_top']=dict(df_modo['mes'].value_counts().head(1).to_dict())
    final[modo]['racha_maxima']=int(df_modo['racha_en_este_juego'].max())
    final[modo]['mes_elo_maximo']=df_modo[df_modo["elo"]==elo_maximo]['mes'].iloc[0]
    final[modo]['tiempo_jugado']=int(df_modo['tiempo_control'].sum())
    final[modo]['tema']=modesConfig[modo]['color']
    final[modo]['icon']=modesConfig[modo]['icon']
    #tiempo jugado



  #analisis del general potente
  cantidad_partidas=len(df_anual)
  final['total']['total_partidas']=cantidad_partidas
  final['total']['victorias']=len(df_anual[df_anual['resultado']=='win'])
  elo_maximo=int(df_anual['elo'].max())
  final['total']['elo_maximo']=elo_maximo
  final['total']['elo_minimo']=int(df_anual['elo'].min())
  final['total']['reason_result_top']=dict(df_anual['reason_result'].value_counts().head(1).to_dict())
  final['total']['oponente_top']=dict(df_anual['oponente'].value_counts().head(1).to_dict())
  final['total']['apertura_top']=dict(df_anual['apertura'].value_counts().head(1).to_dict())
  final['total']['hora_top'] = {int(k): v for k, v in df_anual['hora'].value_counts().head(1).to_dict().items()}
  final['total']['dia_semana_top']=dict(df_anual['dia_semana'].value_counts().head(1).to_dict())
  final['total']['mes_top']=dict(df_anual['mes'].value_counts().head(1).to_dict())
  final['total']['racha_maxima']=int(df_anual['racha_en_este_juego'].max())
  final['total']['mes_elo_maximo']=df_anual[df_anual["elo"]==elo_maximo]['mes'].iloc[0]
  final['total']['tiempo_jugado']=int(df_anual['tiempo_control'].sum())
  conteos_reason = df_anual['reason_result'].value_counts()
    
  cantidad_timeouts = int(conteos_reason.get("timeout", 0))
  cantidad_mates = int(conteos_reason.get("checkmated", 0))
  cantidad_resigns = int(conteos_reason.get("resigned", 0))
  cantidad_tablas = int(len(df_anual[df_anual['resultado'] == "draw"]))
  personality = "Equilibrado";
  personalityIcon = '<Trophy size={80} className="mb-6 text-yellow-300" />';

  if cantidad_tablas > cantidad_partidas/6:
    personality = "El inexpugnable"; #muchas tablas
    personalityIcon = ''
  if cantidad_mates > cantidad_resigns and cantidad_mates > cantidad_timeouts:
    personality = "El Carnicero"; # Gana por mate
    personalityIcon = '<Sword size={80} className="mb-6 text-red-500" />'
  if cantidad_timeouts > cantidad_mates and cantidad_timeouts > cantidad_resigns:
    personality = "Barry Allen"; # Gana por tiempo
    personalityIcon = '<Clock size={80} className="mb-6 text-blue-300" />'
  if cantidad_resigns > cantidad_mates:
    personality = "El Dominante"; # Se rinden ante él
    personalityIcon = '<Crown size={80} className="mb-6 text-purple-400" />'

  final['total']['personality']=personality
  final['total']['personalityIcon']=personalityIcon


  return final
  

# partidas=limpieza_fila(data_mes_11['games'],user='jorgepr1')
# analisis_pandas(partidas)