# backend/app.py
from fastapi import FastAPI
from pydantic import BaseModel
import requests
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow CORS so frontend can call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for local development
    allow_methods=["*"],
    allow_headers=["*"]
)

API_KEY = "86f592f504a35520ed1f9da8a140eec4"

class CityRequest(BaseModel):
    city: str

@app.post("/predict")
def predict(data: CityRequest):
    city = data.city.strip()

    # 1️⃣ Geocoding API to get coordinates
    geo_res = requests.get(f"http://api.openweathermap.org/geo/1.0/direct?q={city},IN&limit=1&appid={API_KEY}")
    geo = geo_res.json()
    if not geo:
        return {"error": "City not found"}

    lat = geo[0]["lat"]
    lon = geo[0]["lon"]

    # 2️⃣ Weather API
    weather_res = requests.get(f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}")
    weather = weather_res.json()

    rainfall = weather.get("rain", {}).get("1h", 0)
    humidity = weather["main"]["humidity"]
    temperature = round(weather["main"]["temp"] - 273.15, 2)

    # 3️⃣ Simple flood risk logic
    risk = "Low"
    if rainfall > 20 or humidity > 80:
        risk = "High"
    elif rainfall > 10:
        risk = "Moderate"

    return {
        "lat": lat,
        "lon": lon,
        "rainfall": rainfall,
        "humidity": humidity,
        "temperature": temperature,
        "flood_risk": risk
    }