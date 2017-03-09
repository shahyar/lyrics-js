Scrape lyrics for a song by "Artist - Title", either straight from the command
line, or in Node.js.

## Usage
### Binary Use (macOS)
Get an API token for `api.genius.com`, and then put it in `config.json` as
`{ "genius": { "token": "foobar" } }`.

Then, run `./bin/lyrics`. This only works on macOS, as it uses AppleScript to
find out the active track.

### Library Use
```javascript
const Lyrics = require('lyrics');

const fetcher = new Lyrics({
    genius: {
        token: 'foobar'
    }
});


// Get lyrics for a specific track
fetcher.getTrackLyrics('Noah', 'Chef')
  .then(lyrics => console.log(lyrics))
  .catch(err => console.error(err));


// Get lyric. for the current track active in Spotify or aTunes (macOS only)
fetcher.getCurrentTrackLyrics(['Spotify', 'iTunes'])
  .then(lyrics => console.log(lyrics))
  .catch(err => console.error(err));


// Find out the currently active track in Spotify or iTunes (macOS only)
fetcher.getCurrentTrack(['Spotify', 'iTunes'])
  .then(({ artist, title }) => console.log(artist, title))
  .catch(err => console.error(err));
```
