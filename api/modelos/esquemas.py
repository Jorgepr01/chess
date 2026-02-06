from pydantic import BaseModel
from typing import List
from datetime import date 

class FiltroPartidas(BaseModel):
    start_date: date
    end_date: date
    win_types: List[str] = []     
    days_played: List[str] = []   
    time_control: List[str] = []
    aperturas: List[str] = []
    username: str