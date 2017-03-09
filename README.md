Uses `osascript` on macOS to find out the track currently playing in Spotify.
Then, finds the first result on Genius by "Artist - Title", and outputs the first result.

## Usage
Get an API token for `api.genius.com`, and then put it in `config.json` as
`{ "token": "foobar" }`.

Then, run `./bin/lyrics`.
