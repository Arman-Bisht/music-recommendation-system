import { useState, useEffect } from 'react';
import { getSpotifyToken, searchTrack } from './utils/spotify';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    song: '',
    artist: '',
    num: ''
  });
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [hasSearched, setHasSearched] = useState(false); // Track if a search has been attempted

  useEffect(() => {
    const fetchToken = async () => {
      const token = await getSpotifyToken();
      setSpotifyToken(token);
    };
    fetchToken();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHasSearched(true); // Set to true when search is attempted
    
    if (!formData.song.trim() || !formData.artist.trim()) {
      setStatus('error');
      setError('Both song name and artist name are required');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch("http://127.0.0.1:8000/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          song_name: formData.song,
          artist_name: formData.artist,
          n_recommendations: formData.num
        })
      });

      const data = await response.json();
      
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

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

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