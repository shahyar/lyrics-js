const osascript = require('node-osascript');
const GeniusScraper = require('./scrapers/genius.js');

module.exports = class Lyrics {
    /** @param {Object} config { genius: { token: String }, log: Boolean } */
    constructor(config) {
        this.config = config;
    }

    /** @param {Array} apps ['Spotify', 'iTunes'] */
    getCurrentTrackLyrics(apps) {
        return new Promise((resolve, reject) => {
            this.getCurrentTrack(apps)
                .then(track => {
                    new GeniusScraper(this.config).getLyrics(track)
                        .then(lyrics => resolve(lyrics))
                        .catch(err => reject(err));
                })
                .catch(err => reject(err));
        });
    }

    /** @param {Object} track */
    getTrackLyrics({ artist, title }) {
        return new Promise((resolve, reject) => {
            new GeniusScraper(this.config).getLyrics({ artist, title })
                .then(lyrics => resolve(lyrics))
                .catch(err => reject(err));
        });
    }

    /** @param {Array} apps ['Spotify', 'iTunes'] */
    getCurrentTrack(apps) {
        return new Promise((resolve, reject) => {
            const app = apps.shift();
            osascript.execute(`tell application "${app}" to artist of current track`, (err, artist) => {
                if (err) {
                    if (apps.length) {
                        this.getCurrentTrack(apps)
                            .then(track => resolve(track))
                            .catch(err => reject(err));
                    } else {
                        reject(new Error("Artist not found. Is Spotify or iTunes running?"));
                    }
                } else {
                    osascript.execute(`tell application "${app}" to name of current track`, (err, title) => {
                        if (err) { reject(err); }
                        else { resolve({artist, title}); }
                    });
                }
            });
        });
    }
}