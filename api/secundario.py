import json
import os # Para verificar si el archivo existe
import uvicorn
from fastapi import FastAPI,Body
from fastapi.middleware.cors import CORSMiddleware
import requests
from fastapi import FastAPI, HTTPException
import requests



debug=True

app = FastAPI()


origins = [
    "http://localhost:5173",    # Tu React local
    "http://127.0.0.1:5173",    # Alternativa de local
    "*"                         # (Opcional) Usa "*" para permitir a CUALQUIERA conectarse (útil para desarrollo)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # Qué dominios pueden entrar
    allow_credentials=True,
    allow_methods=["*"],        # Permitir todos los métodos (GET, POST, etc.)
    allow_headers=["*"],        # Permitir todos los headers
)


@app.get("/",tags=["Home"])
def home():
    return {"Hello": "World"}

# @app.get("/chess", tags=["consultas"])
# def showJugadores():
#     return jugadores




@app.get("/chessyo/{user}", tags=["consultas"])
def yo(user):
    nombre_archivo = f"{user}_profile.json"
    if os.path.exists(nombre_archivo):
        print("archivo existe")
        with open(nombre_archivo, 'r', encoding='utf-8') as f:
            data = json.load(f) # Convertimos el archivo de texto a Diccionario Python
            return data
    
    
    headers = {'User-Agent': 'JorgesPiApp/1.0 (jorge.santamariadc9b@gmail.com)'}
    url = f'https://api.chess.com/pub/player/{user}'
    response = requests.get(url, headers=headers)
    print(f"Código: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        with open(nombre_archivo, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        return data
    else:
        print("Sigue fallando. Razón:")
        print(response.text)



@app.get("/chessstats/{user}", tags=["consultas"])
def yo(user):
    nombre_archivo = f"{user}_stats.json"
    if os.path.exists(nombre_archivo):
        print("archivo existe")
        with open(nombre_archivo, 'r', encoding='utf-8') as f:
            data = json.load(f) # Convertimos el archivo de texto a Diccionario Python
            return data
        

    headers = {'User-Agent': 'JorgesPiApp/1.0 (jorge.santamariadc9b@gmail.com)'}
    url = f'https://api.chess.com/pub/player/{user}/stats'
    response = requests.get(url, headers=headers)

    print(f"Código: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        with open(nombre_archivo, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        return data
    else:
        print("Sigue fallando. Razón:")
        print(response.text)
        return {"error": "No se pudo obtener datos", "codigo": response.status_code}






@app.get("/chessarchives/{user}", tags=["consultas"])
def yo(user):
    nombre_archivo = f"{user}_archives.json"
    if os.path.exists(nombre_archivo):
        print("archivo existe")
        with open(nombre_archivo, 'r', encoding='utf-8') as f:
            data = json.load(f) # Convertimos el archivo de texto a Diccionario Python
            return data
        
    headers = {'User-Agent': 'JorgesPiApp/1.0 (jorge.santamariadc9b@gmail.com)'}
    url = f'https://api.chess.com/pub/player/{user}/games/archives'
    response = requests.get(url, headers=headers)

    print(f"Código: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        with open(nombre_archivo, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        return data
    else:
        print("Sigue fallando. Razón:")
        print(response.text)
        return {"error": "No se pudo obtener datos", "codigo": response.status_code}



@app.get("/chessgames{user}/{year}/{month}", tags=["consultas"])
def yo(user,year,month):
    nombre_archivo = f"{user}_{year}_{month}_games.json"
    if os.path.exists(nombre_archivo):
        print("archivo existe")
        with open(nombre_archivo, 'r', encoding='utf-8') as f:
            data = json.load(f) # Convertimos el archivo de texto a Diccionario Python
            return data
    headers = {'User-Agent': 'JorgesPiApp/1.0 (jorge.santamariadc9b@gmail.com)'}
    url = f'https://api.chess.com/pub/player/{user}/games/{year}/{month}'
    # 2. Pasa la tarjeta (headers) en la petición. SI NO PONES ESTO, FALLARÁ SIEMPRE.
    response = requests.get(url, headers=headers)

    print(f"Código: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        with open(nombre_archivo, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        return data
    else:
        print("Sigue fallando. Razón:")
        print(response.text)
        return {"error": "No se pudo obtener datos", "codigo": response.status_code}


@app.get("/top-players", tags=["consultas"])
def top_players():
    nombre_archivo = f"top.json"
    if os.path.exists(nombre_archivo):
        print("archivo existe")
        with open(nombre_archivo, 'r', encoding='utf-8') as f:
            data = json.load(f) # Convertimos el archivo de texto a Diccionario Python
            return data
    headers = {'User-Agent': 'JorgesPiApp/1.0 (jorge.santamariadc9b@gmail.com)'}
    url = "https://api.chess.com/pub/leaderboards"

    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        data = {
            "rapidas": data.get("live_rapid", []),   # Rapid
            "blitz":   data.get("live_blitz", []),   # Blitz
            "bala":    data.get("live_bullet", [])   # Bullet
        }
        with open(nombre_archivo, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        return data
    else:
        print("Sigue fallando. Razón:")
        print(response.text)
        return {"error": "No se pudo obtener datos", "codigo": response.status_code}





# @app.get("/chess/{id}", tags=["consultas"])
# def get_jugadores(id):
#     return id



# ##esto es como el que todos conocemos con el url//blablabla?query=as
# @app.get("/chess/", tags=["consultas"])
# def jugador(nombre=str, elo=int):
#     for jugador in jugadores:
#         if jugador["nombre"]==nombre:
#             return jugador
#     return {"nombre": nombre, "elo": elo}


# ##Ahora vamos con el post "guardar datos"
# @app.post("/chess/",tags=["consultas"])
# def addPlayer(id:int=Body(), nombre:str=Body(), elo:int=Body()):
#     jugadores.append({
#         "id":id,
#         "nombre":nombre,
#         "elo":elo
#     })
#     return jugadores

# @app.put("/chess/{id}", tags=["consultas"])
# def updPlayer(id:int,nombre:str=Body(), elo:int=Body()):
#     for jugador in jugadores:
#         if id == jugador["id"]:
#             jugador["nombre"]=nombre
#             jugador["elo"]=elo
#     return jugadores
    
# @app.delete("/chess/{id}", tags=["consultas"])
# def delPlayer(id:int):
#     for jugador in jugadores:
#         if id==jugador["id"]:
#             jugadores.remove(jugador)
#     return jugadores
    


