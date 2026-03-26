# Lessons Learned

## Vercel Deployments with Node.js and Static Assets
- **The Mistake**: Trying to use `"builds": [{ "src": "server.js", "use": "@vercel/node" }]` to deploy a monolithic Express app while leaving static files at the root. Vercel's legacy builder system ignores static files not explicitly defined in the builds array or `public` folder, breaking CSS/JS.
- **The Solution**: Avoid custom builders. Use Vercel's native zero-config routing by moving the Express backend into an `api/index.js` file and exporting the app (`module.exports = app;`). Keep static files at the root. Use `vercel.json` only for `rewrites` to route specific API endpoints back to the `/api` directory. This ensures Vercel's edge network natively serves all static assets while correctly orchestrating serverless functions.

## Robust Web3 AI Integration (The Fallback Pattern)
- **The Challenge**: Integrating LLMs (OpenAI, Gemini) and image APIs (Replicate) directly into a production app without risking downtime or crashes if keys are missing, rate limits hit, or APIs fail.
- **The Solution**: Built a strict "Fallback Pattern" where every agent endpoint attempts an API call (wrapped in a try/catch or `.catch(() => null)`) but has a perfectly formatted deterministic string-template fallback ready to go if the LLM fails. This allows the frontend to be developed and tested fully without API keys, guarantees the UI never breaks, and keeps the Node backend clean without needing external orchestration frameworks like Langchain. All backend iteration was done via an "append-only" strategy to prevent regressions on the working MVP.

## Hottdrop Branding and Logo Integrity (Prestige-First Design)
- **The Challenge**: Using generic or incorrect logos in a high-prestige Web3 project, which dilutes brand identity.
- **The Solution**: Always use the official "HØTT DRØP" stacked logo (represented as a white PNG for dark-mode premium feel). Crucially, the logo must only be placed in high-impact, strategic locations (Navigation Header and Footer) rather than being scattered across the UI. This "minimalist-premium" approach maintains the project's prestige by avoiding UI clutter and emphasizing quality over quantity. CSS constraints for the logo should ensure its unique stacked vertical layout remains legible without dominating the screen space.

## Canonical Project Structure (Vercel & Local Sync)
- **The Challenge**: Misalignment between local development (using `local-dev.js`) and Vercel serverless deployment (using `api/index.js`) leads to 404s for static assets and missing logos.
- **The Solution**: Maintain a strict "Root-First" architecture for active static files:
  - `index.html`, `style.css`, and `app.js` MUST reside at the project root.
  - All images and media assets MUST reside in the `public/` directory.
  - All HTML/CSS references to assets MUST use the `public/` prefix (e.g., `src="public/logo-white.png"`).
  - This structure ensures zero-config compatibility with Vercel's edge network while remaining perfectly served by the local Express middleware in `local-dev.js`.
