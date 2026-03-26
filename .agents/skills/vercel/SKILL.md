---
name: vercel-hottdrop
description: Guidelines for managing the canonical project structure and Vercel deployment for Hottdrop.
---

# Hottdrop Vercel Deployment Skill

This skill defines the mandatory project structure and deployment patterns for Hottdrop to ensure static asset resolution and API functionality on Vercel.

## 1. Canonical Project Structure
To prevent 404 errors and missing assets on Vercel, the project MUST follow the "Public-First" static layout:

```text
/
├── api/
│   └── index.js      # Serverless API logic (Express app)
├── public/           # ALL Static Assets 
│   ├── index.html    # Main Entry Point
│   ├── style.css     # Main Stylesheet
│   ├── app.js        # Main Frontend Logic
│   ├── logo-white.png
│   ├── hero-bg.jpg
│   └── ...
├── tasks/            # Documentation & Lessons
├── local-dev.js      # Local Express server (MUST serve the public/ directory)
└── vercel.json       # Vercel Configuration (API rewrites ONLY)
```

## 2. Asset Referencing
- **HTML/CSS**: Because Vercel automatically treats the `public/` directory as the deployment root, all static assets inside `public/` should reference each other via standard relative paths without any prefix (e.g., `<img src="logo-white.png">`).
- **DO NOT** use `public/...` prefixes in `index.html`.

## 3. Server Logic (`local-dev.js`)
- **Local Dev Sync**: `local-dev.js` MUST serve the `public/` directory as its static root to mirror Vercel behavior exactly: 
  `app.use(express.static(path.join(__dirname, "public")));`
- This ensures 1:1 parity between local development (`npm run dev`) and production (Vercel).

## 4. Anti-Patterns
- **Moving `index.html` to the Root**: If you move `index.html` out of `public/`, Vercel will STILL deploy `public/` as the root, resulting in a **404 NOT FOUND** error for the entire site. Never move the entry files out of `public/`.
