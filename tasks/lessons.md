# Lessons Learned

## Vercel Deployments with Node.js and Static Assets
- **The Mistake**: Trying to use `"builds": [{ "src": "server.js", "use": "@vercel/node" }]` to deploy a monolithic Express app while leaving static files at the root. Vercel's legacy builder system ignores static files not explicitly defined in the builds array or `public` folder, breaking CSS/JS.
- **The Solution**: Avoid custom builders. Use Vercel's native zero-config routing by moving the Express backend into an `api/index.js` file and exporting the app (`module.exports = app;`). Keep static files at the root. Use `vercel.json` only for `rewrites` to route specific API endpoints back to the `/api` directory. This ensures Vercel's edge network natively serves all static assets while correctly orchestrating serverless functions.

## Robust Web3 AI Integration (The Fallback Pattern)
- **The Challenge**: Integrating LLMs (OpenAI, Gemini) and image APIs (Replicate) directly into a production app without risking downtime or crashes if keys are missing, rate limits hit, or APIs fail.
- **The Solution**: Built a strict "Fallback Pattern" where every agent endpoint attempts an API call (wrapped in a try/catch or `.catch(() => null)`) but has a perfectly formatted deterministic string-template fallback ready to go if the LLM fails. This allows the frontend to be developed and tested fully without API keys, guarantees the UI never breaks, and keeps the Node backend clean without needing external orchestration frameworks like Langchain. All backend iteration was done via an "append-only" strategy to prevent regressions on the working MVP.
