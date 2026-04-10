# BotC Stats

A free, open-source leaderboard and analytics dashboard for [Blood on the Clocktower](https://bloodontheclocktower.com/) communities. Track your group's games, ELO ratings, win rates, and more.

**[Live Demo](https://rossfw.github.io/botc-stats/botc-web/)**

**Features:**
- ELO-based leaderboard with player rankings
- Per-player rating history charts
- Analytics dashboard: scripts, characters, players, head-to-head matchups
- Fabled and Loric modifier tracking
- Game entry with smart autocomplete for 250+ characters
- Colorblind-friendly mode
- Works on GitHub Pages (free hosting)
- Demo mode with sample data out of the box

## Quick Start (5 steps)

### 1. Use this template

Click the green **"Use this template"** button at the top of this repo (or fork it). This creates your own copy.

Your site will immediately work in **demo mode** with sample data — no setup needed to preview it.

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

### 4. Configure your site

Edit **`botc-web/js/site-config.js`** — this is the only file you need to change:

```javascript
const SITE_CONFIG = {
    supabaseUrl: 'https://your-project-id.supabase.co',
    supabaseAnonKey: 'your-anon-key-here',
    communityName: 'My BotC Group',
    minGamesForLeaderboard: 5,
};
```

Find your Supabase URL and key in: **Dashboard > Settings > API** ("Project URL" and "anon public" key).

### 5. Enable GitHub Pages

In your repo: **Settings > Pages > Source:** select `main` branch, folder `/ (root)`, and save.

Your site will be live at `https://yourusername.github.io/your-repo-name/botc-web/` within a few minutes.

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

## Configuration options

All settings are in `botc-web/js/site-config.js`:

| Setting | Default | Description |
|---------|---------|-------------|
| `supabaseUrl` | `YOUR_SUPABASE_URL` | Your Supabase project URL |
| `supabaseAnonKey` | `YOUR_SUPABASE_ANON_KEY` | Your Supabase anon public key |
| `communityName` | `Blood on the Clocktower` | Shown in the site header |
| `minGamesForLeaderboard` | `5` | Min games to appear on leaderboard |
| `defaultRating` | `1500` | Starting ELO for new players |
| `kFactor` | `32` | ELO volatility (higher = bigger swings) |

## Project structure

```
botc-web/
  index.html          # Leaderboard page
  analytics.html      # Analytics dashboard
  css/                # Stylesheets
  js/
    site-config.js    # YOUR SETTINGS (edit this!)
    supabase.js       # Database connection
    demo-data.js      # Sample data for demo mode
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
  seed-data.sql       # Sample data for Supabase (optional)
```

## License

MIT - Use it, modify it, share it. Built for the BotC community.
