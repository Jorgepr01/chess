import pandas as pd
import io
import json
import os
import chess
import chess.pgn
from modelos.esquemas import FiltroPartidas
from datetime import date 

filtros_default= FiltroPartidas(start_date=date(2025,1,1),
                      end_date=date(2025,12,31),
                       win_types=["checkmated","timeout","resigned","agreed","timevsinsufficient","abandoned","repetition","stalemate","insufficient"],
                       days_played= ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
                        time_control= ["blitz","rapid","bullet","daily"],
                        aperturas=["A","B","C","D","E","Z"],
                        username="")

def procesar_pgn(partida,heatmap_mes,diccionario_aperturas,es_blancas,conteo_piezas,filtro_apertura):
  if not partida:
      return "Desconocida", "Desconocida", heatmap_mes,conteo_piezas
  pgn = io.StringIO(partida)
  game = chess.pgn.read_game(pgn)
  if not game:
    return "Desconocida", "Desconocida", heatmap_mes,conteo_piezas
  # game.mainline()
  eco_partida = game.headers.get("ECO","Z")
  if eco_partida[0] not in filtro_apertura:
     print("filtro apertura")
     return None,None,heatmap_mes,conteo_piezas
  tipo_apertura='Desconocida'
  if eco_partida[0]=='A':
      tipo_apertura = 'Aperturas de flanco'
  elif eco_partida[0]=='B':
      tipo_apertura = 'Aperturas semiabiertas'
  elif eco_partida[0]=='C':
      tipo_apertura = 'Aperturas abiertas'
  elif eco_partida[0]=='D':
      tipo_apertura = 'Aperturas cerradas y semicerradas'
  elif eco_partida[0]=='E':
      tipo_apertura = 'Defensas Indias'
  elif eco_partida[0]=='Z':
      tipo_apertura = 'Desconocida'

  nombre_apertura = diccionario_aperturas.get(eco_partida,'Desconocida')
  
  #Procesar heatmap
  board = game.board()
  for move in game.mainline_moves():
      if board.turn == es_blancas:
            pieza = board.piece_at(move.from_square)
            if pieza:
                symbol = pieza.symbol().upper() # P, N, B, R, Q, K
                conteo_piezas[symbol] = conteo_piezas.get(symbol, 0) + 1
      casilla_destino = move.to_square 
      fila = 7 - chess.square_rank(casilla_destino)
      columna = chess.square_file(casilla_destino)
      heatmap_mes[fila][columna] += 1
      board.push(move)

  return nombre_apertura,tipo_apertura,heatmap_mes,conteo_piezas


def limpieza_fila(games,filtros:FiltroPartidas=filtros_default,user=""):
    # user=user.lower()
    if(user != ""):
       filtros.username=user
    stats_globales = {
    "racha_actual": 0,
    "mejor_racha": 0
    }
    filas_para_pandas = []
    heatmap_mes = [[0 for _ in range(8)] for _ in range(8)]
    conteo_piezas_mes = {'P': 0, 'N': 0, 'B': 0, 'R': 0, 'Q': 0, 'K': 0}
    games.sort(key=lambda x: x['end_time'])
    #Cargar aperturas
    diccionario_aperturas = {}
    filename='aperturas.json'
    if os.path.exists(filename):
      with open(filename, 'r', encoding='utf-8') as f:
          diccionario_aperturas = json.load(f)
    for game in games:
        ## FILTRO DE TIPO DE JUEGO
        if game['time_class'] not in filtros.time_control:
           print(game['time_class'])
           print("chao1")
           continue
        es_blancas = game['white']['username'].lower() == filtros.username.lower()
        mi_color='white' if es_blancas else 'black'
        oponente_color='black' if es_blancas else 'white'
        elo_actual = game[mi_color]['rating']
        mi_resultado = game[mi_color]['result']
        oponente=game[oponente_color]['username']
        elo_oponente=game[oponente_color]['rating']
        if mi_resultado == 'win':
            reason_result=game[oponente_color]['result']
            ## FILTRO DE LA RAZON DE VICTORIA
            if reason_result not in filtros.win_types:
               print(reason_result)
               print("chao2")
               continue
            stats_globales['racha_actual']+=1
            if stats_globales['racha_actual']>stats_globales['mejor_racha']:
                stats_globales['mejor_racha']=stats_globales['racha_actual']
        elif mi_resultado in ['agreed', 'repetition', 'stalemate', 'insufficient', 'timevsinsufficient', '50move']:
            reason_result = mi_resultado
            ## FILTRO DE LA RAZON DE VICTORIA
            if reason_result not in filtros.win_types:
               print(reason_result)
               print("chao3")
               continue
            mi_resultado = 'draw'
        else:
            reason_result = mi_resultado
            ## FILTRO DE LA RAZON DE VICTORIA
            if reason_result not in filtros.win_types:
               print(reason_result)
               print("chao4")
               continue
            mi_resultado = 'loss'
            stats_globales['racha_actual'] = 0

        
        #Analisis PGN

        partida=game.get('pgn')
        nombre_apertura,tipo_apertura,heatmap_mes,conteo_piezas_mes = procesar_pgn(partida,heatmap_mes,diccionario_aperturas,es_blancas,conteo_piezas_mes,filtros.aperturas)
        if nombre_apertura==None:
           continue
        
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
                'tipo_apertura':tipo_apertura,
                'tiempo_control': int(eval(game['time_control'].split("+")[0])),## sin contar el incremento
                'racha_en_este_juego': stats_globales["racha_actual"]
            }
        
        filas_para_pandas.append(fila)
    return filas_para_pandas,heatmap_mes,conteo_piezas_mes


def analisis_pandas(games,filtros:FiltroPartidas=filtros_default):
  # modesConfig = {
  #       'bullet': { 'label': 'Bullet', 'timePerGame': 2, 'color': 'from-orange-500 to-red-600', 'icon': '<Zap size={80} className="mb-4 text-yellow-300"/>' },
  #       'blitz':  { 'label': 'Blitz',  'timePerGame': 10, 'color': 'from-purple-600 to-indigo-700', 'icon': '<Flame size={80} className="mb-4 text-orange-300"/>' },
  #       'rapid':  { 'label': 'Rapid',  'timePerGame': 20, 'color': 'from-emerald-500 to-teal-700', 'icon': '<Hourglass size={80} className="mb-4 text-emerald-200"/>' },
  #       'daily':  { 'label': 'Daily',  'timePerGame': 5,  'color': 'from-blue-500 to-cyan-600', 'icon': '<Brain size={80} className="mb-4 text-white"/>' },
  #   };
  
  final={'total':{}}
  if games==[]:
     return None
  df_anual=pd.DataFrame(games)
  df_anual['fecha'] = pd.to_datetime(df_anual['fecha_ts'], unit='s', utc=True).dt.tz_convert('America/Guayaquil')
  df_anual['fecha_date'] = df_anual['fecha'].dt.date
  df_anual['hora'] = df_anual['fecha'].dt.hour
  df_anual['dia_semana'] = df_anual['fecha'].dt.day_name()
  df_anual['mes'] = df_anual['fecha'].dt.month_name()

#   ##FILTROS 
  #Filtros fecha
  mask_fecha = (df_anual['fecha_date'] >= filtros.start_date) & (df_anual['fecha_date'] <= filtros.end_date)
  df_anual = df_anual[mask_fecha]
  if filtros.days_played:
    df_anual = df_anual[df_anual['dia_semana'].isin(filtros.days_played)]


  if df_anual.empty:
    return None

  # print(df_anual)
  modos=df_anual['time_class'].unique()
  # print(df_anual)
  for modo in modos:
    print(modo)
    df_modo=df_anual[df_anual['time_class'] == modo]
    final[modo]={}
    final[modo]['mode_type']=modo
    final[modo]['total_partidas']=len(df_modo)
    final[modo]['victorias']=len(df_modo[df_modo['resultado']=='win'])
    elo_maximo=int(df_modo['elo'].max())
    final[modo]['elo_maximo']=elo_maximo
    final[modo]['elo_minimo']=int(df_modo['elo'].min())
    final[modo]['elo_promedio']=int(df_modo['elo'].mean())
    final[modo]['reason_result_top']=dict(df_modo['reason_result'].value_counts().head(1).to_dict())
    final[modo]['oponente_top'] = {
    "name": df_modo['oponente'].value_counts().idxmax(),
    "count": int(df_modo['oponente'].value_counts().max())
    }
    final[modo]['apertura_top'] = {
    "name": df_modo['apertura'].value_counts().idxmax(),
    "count": int(df_modo['apertura'].value_counts().max())
    }
    final[modo]['hora_top'] = {
    "name": int(df_modo['hora'].value_counts().idxmax()),
    "count": int(df_modo['hora'].value_counts().max())
    }
    final[modo]['dia_semana_top'] = {
    "name": df_modo['dia_semana'].value_counts().idxmax(),
    "count": int(df_modo['dia_semana'].value_counts().max())
    }
    final[modo]['mes_top'] = {
    "name": df_modo['mes'].value_counts().idxmax(),
    "count": int(df_modo['mes'].value_counts().max())
    }
    final[modo]['racha_maxima']=int(df_modo['racha_en_este_juego'].max())
    final[modo]['mes_elo_maximo']=df_modo[df_modo["elo"]==elo_maximo]['mes'].iloc[0]
    final[modo]['tiempo_jugado']=int(df_modo['tiempo_control'].sum()*2)
    #tiempo jugado



  #analisis del general potente
  cantidad_partidas=len(df_anual)
  final['total']['total_partidas']=cantidad_partidas
  final['total']['victorias']=len(df_anual[df_anual['resultado']=='win'])
  elo_maximo=int(df_anual['elo'].max())
  final['total']['elo_maximo']=elo_maximo
  final['total']['elo_minimo']=int(df_anual['elo'].min())
  final['total']['reason_result_top']=dict(df_anual['reason_result'].value_counts().head(1).to_dict())
  final['total']['oponente_top'] = {
  "name": df_anual['oponente'].value_counts().idxmax(),
  "count": int(df_anual['oponente'].value_counts().max())
  }
  vc = (
    df_anual[df_anual['resultado'] == 'loss']['oponente']
    .dropna()
    .value_counts()
    )

  if vc.empty:
      final['total']['nemesis'] = {
          'name': None,
          'count': 0
      }
  else:
      final['total']['nemesis'] = {
          'name': vc.idxmax(),
          'count': int(vc.max())
      }
  vc = (
    df_anual[df_anual['resultado'] == 'win']['oponente']
    .dropna()
    .value_counts()
  )

  if vc.empty:
      final['total']['pet'] = {
          'name': None,
          'count': 0
      }
  else:
      final['total']['pet'] = {
          'name': vc.idxmax(),
          'count': int(vc.max())
      }
  final['total']['apertura_top'] = {
  "name": df_anual['apertura'].value_counts().idxmax(),
  "count": int(df_anual['apertura'].value_counts().max())
  }
  final['total']['hora_top'] = {
  "name": int(df_anual['hora'].value_counts().idxmax()),
  "count": int(df_anual['hora'].value_counts().max())
  }
  final['total']['dia_semana_top'] = {
  "name": df_anual['dia_semana'].value_counts().idxmax(),
  "count": int(df_anual['dia_semana'].value_counts().max())
  }
  final['total']['mes_top'] = {
  "name": df_anual['mes'].value_counts().idxmax(),
  "count": int(df_anual['mes'].value_counts().max())
  }
  final['total']['racha_maxima']=int(df_anual['racha_en_este_juego'].max())
  final['total']['mes_elo_maximo']=df_anual[df_anual["elo"]==elo_maximo]['mes'].iloc[0]
  final['total']['tiempo_jugado']=int(df_anual['tiempo_control'].sum())
  final['total']['amigos']=dict(df_anual['oponente'].value_counts().head(10).to_dict())
  conteos_reason = df_anual['reason_result'].value_counts()
    
  cantidad_timeouts = int(conteos_reason.get("timeout", 0))
  cantidad_mates = int(conteos_reason.get("checkmated", 0))
  cantidad_resigns = int(conteos_reason.get("resigned", 0))
  cantidad_tablas = int(len(df_anual[df_anual['resultado'] == "draw"]))
  personality = "Equilibrado"

  if cantidad_tablas > cantidad_partidas/6:
    personality = "El inexpugnable" #muchas tablas
  if cantidad_mates > cantidad_resigns and cantidad_mates > cantidad_timeouts:
    personality = "El Carnicero" # Gana por mate
  if cantidad_timeouts > cantidad_mates and cantidad_timeouts > cantidad_resigns:
    personality = "Barry Allen" # Gana por tiempo
  if cantidad_resigns > cantidad_mates:
    personality = "El Dominante" # Se rinden ante él

  final['total']['personality']=personality

  def get_color_stats(color_str):
    df_color = df_anual[df_anual['color'] == color_str]
    total = len(df_color)
    if total == 0 : return {"wins": 0, "total": 0, "winrate": 0}
    wins = len(df_color[df_color['resultado'] == 'win'])
    return {
        "wins": wins,
        "total": total,
        "winrate": int((wins / total) * 100)
          }
  final['total']['stats_blancas'] = get_color_stats('Blanco')
  final['total']['stats_negras'] = get_color_stats('Negro')
  #df_anual.to_csv(f'datos_{filtros.username}.xlsx', index=False, sheet_name='Hoja1')


  return final
  

# partidas=limpieza_fila(data_mes_11['games'],user='jorgepr1')
# analisis_pandas(partidas)