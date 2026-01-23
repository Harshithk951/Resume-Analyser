# Environment variables

Vite is configured to load env files from this `env/` folder (see `vite.config.ts`).

## Variables

- `VITE_BASE` (optional): Base path when deploying under a subpath (e.g. GitHub Pages).
  - Example: `VITE_BASE=/ResumeOptima/`
- `VITE_API_KEY` (optional / discouraged): Direct browser Gemini API key (avoid in production). Prefer the serverless proxy in `/api/gemini`.

## Local setup

Because some environments block committing/creating `.env*` files, you can set env vars in your shell when running commands:

```bash
VITE_BASE=/ResumeOptima/ npm run build
```

