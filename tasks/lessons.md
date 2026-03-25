# Lessons Learned

## Vercel Deployments with Node.js and Static Assets
- **The Mistake**: Trying to use `"builds": [{ "src": "server.js", "use": "@vercel/node" }]` to deploy a monolithic Express app while leaving static files at the root. Vercel's legacy builder system ignores static files not explicitly defined in the builds array or `public` folder, breaking CSS/JS.
- **The Solution**: Avoid custom builders. Use Vercel's native zero-config routing by moving the Express backend into an `api/index.js` file and exporting the app (`module.exports = app;`). Keep static files at the root. Use `vercel.json` only for `rewrites` to route specific API endpoints back to the `/api` directory. This ensures Vercel's edge network natively serves all static assets while correctly orchestrating serverless functions.
