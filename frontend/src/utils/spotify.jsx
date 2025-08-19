const getSpotifyToken = async () => {
  //this takes the spotify credentials
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

  //this gets the access token which is needed for Spotify API requests
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      //credential encoding
      'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  return data.access_token;
};

//we get artist name and song name from here
const searchTrack = async (token, trackName, artistName) => {
  //this is a search query for the api
  const query = `${trackName} artist:${artistName}`;
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  const data = await response.json();
  //this returns the track if founf
  return data.tracks?.items[0] || null;
};

export { getSpotifyToken, searchTrack };