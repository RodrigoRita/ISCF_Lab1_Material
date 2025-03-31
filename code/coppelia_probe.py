from fastapi import HTTPException
import sim
import time 
import requests
import main

# global configuration variables
clientID = -1
API_url = "http://127.0.0.1:8000"
database_url="https://iscf-lab1-c6bff-default-rtdb.firebaseio.com"
weather_api = "https://api.openweathermap.org/data/2.5/weather?q=Lisbon&appid=3ac330f0cedb513a97627cfa163e596f&units=metric" #OpenWeather API url

# Helper function provided by the teaching staff
def get_data_from_simulation(id):
    """Connects to the simulation and gets a float signal value

    Parameters
    ----------
    id : str
        The signal id in CoppeliaSim

    Returns
    -------
    data : float
        The float value retrieved from the simulation. None if retrieval fails.
    """
    if clientID!=-1: #Cliente existe
        res, data = sim.simxGetFloatSignal(clientID, id, sim.simx_opmode_blocking)
        if res==sim.simx_return_ok:
            return data
    return None

class DataCollection():
    def __init__(self):
        pass        

    def run(self):
        
        while True:
            data = {
                "x": None,
                "y": None,
                "z": None,
                "temperature": None,
                "timestamp": time.time()
                #"timestamp": (datetime.utcfromtimestamp(time.time())).strftime("%d/%m/%Y : %H:%M")
            }
            
            x = get_data_from_simulation("accelX")            
            if x is not None:
                data["x"] = str(x) #+" m/s^2"
            
            y = get_data_from_simulation("accelY")
            if y is not None:
                data["y"] = str(y) #+" m/s^2"

            z = get_data_from_simulation("accelZ")
            if z is not None:
                data["z"] = str(z) #+" m/s^2"
            

            # TODO Lab 1: Add the necessary code to send data to your API

            temp=requests.get(weather_api)
            if temp.status_code == 200:  # Ensure the request was successful
                temp_json = temp.json()  # Convert response to JSON
                data["temperature"] = str(temp_json.get("main", {}).get("temp")) #+ ' ºC'

            try:
                send_data = main.send_data(data)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Connection error: {str(e)}")

            
            try:
                get_data=main.get_data(data)
                upload=requests.post(database_url+"/sensor_data.json", json=data)
                print("Resposta:", upload.status_code, upload.text)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Connection error: {str(e)}")


            time.sleep(1)

if __name__ == '__main__':
    sim.simxFinish(-1) # just in case, close all opened connections
    clientID=sim.simxStart('127.0.0.1',19997,True,True,5000,5) # Connect to CoppeliaSim
    if clientID!=-1:
        data_collection = DataCollection()
        data_collection.run()      
    else:
        exit()
    