# Reno Chess Club Website

The public website for the Reno Chess Club, which meets at 125 West Plumb Lane, Reno, Nevada, on Thursdays from 5:30 pm to midnight.

Club volunteers edit the site in **[Pages CMS](https://pagescms.org)**, a form-based editor at [app.pagescms.org](https://app.pagescms.org). They sign in with their email address and need no GitHub account or programming knowledge. Each save is published automatically within a couple of minutes. The editors' guide is on the site itself at **`editor-help.html`**.

## How it fits together

```
Editor (app.pagescms.org)  --saves files-->  this GitHub repo  --GitHub Actions builds-->  website (GitHub Pages)
```

- **Content lives in plain files under `site/`.** Text pages, news, events, games, club info and theme are all simple Markdown, YAML or JSON files. The editor reads and writes them, and so can you.
- **[Eleventy](https://www.11ty.dev/)** turns those files into plain HTML pages in `_site/`. It runs automatically on every change (`.github/workflows/deploy.yml`).
- **Visitors get plain static HTML, CSS and JavaScript.** There's no server or database.

## Where things are

| Path | What it is | Edited in the editor as |
|---|---|---|
| `site/_data/club.json` | Club name, address, phone, hours, footer, calendar address | Club info (read-only for Admins) |
| `site/_data/theme.json` | Chosen colour scheme, font, background picture | Colors & look |
| `site/_data/schemes.js` | The approved colour schemes and fonts (developer-only) | - |
| `site/pages/*.md` | One file per page: title, optional text, buttons. `News.md` becomes `News.html`. | Pages |
| `site/news/*.md` | News posts | News |
| `site/events/*.md` | Events | Events |
| `site/_data/games/*.yml` | Games in the Game Viewer's list | Games |
| `site/images/uploads/` | Uploaded pictures, including the background | (picture fields) |
| `site/_includes/` | Page templates: `base.njk` (header, footer, theme), `page.njk` (all page types), `viewer.njk` | - |
| `site/assets/` | `css/style.css`, `css/viewer.css`, `js/viewer.js`, `js/pgn-parser.js` | - |
| `site/site-check.njk` | `site-check.html`: report of games held back and broken buttons, for editors | - |
| `site/editor-help.md` | `editor-help.html`: the editors' guide | - |
| `.pages.yml` | What the editor shows: sections, fields, labels, help text | - |
| `eleventy.config.js` | Build settings, filters, and the build-time game check | - |
| `uscf-proxy-worker.js` | Cloudflare Worker for fetching US Chess pages. Not used yet; kept for the planned US Chess integration. | - |

### Page kinds

Most pages are **menu** pages: a full-screen grid of buttons, or, if the page has text, a scrolling text box with a row of buttons underneath. A few pages are special, set by a hidden `kind:` line in their file:

| Page | `kind` | Shows |
|---|---|---|
| `Calendar` | `calendar` | The Google Calendar (address in Club info) |
| `PGN_Reader` | `viewer` | The Game Viewer; see [README PGN Viewer.md](README%20PGN%20Viewer.md) |
| `Current` | `news-current` | The newest news posts |
| `Older_Events` | `news-old` | Older news posts |
| `Current_Events` | `events-upcoming` | Upcoming events; past events hide themselves in the visitor's browser |

## Layout rules

- **Every page fits on one screen.** The page itself never scrolls; only inner boxes do (page text, news, the calendar, the move list).
- **The header shrinks on small screens.** On desktops it scales with the screen height (about 20% of it); on phones and short screens it collapses to two lines.
- **Text colours are automatic.** The build picks light or dark text for each background, whichever is more readable, so no scheme can produce unreadable text.

## One-time setup (owner)

1. **Turn on publishing.** On GitHub, open the repo, then **Settings > Pages > Build and deployment > Source: GitHub Actions**. The next push publishes the site. The address is shown on that same Settings page, normally `https://charlesachinnici-eng.github.io/Website/`. GitHub Pages on the free plan needs the repo to be public.
2. **Connect the editor.**
   1. Go to [app.pagescms.org](https://app.pagescms.org) and sign in with GitHub, using your own account.
   2. Install the Pages CMS GitHub App on this repository when asked.
   3. Open the repository. It picks up `.pages.yml` automatically.
3. **Invite editors.** In Pages CMS, add each editor's email address as a **collaborator** on this repository. They get an email invitation and sign in with that email; no GitHub account is needed.
4. Send editors the link to **`editor-help.html`** on the live site.

### Access levels

| Level | Who | Can change |
|---|---|---|
| **Super Admin** | A GitHub user with access to this repo (you) | Everything: all content, the editor configuration (`.pages.yml`), the collaborator list, and Club info |
| **Admin** | An email collaborator invited in Pages CMS (no GitHub account) | All content and pictures. **Not** the configuration, collaborators, or Club info |

Pages CMS itself provides the first two restrictions: collaborators can never edit `.pages.yml` or manage collaborators. Club info is locked by marking its fields `readonly` in `.pages.yml`. Admins see it but can't change it, and they can't unlock it because they can't edit the configuration.

To change Club info, the Super Admin edits `site/_data/club.json` on GitHub (open the file, then the pencil icon), or in VS Code. To make another person a Super Admin, add their GitHub account as a collaborator on the repo in GitHub (**Settings > Collaborators**).

Each editor's name is recorded on their changes in the repo history.

## Working on the code

```
npm install      # once
npm start        # builds and serves at http://localhost:8080, rebuilding as you save
npm run build    # one-off build into _site/
```

`_site/` and `node_modules/` are build output and are not committed.

### Adding a colour scheme

1. Add an entry in `site/_data/schemes.js`.
2. Add its key to the `scheme` list under "Colors & look" in `.pages.yml`.
3. Check readability: the build picks text colours, but keep each scheme's `strong` colour dark enough to read on its `panel` colour.

### Moving to another host or address

All links are relative, so the built site works at any address or sub-folder. To publish somewhere else:
- run `npm ci && npm run build` and upload `_site/`, or
- replace the `deploy` job in `.github/workflows/deploy.yml` with the new host's upload step (FTP, Netlify, Cloudflare Pages and so on).

The editor keeps working unchanged, because it edits this repo rather than the host.

### Conventions

- **Page file names** are the page addresses (`News.md` becomes `News.html`). They're case-sensitive on the web, and they can't be renamed from the editor, so links don't break.
- **No template code in content.** Content files are never run as template code, so editors can type anything safely.

## Known issues

- On `Contact`, the **Contact Us** button links back to the Contact page itself. It's waiting for the planned inquiry form.
- On `WSO`, **This Year's Western States Open** links to the home page until there's an event page.

## Planned

- Content for the placeholder pages
- A donation option
- Automatic listing of all the club's events from US Chess
- Notifying club officers (e.g. by text) when someone sends an inquiry
- Finding chess events near Reno automatically
