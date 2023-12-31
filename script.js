const clientId = 'c2c4e5b72df744d2ba27a63accce5085';
const clientSecret = 'fb04a236b3994d39bf9918f936991e7e';
let accessToken = '';

function getToken() {
    return fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
        body: 'grant_type=client_credentials'
    })
        .then(response => response.json())
        .then(data => {
            accessToken = data.access_token;
        })
        .catch(error => console.error('Error:', error));
}

document.addEventListener('DOMContentLoaded', function () {
    getToken().then(() => {
        loadGenresAndTracks();
    });
});

function loadGenresAndTracks() {
    getGenres().then(() => {
        getTopTracks();
    });
}

function getGenres() {
    return fetch('https://api.spotify.com/v1/browse/categories?limit=50', {
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    })
        .then(response => response.json())
        .then(data => {
            const genreSelect = document.getElementById('genreSelect');
            genreSelect.innerHTML = '';

            data.categories.items.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                genreSelect.appendChild(option);
            });
        });
}

let audioPlayer = new Audio(); // Global variable to control audio playback

function playTrack(trackUrl) {
    if (audioPlayer.src === trackUrl && !audioPlayer.paused) {
        // If the same track is playing, pause it
        audioPlayer.pause();
    } else {
        // Stop any currently playing track and play the selected track
        audioPlayer.pause();
        audioPlayer = new Audio(trackUrl);
        audioPlayer.play();
    }
}

function getTopTracks() {
    const selectedGenre = document.getElementById('genreSelect').value;

    fetch(`https://api.spotify.com/v1/browse/categories/${selectedGenre}/playlists?limit=1`, {
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    })
        .then(response => response.json())
        .then(data => {
            const playlistId = data.playlists.items[0].id;

            fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=20`, {
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                }
            })
                .then(response => response.json())
                .then(data => {
                    const tracksList = document.getElementById('tracksList');
                    tracksList.innerHTML = '';

                    data.items.forEach(track => {
                        const trackName = track.track.name;
                        const trackImage = track.track.album.images[0].url;
                        const trackUrl = track.track.preview_url;
                        const artistName = track.track.artists.map(artist => artist.name).join(', '); // Join multiple artists if present



                        const trackElement = document.createElement('div');
                        trackElement.classList.add('track');

                        const imageElement = document.createElement('img');
                        imageElement.src = trackImage;
                        trackElement.appendChild(imageElement);

                        const playButton = document.createElement('button');
                        playButton.textContent = 'Play';
                        playButton.onclick = () => playTrack(trackUrl);
                        trackElement.appendChild(playButton);

                        const trackInfo = document.createElement('div');

                        const artistTitle = document.createElement('p');
                        const artistBold = document.createElement('strong');
                        artistBold.textContent = artistName;
                        artistTitle.appendChild(artistBold);
                        trackInfo.appendChild(artistTitle);

                        const trackTitle = document.createElement('p');
                        trackTitle.textContent = trackName;
                        trackInfo.appendChild(trackTitle);

                        trackElement.appendChild(trackInfo);
                        tracksList.appendChild(trackElement);

                    });
                });
        });
}



document.addEventListener('DOMContentLoaded', function () {
    getToken().then(() => {
        loadGenresAndTracks();
        loadArtistSuggestions();
    });
    // Event listener for artist search button
    document.getElementById('searchButton').addEventListener('click', function () {
        searchByArtist();
    });

    function loadArtistSuggestions() {
        // Fetch a list of artists to populate the autocomplete suggestions
        fetch('https://api.spotify.com/v1/search?q=a&type=artist&limit=10', {
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        })
            .then(response => response.json())
            .then(data => {
                const artistInput = document.getElementById('artistSearch');
                const datalist = document.getElementById('artists');

                datalist.innerHTML = '';
                data.artists.items.forEach(artist => {
                    const option = document.createElement('option');
                    option.value = artist.name;
                    datalist.appendChild(option);
                });
            });
    }

    function searchByArtist() {
        const artistName = document.getElementById('artistSearch').value;
    
        fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`, {
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        })
            .then(response => response.json())
            .then(data => {
                const artistId = data.artists.items[0].id;
    
                fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?country=US`, {
                    headers: {
                        'Authorization': 'Bearer ' + accessToken
                    }
                })
                    .then(response => response.json())
                    .then(data => {
                        const tracksList = document.getElementById('tracksList');
                        tracksList.innerHTML = '';
    
                        data.tracks.forEach(track => {
                            const trackName = track.name;
                            const trackImage = track.album.images[0].url;
                            const trackUrl = track.preview_url;
                            const artistName = track.artists.map(artist => artist.name).join(', ');
    
                            const trackElement = document.createElement('div');
                            trackElement.classList.add('track');
    
                            const imageElement = document.createElement('img');
                            imageElement.src = trackImage;
                            trackElement.appendChild(imageElement);
    
                            const playButton = document.createElement('button');
                            playButton.textContent = 'Play';
                            playButton.onclick = () => playTrack(trackUrl);
                            trackElement.appendChild(playButton);
    
                            const trackInfo = document.createElement('div');
    
                            const artistTitle = document.createElement('p');
                            const artistBold = document.createElement('strong');
                            artistBold.textContent = artistName;
                            artistTitle.appendChild(artistBold);
                            trackInfo.appendChild(artistTitle);
    
                            const trackTitle = document.createElement('p');
                            trackTitle.textContent = trackName;
                            trackInfo.appendChild(trackTitle);
    
                            trackElement.appendChild(trackInfo);
                            tracksList.appendChild(trackElement);
                        });
                    });
            });
    }
});


