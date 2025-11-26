import json
import os
from fastapi import FastAPI,Body,HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
debug=True
app = FastAPI()
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # Qué dominios pueden entrar
    allow_credentials=True,
    allow_methods=["*"],        # Permitir todos los métodos (GET, POST, etc.)
    allow_headers=["*"],        # Permitir todos los headers
)


@app.get("/",tags=["Home"])
def home():
    return {"Hello": "World"}



##informacion del perfil
@app.get("/chessyo/{user}", tags=["consultas"])
def user(user):
    nombre_archivo = f"{user}_profile.json"
    if os.path.exists(nombre_archivo):
        print("archivo existe")
        with open(nombre_archivo, 'r', encoding='utf-8') as f:
            data = json.load(f) # Convertimos el archivo de texto a Diccionario Python
            return data
    
    ##si no esta en cache
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


#inforcion de estadisticas basicas
@app.get("/chessstats/{user}", tags=["consultas"])
def stats(user):
    nombre_archivo = f"{user}_stats.json"
    if os.path.exists(nombre_archivo):
        print("archivo existe")
        with open(nombre_archivo, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data
        
    #si no esta en cache
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





#informacion de las partidas jugadas
@app.get("/chessarchives/{user}", tags=["consultas"])
def archives(user):
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
def games(user,year,month):
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




