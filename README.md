Scrape lyrics for a song by "Artist - Title", either straight from the command
line, or in Node.js. Currently only supports Genius lyrics.

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


// Get lyrics for a specific track (artist, title)
fetcher.getTrackLyrics('Noah', 'Chef')
  .then(lyrics => console.log(lyrics))
  .catch(err => console.error(err));


// Get lyrics for the current track active in Spotify or iTunes (macOS only)
fetcher.getCurrentTrackLyrics(['Spotify', 'iTunes'])
  .then(lyrics => console.log(lyrics))
  .catch(err => console.error(err));


// Find out the currently active track in Spotify or iTunes (macOS only)
fetcher.getCurrentTrack(['Spotify', 'iTunes'])
  .then(({ artist, title }) => console.log(artist, title))
  .catch(err => console.error(err));
```

### Configuration
The `config.json` for `bin/lyrics` and the `config` object passed to `Lyrics`
on construction are one and the same. They accept the following:

```javascript
{
    "genius": {
        "token": String // Token for api.genius.com
    },
    "log": Boolean // Whether to log debug info to console (default: true)
}
```

## OS support for current track detection
### macOS (OS X)
macOS is natively supported using AppleScript to get the current track from
Spotify or iTunes.

### Linux
In Linux, you can get the current track using D-Bus, as Spotify implements the 
Media Player Remote Interfacing Specification (MPRIS). I have not tested it,
but `mpris-service` is an available package.

### Windows
~~There isn't a an osascript or D-Bus equivalent way of getting the current track
from Spotify in Windows at the moment, as far as I know. The Spotify Web API
also does not have an endpoint to get the /current/ track, though it does have
an endpoint to fetch the last 50 played tracks -- but this does not include the
current one, nor does it include any that played for less than 30 seconds.~~

Update 2019: You can use Spotify's `/v1/me/player/currently-playing` API endpoint. https://developer.spotify.com/documentation/web-api/reference/player/get-the-users-currently-playing-track/
