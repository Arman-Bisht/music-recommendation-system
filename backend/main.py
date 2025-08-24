from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from joblib import load
import pandas as pd
import numpy as np

app = FastAPI()

# cors settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], #all origins allowed for now
    allow_credentials = True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# this takes the values from joblib file
try:
    model_data = load("music_recommender.joblib")  
    knn = model_data["model"]          
    scaler = model_data["scaler"]      
    X_scaled_loaded = model_data["X_scaled"]
    df = model_data["data"]           
    features = model_data["features"] 
    print("Model is running now")
except Exception as e:
    raise RuntimeError(f"Failed to load model: {str(e)}")

# model is taken from here
class SongRequest(BaseModel):
    song_name: str
    artist_name: str
    n_recommendations: int = 5  # Deafult value is 5

class SongResponse(BaseModel):
    track_name: str
    artists: str

#Recommendation takes imput from here
@app.post("/recommend", response_model=list[SongResponse])
async def recommend_songs(request: SongRequest):
    try:
        # Validate input
        if not request.song_name.strip() or not request.artist_name.strip():
            raise HTTPException(
                status_code=400, 
                detail="Both song name and artist name are required"
            )

        # input
        song_lower = request.song_name.lower().strip()
        artist_lower = request.artist_name.lower().strip()

        # find matching songs 
        matches = df[
            (df["track_name_lower"].str.contains(song_lower)) &
            (df["artists_lower"].str.contains(artist_lower))
        ]

        # if no exact matches this works
        if matches.empty:
            matches = df[
                (df["track_name_lower"].str.contains(song_lower)) |
                (df["artists_lower"].str.contains(artist_lower))
            ]
            if matches.empty:
                raise HTTPException(status_code=404, detail="No songs found")

        # Get recommendations
        idx = matches.index[0]
        scaled_features = scaler.transform(df.loc[[idx], features].values)
        _, indices = knn.kneighbors(scaled_features, n_neighbors=request.n_recommendations + 1)

        # Format response (exclude the queried song itself)
        recommendations = df.iloc[indices[0][1:]][["track_name", "artists"]].drop_duplicates()
        return recommendations.to_dict(orient="records")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Health check
@app.get("/")
async def health_check():
    return {"status": "OK", "model_loaded": True}