# SIG Lodges (hut.rip) — hut.rip

Static website for **hut.rip**. There is **no build step** — every file in this
repo is the site exactly as it deploys. Open `index.html` locally and it works.

Pages: `index.html` (umbrella landing linking both properties), `terms.html`, `privacy.html`.

## Deploy on Netlify (Git)
1. Create a new GitHub repo and push this folder (see below).
2. Netlify → **Add new site → Import an existing project** → pick this repo.
   - **Build command:** leave blank
   - **Publish directory:** `.` (repo root — also set in `netlify.toml`)
3. **Domain management** → add custom domain **hut.rip**; let Netlify handle SSL.

Prefer no Git? Netlify → **Sites → drag & drop this folder**.

## Push to GitHub
```bash
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```
(This folder is already a git repo with an initial commit.)

## Editing / keeping the three sites in sync
This site is generated from a single master source (the `huts` source repo +
`build.sh`) so cross-links between lost-trail-lodge.com, redmtnthelma.com and
hut.rip stay correct. For shared changes (nav, footer, styles), edit the source
and regenerate all three. Small one-off text tweaks can be made here directly.
