const https = require('https');
const jsdom = require('jsdom');

module.exports = class GeniusScraper {
    /** @param {Object} config { genius: { token: String }, log: Boolean } */
    constructor({genius, log}) {
        this.token = genius.token;
        this.log = log === undefined ? true : log;
    }

    getLyrics({artist, title}) {
        return new Promise((resolve, reject) => {
            this._findTrack(artist, title)
                .then(json => {
                    this._getLyrics(json, artist)
                        .then(lyrics => resolve(lyrics))
                        .catch(err => reject(err));
                })
                .catch(err => reject(err));
        });
    }

    _findTrack(artist, title) {
        this.log && console.log(`${artist} - ${title}`);

        return new Promise((resolve, reject) => {
            https.get(
                {
                    protocol: 'https:',
                    host: 'api.genius.com',
                    port: 443,
                    path: `/search?q=${encodeURIComponent(artist)}+-+${encodeURIComponent(title)}`,
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    }
                },
                conn => this._receivedSearch(resolve, reject, artist, conn)
            ).on('error', err => { reject(err); });
        });
    }

    _receivedSearch(resolve, reject, artist, conn) {
        let json = '';
        conn.on('data', chunk => { json += chunk; });
        conn.on('end', () => { resolve(JSON.parse(json)); }).on('error', err => { reject(err); });
    }

    _getLyrics(json, artist) {
        return new Promise((resolve, reject) => {
            if (!json.response || !json.response.hits || !json.response.hits.length) {
                return reject(new Error("No results found."));
            }
            const first = json.response.hits.find(({type, result}) => {
                this.log && console.log(`https://genius.com${result.path}`);
                return type === 'song' && result.primary_artist.name.toLowerCase().indexOf(artist.toLowerCase()) > -1;
            });
            if (!first) {
                return reject(new Error("Result mismatch."));
            }
            https.get(
                {
                    protocol: 'https:',
                    host: 'genius.com',
                    port: 443,
                    path: first.result.path
                },
                conn => this._receivedLyrics(resolve, reject, conn)
            );
        });
    }

    _receivedLyrics(resolve, reject, conn) {
        let html = '';
        conn.on('data', chunk => { html += chunk; });
        conn.on('end', () => { this._processLyrics(resolve, reject, html); });
    }

    _processLyrics(resolve, reject, html) {
        jsdom.env({
            html: html.replace('<lyrics', '<div').replace('</lyrics', '</div'),
            parsingMode: 'html',
            features: {
                FetchExternalResources: false,
                ProcessExternalResources: false,
                SkipExternalResources: true
            },
            done: (err, window) => {
                if (err) { reject(err); }
                resolve(window.document.getElementsByClassName('lyrics')[0].textContent.trim());
            }
        });
    }
}
