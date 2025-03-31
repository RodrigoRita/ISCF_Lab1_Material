from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
import sqlite3
import time

app = FastAPI()
Api_url="http://127.0.0.1:8000"

# Modelo de entrada de dados
class Sensor_Data(BaseModel):
    x: float = None
    y: float = None
    z: float = None
    temperature : float = None
    timestamp: float = None


@app.post("/sensor_data.json")
def send_data(data: Sensor_Data):
    try:
        return {"message": "Data received successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Connection error: {str(e)}")

@app.get("/sensor_data.json")
def get_data(data:Sensor_Data):
    try:
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Connection error: {str(e)}")
    




