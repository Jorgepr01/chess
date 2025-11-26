import requests

# 1. Define tu "tarjeta de identificación"
headers = {
    'User-Agent': 'JorgesPiApp/1.0 (jorge.santamariadc9b@gmail.com)'
}

url = 'https://api.chess.com/pub/leaderboards'

# 2. Pasa la tarjeta (headers) en la petición. SI NO PONES ESTO, FALLARÁ SIEMPRE.
response = requests.get(url, headers=headers)

print(f"Código: {response.status_code}")
if response.status_code == 200:
    print(response.json())
else:
    print("Sigue fallando. Razón:")
    print(response.text)