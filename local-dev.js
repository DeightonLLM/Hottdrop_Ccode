const app = require("./api/index");
const express = require("express");
const path = require("path");

const PORT = process.env.PORT || 3000;

// Serve static files from the root directory
// This is needed for local development as Vercel handles static files automatically
// We add this BEFORE any other routes are called (though api/index already defined some)
app.use(express.static(path.join(__dirname, "public")));

// Fallback for SPA routing if needed
app.get("*", (req, res, next) => {
  // If it's one of our API endpoints, let it pass through
  const apiRoutes = ["/generate-release", "/artist-onboard", "/create-drop", "/dao-agent", "/revenue-agent", "/generate-artwork"];
  if (apiRoutes.includes(req.path)) {
    return next();
  }
  res.sendFile(path.join(__dirname, "index.html"));
});

// Start the server if it's not already listening (e.g. by api/index.js)
if (!app.listening) {
  try {
    app.listen(PORT, () => {
      console.log(`\n  🚀 Hottdrop local server running at: http://localhost:${PORT}`);
      console.log(`  📂 Serving static files from: ${__dirname}`);
      console.log(`  ⚡️ API endpoints active\n`);
    });
  } catch (err) {
    if (err.code !== "EADDRINUSE") {
      console.error("Error starting server:", err);
    }
  }
}

