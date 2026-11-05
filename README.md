# Reno Chess Club Website

The public website for the Reno Chess Club, which meets at 125 West Plumb Lane, Reno, Nevada, on Thursdays from 5:30 pm to midnight.

It's a plain static site: HTML pages, one shared stylesheet, and a little JavaScript. There's no build step and nothing to install, and it runs on any static host, such as GitHub Pages.

## Pages

| Page | What it is |
|---|---|
| `index.html` | Home: navigation buttons to every section |
| `News.html` | News hub: current news, results at US Chess, old news, history, Western States Open, Larry Evans Memorial |
| `Events.html` | Events hub: current club events, Quads, Challenge Ladder, Bundesliga, nearby events, "What's Your Event?" |
| `Calendar.html` | Embedded Google Calendar (agenda view) |
| `About.html` | About hub: FAQ, members, champions, Chess Caravan, history, club charter |
| `Contact.html` | Contact hub: US Chess membership, Chess Caravan, New to Chess |
| `LEM.html` | Larry Evans Memorial Open: links to the US Chess event pages |
| `WSO.html` | Western States Open: links to the US Chess event pages |
| `PGN_Reader.html` | Game viewer with Stockfish analysis; see [README PGN Viewer.md](README%20PGN%20Viewer.md) |

These pages are still placeholders with navigation only:
- `Bundesliga`
- `Challenge_Ladder`
- `Champions`
- `Charter`
- `Chess_Caravan`
- `Current`
- `Current_Events`
- `FAQ`
- `History`
- `Members`
- `Nearby_Events`
- `New_to_Chess`
- `Older_Events`
- `Quads`
- `Whats_Your_Event`

## Layout

Every page fits on one screen and the page itself never scrolls, on desktops and phones alike.
- The body is exactly the visible screen height (`100dvh`, which excludes the phone's address bar), laid out as header, content, footer.
- **Button pages** use a grid that fills whatever space is left, so 4-, 6- and 8-button pages all fill the screen.
- **Header:** on desktops and laptops it scales with the screen height, taking about 20% of it. On phones and other short screens it collapses to two lines: street · city, then phone · hours.
- **Calendar and Game Viewer:** where content can't fit, only an inner box scrolls (the calendar frame, the move list), never the page.

Shared styles live in `style.css`. Colours and other settings are CSS variables in `:root`. The two pages with their own `<style>` blocks are `Calendar.html` and `PGN_Reader.html`.

## Working on the site

1. Open the folder in VS Code and install the recommended **Live Server** extension when prompted (`.vscode/extensions.json`).
2. Right-click any page and choose **Open with Live Server**. Use Live Server rather than opening files directly, because the Game Viewer's engine needs a real `http://` address.
3. Commit and push with git. The repository is `github.com/charlesachinnici-eng/Website`.

### Conventions

- **Case-sensitive file names.** Windows doesn't care about capitalisation in file names, but web hosts do: a link to `New_to_Chess.html` won't find `New_to_chess.html`. Match link capitalisation exactly.
- **No spaces in page file names.** Use underscores.
- **Each page's `<footer>` goes inside `<body>`.** The one-screen layout depends on it.

## Other files

| File | Purpose |
|---|---|
| `style.css` | Shared styles for every page |
| `Background_image.jpg` | Site background |
| `uscf-proxy-worker.js` | Cloudflare Worker that proxies US Chess pages around browser CORS limits. Not currently used by any page; kept for the planned US Chess integration. |
| `stockfish-windows-x86-64/` | Desktop Stockfish build. The site doesn't use it, and it's excluded from git. |

## Known issues

- On `About.html`, the button labelled **Calendar** links to `Champions.html`.
- On `Contact.html`, **Contact Us** links back to the Contact page itself.
- On `WSO.html`, **This Year's Western States Open** links to the home page.

## Planned

- Content for the placeholder pages and more functionality on others
- A donation option
- Automatic listing of all the club's events from US Chess
- Notifying club officers (e.g. by text) when someone sends an inquiry
- Finding chess events near Reno automatically
