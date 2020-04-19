import "./styles.css";
import axios from 'axios';

const urlBase = "https://api.spotify.com/v1/";
const userId = 1296272060;
const token = "BQAoTdO3gugR7Uy6qbTIAMnhHiuv2GXO-VmfjERHRGMuLQaVbx1gCmCFaxp_xuiHpySE0GmAQHLB9uyP-bQwIYP5JC5dbal0rWRVZTV389mWn4kXgw3UGq1US31PAV4KhihliAzHsWy7qjETQrwz4yjZeKZ06tQVlqHfgMEHdG1ahaNdk7Bu3dsLEUl9FPG1jjvKTNRe1ldIxTcHpC9w2mP1fCRWhXqozREMvYYJdObUWQ8nm4h4UovTC975g1W84F65Zczn95w_PQ";

const userProfile = `users/${userId}`;
const userPlaylists = `users/${userId}/playlists?offset=45&limit=2`;
const userPlaylistsTracks = `users/${userId}/playlists/{playlist_id}/tracks`;
const searchArtist = `search?query={artist}&type=artist&offset=0&limit=20`;


axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;


// GET USER PROFILE
function getUserProfile() {
  axios.get(`${urlBase}${userProfile}`)
    .then(r => console.log(r.data))
    .catch(e => console.log(e))
}

function handleError(e, where) {
  if (e.response.data) {
    console.log(e.response.data.error.status, e.response.data.error.message, where)
  } else {
    console.log(e.message, 'e');
  }
}

// GET USER GENRES
async function getGenres(songs) {
  let genres = [];
  let artists = songs.map(song => song.track.artists[0].name)

  for (let artistName of artists) {
    artistName = artistName.toLowerCase();

    try {
      let result = await axios.get(`${urlBase}${searchArtist.replace('{artist}', artistName)}`)
      
      if (result.data.artists.items.length > 0) {
        const artistGenres = result.data.artists.items.filter(artist => artist.name.toLowerCase() === artistName);
        
        if (artistGenres.length > 0) {
          genres.push(...artistGenres[0].genres);
        }
      }
    } catch(e) {
      handleError(e, 'on getGenres')
    }
  }

  const cleanGenres = [...new Set(genres)];
  console.log(cleanGenres, cleanGenres.length, 'genres');
}

async function getSongs(playlists) {
  let songs = [];
  let playlistIds = playlists.map(playlist => playlist.id);

  for (const playlistId of playlistIds) {
    try {
      const result = await axios.get(`${urlBase}${userPlaylistsTracks.replace('{playlist_id}', playlistId)}`)
      const playlistSongs = result.data.items;
      songs.push(...playlistSongs);
    } catch(e) {
      handleError(e, 'on getSongs')
    }
  }

  getGenres(songs)
}

async function getPlaylists() {
  try {
    const result = await axios.get(`${urlBase}${userPlaylists}`)
    const playlists = result.data.items;
    getSongs(playlists)
  } catch(e) {
    handleError(e, 'on getPlaylists')
  }
}

getPlaylists();
