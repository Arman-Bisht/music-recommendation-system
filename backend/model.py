import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import NearestNeighbors
from joblib import dump 

# getting the dataset
try:
    df = pd.read_csv("Music_data.csv", encoding="utf-8")  # used encoding because the dataset started giving unf error
# if dataset is missing 
except FileNotFoundError:
    print("Dataset is missing, check for it.")
    df = None  # or raise an error, depending on your use case

if df is not None:
    # added features
    features = ['danceability', 'energy', 'loudness', 'speechiness',
               'acousticness', 'instrumentalness', 'liveness',
               'valence', 'tempo']

    # this removes any tracks with missing values and duplicates
    df = df.dropna(subset=features + ['track_name', 'artists'])
    df = df.drop_duplicates(subset=['track_id'])

    # make these lower case to search
    df['track_name_lower'] = df['track_name'].str.lower()
    df['artists_lower'] = df['artists'].str.lower()

    #this removes the lower case duplicated names
    df = df.drop_duplicates(subset=['track_name_lower', 'artists_lower'])

    # KNN model
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(df[features])
    knn = NearestNeighbors(n_neighbors=15, metric='cosine').fit(X_scaled)

    # New improved recommend function with sequential support
    def recommend(current_song, current_artist, previous_song=None, previous_artist=None, n=10):
        # lowercasing the user input to match my dataset
        current_song_lower = current_song.lower().strip()
        current_artist_lower = current_artist.lower().strip()

        # match array for current song
        current_matches = df[
            (df['track_name_lower'].str.contains(current_song_lower)) & 
            (df['artists_lower'].str.contains(current_artist_lower))
        ]

        if current_matches.empty:
            # if no exact matches then this runs (hopefully)
            current_matches = df[
                (df['track_name_lower'].str.contains(current_song_lower)) | 
                (df['artists_lower'].str.contains(current_artist_lower))
            ]
            if current_matches.empty:
                return None

        # getting the best match
        current_pos = current_matches.iloc[0].name
        current_features = X_scaled[df.index.get_loc(current_pos)]
        
        # Initialize with current song's features
        blended_features = current_features
        
        # Blend with previous song if provided
        if previous_song and previous_artist:
            previous_song_lower = previous_song.lower().strip()
            previous_artist_lower = previous_artist.lower().strip()
            
            previous_matches = df[
                (df['track_name_lower'].str.contains(previous_song_lower)) & 
                (df['artists_lower'].str.contains(previous_artist_lower))
            ]
            
            if not previous_matches.empty:
                previous_pos = previous_matches.iloc[0].name
                previous_features = X_scaled[df.index.get_loc(previous_pos)]
                # Simple average blending (can be adjusted to weighted average)
                blended_features = (current_features + previous_features)/2


        # Get recommendations with blended features
        _, indices = knn.kneighbors([blended_features], n_neighbors=n+5)
        
        # Filter out input songs and return recommendations
        recommendations = []
        for i in indices[0]:
            song = df.iloc[i]
            is_input = (
                (song['track_name_lower'] == current_song_lower and
                 song['artists_lower'] == current_artist_lower) or
                (previous_song and previous_artist and
                 song['track_name_lower'] == previous_song_lower and
                 song['artists_lower'] == previous_artist_lower)
            )
            if not is_input:
                recommendations.append(song[['track_name', 'artists']])
            if len(recommendations) >= n:
                break
                
        return pd.DataFrame(recommendations).head(n)

# only for terminal work
def main():
    if df is None:
        print("Dataset not loaded, exiting.")
        return

    print("=== Spotify Recommender ===")
    previous_song, previous_artist = None, None
    
    while True:
        song = input("\nEnter song name (or 'q' to quit): ").strip()
        if song.lower() == 'q': 
            break
        artist = input("Enter artist: ").strip()

        recs = recommend(song, artist, previous_song, previous_artist)
        
        if recs is None:
            print("\nNo matching songs found. Try different search terms.")
        else:
            print("\nRecommended songs:")
            print(recs.to_string(index=False))
            # Set current input as previous for next iteration
            previous_song, previous_artist = song, artist

# Save model, scaler, and necessary data using joblib
dump({
    'model': knn,
    'scaler': scaler,
    'data': df[['track_name', 'artists', 'track_name_lower', 'artists_lower'] + features],
    'features': features,
    'X_scaled': X_scaled  # Optional: Save scaled features for faster inference
}, 'music_recommender.joblib')

print("Model saved successfully as 'music_recommender.joblib'")

if __name__ == "__main__":
    main()