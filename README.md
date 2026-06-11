# Seagull-as-a-Service 🐦

A tiny Express API that returns a random seagull noise. Inspired by [no-as-a-service](https://github.com/hotheadhacker/no-as-a-service), but with 100% more screaming.

## Run it

```bash
npm install
npm start
```

Requires Node 18+. The server listens on port 3000 by default; set the `PORT` environment variable to change it.

## API

### `GET /seagull`

Returns a random seagull noise.

```bash
curl http://localhost:3000/seagull
```

```json
{ "noise": "SKRAAAA!" }
```

Want plain text instead? Use `?format=text` or send `Accept: text/plain`:

```bash
curl "http://localhost:3000/seagull?format=text"
# SKREEEEE!
```

### Errors

| Status | Meaning                                            |
| ------ | -------------------------------------------------- |
| 404    | Unknown path. `Kyow?`                               |
| 405    | Non-GET method. The seagull only responds to GET.   |
| 429    | Rate limited — 120 requests/min per IP.             |

## Add your own noises

Edit `seagull_noises.json` — it's just an array of strings. Restart the server and the new noises join the flock.

## Deploying

Runs anywhere Node runs (Render, Railway, Fly.io, a Raspberry Pi near the harbor). It respects the `PORT` environment variable, and the rate limiter reads `X-Forwarded-For` so it works behind a reverse proxy.
