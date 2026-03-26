---
name: vercel-hottdrop
description: Guidelines for managing the canonical project structure and Vercel deployment for Hottdrop.
---

# Hottdrop Vercel Deployment Skill

This skill defines the mandatory project structure and deployment patterns for Hottdrop to ensure static asset resolution and API functionality on Vercel.

## 1. Canonical Project Structure
To prevent 404 errors and missing assets on Vercel, the project MUST follow this layout:

```text
/
├── index.html        # Main Entry Point (MUST be in root)
├── style.css         # Main Stylesheet (MUST be in root)
├── app.js            # Main Frontend Logic (MUST be in root)
├── api/
│   └── index.js      # Serverless API logic (Express app)
├── public/           # Static Assets ONLY (Images, Media)
│   ├── logo-white.png
│   ├── hero-bg.jpg
│   └── ...
├── tasks/            # Documentation & Lessons
└── vercel.json       # Vercel Configuration
```

## 2. Asset Referencing
- **HTML**: All image and background-image paths in `index.html` MUST be prefixed with `public/` (e.g., `<img src="public/logo-white.png">`).
- **CSS**: Relative paths in `style.css` should point to `public/` if assets are stored there.
- **Root Files**: `index.html`, `style.css`, and `app.js` must remain in the root directory to be served correctly by Vercel's zero-config default.

## 3. Server Logic (`api/index.js` vs `local-dev.js`)
- **Production**: Vercel serves the `api/` directory as serverless functions. It DOES NOT use `local-dev.js`.
- **Local Dev**: `npm run dev` uses `local-dev.js`, which serves the root directory (`__dirname`) as static files. This confirms why `index.html` must be in the root.

## 4. Anti-Patterns
- **Moving `index.html` to `public/`**: This breaks the `local-dev.js` routing and requires complex `vercel.json` rewrites that often lead to 404s for relative assets.
- **Absolute Paths**: Avoid using `/public/...` in paths unless the project is specifically configured with `public` as the root. Stick to relative `public/...` for consistency across local and production environments.
