# BotC Stats

A free, open-source leaderboard and analytics dashboard for [Blood on the Clocktower](https://bloodontheclocktower.com/) communities. Track your group's games, ELO ratings, win rates, and more.

**Features:**
- ELO-based leaderboard with player rankings
- Per-player rating history charts
- Analytics dashboard: scripts, characters, players, head-to-head matchups
- Fabled and Loric modifier tracking
- Game entry with smart autocomplete for 250+ characters
- Colorblind-friendly mode
- Works on GitHub Pages (free hosting)

## Quick Start (5 steps)

### 1. Use this template

Click the green **"Use this template"** button at the top of this repo (or fork it). This creates your own copy.

### 2. Create a free Supabase project

Go to [supabase.com](https://supabase.com) and create a free account and project. The free tier is more than enough.

### 3. Set up the database

In your Supabase dashboard:
1. Go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Paste the contents of [`setup/schema.sql`](setup/schema.sql)
4. Click **Run**

This creates all the tables, security policies, and access codes.

**Important:** Edit the access codes in `schema.sql` before running, or update them in **Table Editor > access_codes** after. These are the passwords your group uses to log games:
- `submit` level: can add new games (share with your group)
- `edit` level: can add AND edit games (keep this private)

### 4. Connect your site to Supabase

In your repo, edit `botc-web/js/supabase.js` and replace the placeholder values:

```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

Find these in your Supabase dashboard: **Settings > API** (under "Project URL" and "anon public" key).

### 5. Enable GitHub Pages

In your repo: **Settings > Pages > Source:** select `main` branch, folder `/ (root)`, and save.

Your site will be live at `https://yourusername.github.io/botc-stats/botc-web/` within a few minutes.

## Optional: Load demo data

To see the site in action with sample data before logging your own games:

1. Go to **SQL Editor** in Supabase
2. Paste the contents of [`setup/seed-data.sql`](setup/seed-data.sql)
3. Click **Run**

This loads 25 sample games with fake players. Delete them when you're ready to start tracking real games:
```sql
DELETE FROM games;
```

## How to log games

1. Click **"Add Game"** on the leaderboard page
2. Enter the access code your group admin set up
3. Enter players in each team (one per line): `Name Role`
4. Select which team is Evil, who won, and the script
5. Optionally add any Fabled or Lorics that were in play
6. Submit

**Input format:**
- Basic: `Sarah_Lin Imp`
- Multiple roles: `Tom_Nguyen Snake_Charmer+Witch`
- Team change: `Mike_Chen Chef Good->Evil` (put in their FINAL team)

## Project structure

```
botc-web/
  index.html          # Leaderboard page
  analytics.html      # Analytics dashboard
  css/                # Stylesheets
  js/
    supabase.js       # Database connection (edit this)
    app.js            # Leaderboard logic
    elo.js            # ELO rating engine
    gameEntry.js      # Game submission form
    analytics.js      # Stats computation
    analyticsApp.js   # Analytics page controller
    autocomplete.js   # Smart input suggestions
    config.js         # Character & script definitions
    settings.js       # Colorblind mode
setup/
  schema.sql          # Database setup (run first)
  seed-data.sql       # Sample data (optional)
```

## License

MIT - Use it, modify it, share it. Built for the BotC community.
