import io
import json
import os
import chess.pgn
texto="[Event \"Live Chess\"]\n[Site \"Chess.com\"]\n[Date \"2025.01.02\"]\n[Round \"-\"]\n[White \"karolfbraga\"]\n[Black \"Jorgepr1\"]\n[Result \"0-1\"]\n[CurrentPosition \"3r4/8/1p4k1/6Pp/1P3r1P/P7/3p4/3R2K1 w - -\"]\n[Timezone \"UTC\"]\n[ECO \"C50\"]\n[ECOUrl \"https://www.chess.com/openings/Giuoco-Piano-Game-4.O-O-Nf6-5.Nc3-d6\"]\n[UTCDate \"2025.01.02\"]\n[UTCTime \"01:54:03\"]\n[WhiteElo \"647\"]\n[BlackElo \"651\"]\n[TimeControl \"60\"]\n[Termination \"Jorgepr1 won on time\"]\n[StartTime \"01:54:03\"]\n[EndDate \"2025.01.02\"]\n[EndTime \"01:56:10\"]\n[Link \"https://www.chess.com/game/live/121861466870\"]\n\n1. e4 {[%clk 0:00:59.8]} 1... e5 {[%clk 0:00:59.4]} 2. Nf3 {[%clk 0:00:59.3]} 2... Nc6 {[%clk 0:00:58.9]} 3. Bc4 {[%clk 0:00:58.9]} 3... Bc5 {[%clk 0:00:57.7]} 4. Nc3 {[%clk 0:00:58.3]} 4... Nf6 {[%clk 0:00:57.2]} 5. O-O {[%clk 0:00:57.6]} 5... d6 {[%clk 0:00:56.3]} 6. d3 {[%clk 0:00:57.1]} 6... O-O {[%clk 0:00:55.1]} 7. Bg5 {[%clk 0:00:56.5]} 7... h6 {[%clk 0:00:53.4]} 8. Bxf6 {[%clk 0:00:54.6]} 8... Qxf6 {[%clk 0:00:53.3]} 9. Nd5 {[%clk 0:00:53.4]} 9... Qd8 {[%clk 0:00:50.5]} 10. h3 {[%clk 0:00:49.8]} 10... Be6 {[%clk 0:00:48.8]} 11. a3 {[%clk 0:00:46.8]} 11... Ne7 {[%clk 0:00:47.5]} 12. b4 {[%clk 0:00:44.6]} 12... Bb6 {[%clk 0:00:45.7]} 13. Nxb6 {[%clk 0:00:41.7]} 13... axb6 {[%clk 0:00:45.6]} 14. Bxe6 {[%clk 0:00:38.2]} 14... fxe6 {[%clk 0:00:45.5]} 15. c3 {[%clk 0:00:36]} 15... Nc6 {[%clk 0:00:42]} 16. d4 {[%clk 0:00:35]} 16... exd4 {[%clk 0:00:40.8]} 17. cxd4 {[%clk 0:00:33.8]} 17... d5 {[%clk 0:00:39.9]} 18. exd5 {[%clk 0:00:32.5]} 18... exd5 {[%clk 0:00:38.4]} 19. Qe2 {[%clk 0:00:30.6]} 19... Qf6 {[%clk 0:00:37.5]} 20. Rfe1 {[%clk 0:00:25.8]} 20... Nxd4 {[%clk 0:00:35.2]} 21. Nxd4 {[%clk 0:00:24.2]} 21... Qxd4 {[%clk 0:00:35.1]} 22. Qe6+ {[%clk 0:00:22.6]} 22... Kh8 {[%clk 0:00:32.9]} 23. Rad1 {[%clk 0:00:21.1]} 23... Qf6 {[%clk 0:00:30.9]} 24. Qd7 {[%clk 0:00:18.8]} 24... Rad8 {[%clk 0:00:29]} 25. Qxc7 {[%clk 0:00:17.7]} 25... d4 {[%clk 0:00:27.6]} 26. Qxb7 {[%clk 0:00:16.8]} 26... d3 {[%clk 0:00:26.4]} 27. Re7 {[%clk 0:00:13.7]} 27... d2 {[%clk 0:00:22.7]} 28. Rxg7 {[%clk 0:00:12]} 28... Qxg7 {[%clk 0:00:15.7]} 29. Qxg7+ {[%clk 0:00:10.3]} 29... Kxg7 {[%clk 0:00:15.6]} 30. f4 {[%clk 0:00:07.5]} 30... Rxf4 {[%clk 0:00:14.2]} 31. g3 {[%clk 0:00:06.2]} 31... Rf6 {[%clk 0:00:12.2]} 32. h4 {[%clk 0:00:05.6]} 32... Kg6 {[%clk 0:00:10.7]} 33. g4 {[%clk 0:00:04.9]} 33... h5 {[%clk 0:00:09.7]} 34. g5 {[%clk 0:00:02.5]} 34... Rf4 {[%clk 0:00:08.8]} 0-1\n"

pgn = io.StringIO(texto)
game = chess.pgn.read_game(pgn)
game.mainline()
# print(game)
filename='aperturas.json'
eco_partida = game.headers.get("ECO")
if eco_partida[0]=='A':
    tipo_apertura = 'Aperturas de flanco'
elif eco_partida[0]=='B':
    tipo_apertura = 'Aperturas semiabiertas'
elif eco_partida[0]=='C':
    tipo_apertura = 'Aperturas abiertas.'
elif eco_partida[0]=='D':
    tipo_apertura = 'Aperturas cerradas y semicerradas'
elif eco_partida[0]=='E':
    tipo_apertura = 'Defensas Indias'

if os.path.exists(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        diccionario_aperturas = json.load(f)
nombre_apertura = diccionario_aperturas.get(eco_partida)
print(nombre_apertura)


#headtmap
heatmap = [[0 for _ in range(8)] for _ in range(8)]
def procesar_heatmap():    
    board = game.board()
    for move in game.mainline_moves():
        casilla_destino = move.to_square 
        fila = 7 - chess.square_rank(casilla_destino)
        columna = chess.square_file(casilla_destino)
        # Sumamos +1 a esa casilla ("La calentamos")
        heatmap[fila][columna] += 1
        # Avanzamos el tablero (necesario si quisiéramos filtrar capturas, etc.)
        board.push(move)
    return heatmap
matriz_final = procesar_heatmap() 
print("Matriz generada (simulación):")
print(json.dumps(heatmap, indent=2))
# with open("heatmap_data.json", "w") as f:
#     json.dump(heatmap, f)
max_valor = max(max(fila) for fila in heatmap)

heatmap_normalizado = []
for fila in heatmap:
    nueva_fila = [valor / max_valor for valor in fila]
    heatmap_normalizado.append(nueva_fila)

