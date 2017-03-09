Uses `osascript` on macOS to find out the track currently playing in Spotify.
Then, finds the first result on Genius by "Artist - Title", and outputs the first result.

## Usage
### Binary Use
Get an API token for `api.genius.com`, and then put it in `config.json` as
`{ "genius": { "token": "foobar" } }`.

Then, run `./bin/lyrics`.

### Library Use
```javascript
const Lyrics = require('lyrics');

const fetcher = new Lyrics({
    genius: {
        token: 'foobar'
    }
});

// Get the lyrics for the current track active in Spotify or iTunes
fetcher.getCurrentTrackLyrics(['Spotify', 'iTunes'])
  .then(lyrics => console.log(lyrics))
  .catch(err => console.error(err));

// Get lyrics for a specific track
fetcher.getTrackLyrics('Noah', 'Chef')
  .then(lyrics => console.log(lyrics))
  .catch(err => console.error(err));

// Find out the currently active track in Spotify or iTunes
fetcher.getCurrentTrack(['Spotify', 'iTunes'])
  .then(({ artist, title }) => console.log(artist, title))
  .catch(err => console.error(err));
```
