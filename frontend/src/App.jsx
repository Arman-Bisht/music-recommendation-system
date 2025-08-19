import { useState, useEffect } from 'react';
import { getSpotifyToken, searchTrack } from './utils/spotify';
import './App.css';

function App() {
  // keep track of what the user types
  const [formData, setFormData] = useState({
    song: '',
    artist: '',
    num: ''
  });

  // store our music recommendations here
  const [results, setResults] = useState([]);
  
  // track what the app is doing (loading, error, etc)
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  
  // spotify stuff for getting album art and previews
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [hasSearched, setHasSearched] = useState(false); // Track if a search has been attempted

  useEffect(() => {
    const fetchToken = async () => {
      const token = await getSpotifyToken();
      setSpotifyToken(token);
    };
    fetchToken();
  }, []);

  // handle when user clicks search
  const handleSubmit = async (e) => {
    e.preventDefault();
    setHasSearched(true);

    // no previous results
    setResults([]);

    if (!formData.song.trim() || !formData.artist.trim()) {
      setStatus('error');
      setError('Both song name and artist name are required');
      return;
    }

    // checks no of recommendations
    const numRecommendations = parseInt(formData.num, 10);
    if (!formData.num.trim() || isNaN(numRecommendations) || 
        numRecommendations < 1 || numRecommendations > 10) {
      setStatus('error');
      setError('Number of recommendations must be between 1 and 10');
      return;
    }

    // ensures the song and artist are not just numbers
    if (!formData.song || !formData.artist || 
        /^\d+$/.test(formData.song) || 
        /^\d+$/.test(formData.artist)) {
      setStatus('error');
      setError('Song and artist names must be text, not numbers');
      return;
    }

    setStatus('loading');
    
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"; //this will only take the env variable first; in case of local usage use only localhost:8000
    console.log("API Base URL:", API_BASE_URL);
    try {
      const response = await fetch(`${API_BASE_URL}/recommend`, {
      //const response = await fetch(`http://127.0.0.1:8000/recommend`, {  this is for local usage
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          song_name: formData.song,
          artist_name: formData.artist,
          n_recommendations: numRecommendations
        })
      });
      console.log("Response status:", response.status);
      // console.log(response)

      const data = await response.json();

      if (!Array.isArray(data)) {
        setStatus('error');
        setError(data.detail || 'Unexpected response from server');
        return;
      }

      if (spotifyToken) {
        const enhancedData = await Promise.all(
          data.map(async (track) => {
            const spotifyData = await searchTrack(
              spotifyToken,
              track.track_name,
              track.artists
            );
            return {
              ...track,
              //this will return the song data from the recommended names
              image: spotifyData?.album?.images[0]?.url || null,
              album: spotifyData?.album?.name || null,
              preview_url: spotifyData?.preview_url || null,
              spotify_url: spotifyData?.external_urls?.spotify || null
            };
          })
        );
        setResults(enhancedData);
      } else {
        setResults(data);
      }

      setStatus('idle');
      setError(null);
    } catch (err) {
      setStatus('error');
      setError(err.message);
      console.error("Fetch error:", err);
    }
  };

  // update form when user types
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // what users see on screen
  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <div className="title-section">
            <span className="music-icon">🎵</span>
            <h1>Music Discovery</h1>
          </div>
        </div>

        <div className="form-card">
          <div className="input-group">
            <label htmlFor="song">Song Name</label>
            <input
              type="text"
              id="song"
              placeholder="Enter a song you love"
              required
              value={formData.song}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="artist">Artist</label>
            <input
              type="text"
              id="artist"
              placeholder="Artist or band name"
              required
              value={formData.artist}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="num">Number of Recommendations</label>
            <input
              type="number"
              id="num"
              placeholder="5"
              min="1"
              max="10"
              required
              value={formData.num}
              onChange={handleInputChange}
            />
          </div>
          
          <button 
            className="submit-btn" 
            onClick={handleSubmit}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? (
              <span className="loading-text">
                <span className="spinner"></span>
                Finding Music...
              </span>
            ) : (
              'Get Recommendations'
            )}
          </button>
        </div>

        <div className="results-section">
          <h2>
            {status === 'error' ? 'Error' : 'Recommended Songs'}
          </h2>
          
          {status === 'error' && (
            <div className="message-card error">
              <span className="icon">⚠️</span>
              <p>{error}</p>
            </div>
          )}
          
          {status === 'idle' && hasSearched && results.length === 0 && (
            <div className="message-card empty">
              <span className="icon">🔍</span>
              <p>No recommendations found. Try a different song!</p>
            </div>
          )}
          
          <div className="tracks-container">
            {results.map((track, index) => (
              <div key={index} className="track-card">
                <div className="track-number">{index + 1}</div>
                {track.image && (
                  <div className="track-image">
                    <img src={track.image} alt={track.track_name} />
                  </div>
                )}
                <div className="track-info">
                  <h3>{track.track_name}</h3>
                  <p>{track.artists}</p>
                  {track.album && <p className="album-name">Album: {track.album}</p>}
                  {track.spotify_url && (
                    <a 
                      href={track.spotify_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="spotify-link"
                    >
                      Open in Spotify
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
