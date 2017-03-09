#!/usr/bin/env node

const https = require('https');
const jsdom = require('jsdom');
const osascript = require('node-osascript');

module.exports = class Lyrics {
    constructor(config) {
        this.config = config;
    }

    getCurrentTrackLyrics() {
        return new Promise((resolve, reject) => {
            this.getCurrentTrack(['Spotify', 'iTunes'])
                .then(track => {
                    const fetcher = new GeniusLyrics(this.config);
                    fetcher.getLyrics(track)
                        .then(lyrics => resolve(lyrics))
                        .catch(err => reject(err));
                })
                .catch(err => reject(err));
        });
    }

    getTrackLyrics({ artist, title }) {
        return new Promise((resolve, reject) => {
            const fetcher = new GeniusLyrics(this.config);
            fetcher.getLyrics(track)
                .then(lyrics => resolve(lyrics))
                .catch(err => reject(err));
        });
    }

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
                        reject(new Error("Is Spotify or iTunes open?"));
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

class GeniusLyrics {
    constructor({token, log}) {
        this.token = token;
        this.log = log || true;
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
            const first = json.response.hits.find(({type, result}) => {
                this.log && console.log(`https://genius.com${result.path}`);
                return type === 'song' && result.primary_artist.name.toLowerCase().indexOf(artist.toLowerCase()) > -1;
            });
            if (!first) {
                return reject(new Error("Result mismatch!"));
            }
            https.get(
                {
                    protocol: 'https:',
                    host: 'genius.com',
                    port: 443,
                    path: first.result.path,
                    headers: {
                        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                        'Accept-Encoding': 'sdch, br',
                        'Accept-Language': 'en-US,en;q=0.8',
                        'Cache-Control': 'no-cache',
                        DNT: '1',
                        Host: 'genius.com',
                        Pragma: 'no-cache',
                        Referer: 'https://www.google.com/',
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
                    }
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
