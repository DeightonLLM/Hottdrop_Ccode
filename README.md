# HOTTDROP
## Web3 Music & Art Studio — MVP

Powered by **HD2.ai** | London • Vienna • Global

---

## QUICK START

```bash
npm install
node server.js
```

Then open: http://localhost:3000

---

## WHAT THIS DOES

Full working MVP with:

- Dark terminal-style frontend (single HTML file + CSS + JS)
- Node.js backend with 3 working API endpoints
- Web3 wallet connection via MetaMask (ethers.js v6)
- Simulated NFT mint flow with real-looking tx hashes + metadata
- Artist onboarding form with AI-style scoring and decision
- AI release pack generator (track description, NFT description, 3 social captions)
- Fully responsive — mobile, tablet, desktop

---

## FILE STRUCTURE

```
hottdrop/
  index.html        - Full single page app
  style.css         - Dark terminal aesthetic styles
  app.js            - Frontend JS (Web3, API calls, UI logic)
  server.js         - Node.js backend server
  package.json      - Dependencies (express, cors)
  README.md         - This file
  public/           - Images (copied from source)
    hero-bg.jpg
    nft-cover-1.jpg ... nft-cover-4.jpg
    gallery-1.jpg ... gallery-6.jpg
    event-london.jpg
    event-vienna.jpg
    artist-portrait.jpg
    dao-vision.jpg
    logo-white.png
    vinyl-disc.png
```

---

## API ENDPOINTS

### POST /generate-release
Generate a release pack for an artist.

Request:
```json
{
  "artist_name": "DJ Voltage",
  "track_name": "Bassline Protocol",
  "style": "Dubstep"
}
```

Response includes: track_description, nft_description, 3x social_captions

---

### POST /artist-onboard
Evaluate an artist application.

Request:
```json
{
  "name": "DJ Voltage",
  "email": "dj@example.com",
  "style": "Dubstep",
  "links": "https://soundcloud.com/example",
  "bio": "Producer from London..."
}
```

Response includes: score (0-100), decision (ACCEPT/REVIEW/RESUBMIT), message, ref_id

---

### POST /create-drop
Simulate an NFT mint.

Request:
```json
{
  "artist_name": "DJ Voltage",
  "track_name": "Bassline Protocol",
  "edition_size": 100,
  "price_eth": 0.05,
  "wallet_address": "0x..."
}
```

Response includes: tx_hash, contract_address, token_id, ipfs metadata, opensea_url

---

## WEB3

- Uses MetaMask (or any injected Ethereum provider)
- ethers.js v6 loaded via CDN
- No real transactions are made — all mints are simulated server-side
- Wallet connect required before minting

---

## DEPLOYING

For production deployment:

1. Use a platform like Railway, Render, or Heroku for the Node server
2. Set `PORT` environment variable (defaults to 3000)
3. Update `API_BASE` in `app.js` to your server URL if frontend is hosted separately
4. Replace placeholder images in `public/` with real Hottdrop images
5. Connect real AI (HD2.ai) to the endpoints for live generation

---

## TECH STACK

- Frontend: Plain HTML5 + CSS3 + Vanilla JS
- Backend: Node.js + Express
- Web3: ethers.js v6 (CDN)
- Fonts: Syne Mono + Syne (Google Fonts)
- No build step required

---

*Powered by HD2.ai — Enterprise Web3 Infrastructure*
