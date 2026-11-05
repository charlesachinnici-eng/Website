# PGN Game Viewer

The Game Viewer (`PGN_Reader.html` on the site) plays through chess games in PGN format, shows variations and annotations, and can analyse any position with the Stockfish engine. Everything runs in the visitor's browser.

The games in its list are managed in the site editor under **Games (Game Viewer)**; see the main [README](README.md).

## Using the viewer

**Load a game** in one of two ways:
- Pick a game from **Select a game**. The list comes from `site/_data/games/` (edited in the editor). It currently holds:
  - Kasparov vs Topalov, 1999 (Wijk aan Zee)
  - Fischer vs Spassky, 1972 (World Championship, Game 6)
  - Morphy vs Duke of Brunswick, 1858 (the Opera Game)
  - Club Qualifier, 2026 (Reno Chess Club), an annotated club game
- Paste PGN into the text box and press **Load Game**. **Clear** empties the box and the board.

**Move through the game:**
- **⏮ Start / ◀ Previous / Next ▶ / End ⏭**
- Click any move in the move list to jump straight to it. Variations are shown indented and in italics, and you can click them too.
- **🔄 Flip Board** shows the position from Black's side.

**Keyboard shortcuts:**

| Key | Action |
|---|---|
| ← | Previous move |
| → | Next move |
| Home | Start of game |
| End | End of game |

Shortcuts are ignored while you're typing in the PGN box or using the game list.

**Engine analysis:** press **🔍 Analysis** to start Stockfish on the current position, and press it again to stop. The panel under the board shows:
- the evaluation, in pawns or as "mates in N"
- the best move, in engine notation (e.g. `g1f3` means the piece on g1 moves to f3)
- the search depth reached (analysis runs up to depth 45)

The analysis follows you as you step through the game.

### On phones

The page always fits on one screen. On narrow screens (968 px wide or less), **Board** and **Game & Moves** tabs switch between the board and the game picker, paste box and move list. Loading a game switches back to the Board tab automatically.

## Supported PGN

| Feature | Example |
|---|---|
| Header tags (read but not displayed as moves) | `[White "Paul Morphy"]` |
| Move numbers, including Black's | `12.` `12...` |
| Standard algebraic moves, checks, mates, promotions | `Nf3` `exd5+` `Qxf7#` `e8=Q` |
| Castling, with letters or zeros | `O-O` `O-O-O` `0-0` |
| Comments in braces | `{An interesting idea}` |
| Comments to end of line | `; also playable` |
| Variations, including nested ones | `(12. Rc1 Ba6 (12... Nb6))` |
| Numeric annotation glyphs | `$1` `$6` |
| Symbol annotations | `!` `?` `!!` `??` `!?` `?!` |
| Results | `1-0` `0-1` `1/2-1/2` `*` |

Unrecognised characters are skipped, so stray punctuation in a pasted game doesn't break the load.

If a move is illegal or mistyped, the viewer says exactly where:
- **In the main line:** "The game stops at 23... Qxe7: that isn't a legal move there…". The game loads up to that point.
- **In a side line:** the message says so, and the rest of the game loads normally.
- **Text that isn't a game:** a message says so instead of silently clearing the box.

## Running it locally

Run `npm start` in the project folder, then open http://localhost:8080/PGN_Reader.html. It rebuilds as you save. Use a web server rather than opening a file directly: Stockfish runs as a Web Worker, which browsers don't allow from `file://` pages.

## How it works

- **Files:**
  - `site/_includes/viewer.njk` is the page markup.
  - `site/assets/css/viewer.css` holds the styles.
  - `site/assets/js/viewer.js` is the viewer logic.
  - `site/assets/js/pgn-parser.js` is the parser, which the viewer and the site build share.
- **Parsing:** `parsePGNMoves()` strips the header tags. `tokenizePGN()` splits the movetext into tokens (moves, comments, variations, annotations, results). `buildGameTree()` builds a tree of `GameNode`s: the main line is each node's first child, and variations hang off `variations`. Each node stores its position as a FEN. Illegal moves are collected in `root.errors` with a label like `23... Qxe7`.
- **Games list:** at build time, `eleventy.config.js` runs every game in `site/_data/games/` through the same parser. Only games that read without errors are written into the page (as `GAME_DATABASE`). Any held back are listed on `site-check.html` with the exact move, so a typo in the editor can never break the viewer.
- **Move legality:** checked by [chess.js](https://github.com/jhlywa/chess.js) 0.10.3.
- **Board:** a CSS grid of 64 squares using Unicode chess pieces. It sizes itself to the largest square that fits the available space (CSS container queries). Squares are locked to exactly 1/8 of the board, so a large piece glyph can't stretch a row or column.
- **Engine:** [stockfish.js](https://github.com/nmrugg/stockfish.js) 10.0.2, loaded as a Web Worker and driven over the UCI protocol.

### Dependencies (both from cdnjs, nothing to install)

- `chess.js` 0.10.3: https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js
- `stockfish.js` 10.0.2: https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js

The `stockfish-windows-x86-64` folder in the project is a desktop build of the engine. The web page doesn't use it, and it's excluded from git by `.gitignore`.

## Customising

- **Square colours:** set by the site's colour scheme (`boardLight` / `boardDark` in `site/_data/schemes.js`). Editors switch schemes under **Colors & look**.
- **Piece size:** the `font-size` in the `.square` rule of `viewer.css`, currently `calc(min(100cqw, 100cqh) * 0.0775)`. Raise `0.0775` for bigger pieces. Non-pawn pieces are drawn 12% larger than pawns (`1.12em`).
- **Games list:** in the editor under **Games (Game Viewer)**, or as files in `site/_data/games/` (`name`, `order`, `pgn`).

## Known limitations

- **Games must start from the standard position.** `[FEN "..."]` / `[SetUp "1"]` headers are ignored.
- **One game at a time.** If you paste a file containing several games, the first game loads and the later ones are mostly discarded as illegal moves. Paste games one at a time.
- **Best move is shown in engine notation** (e.g. `e2e4`), not as `e4`.

## Change log

- **Nov 2026 (site editor)**
  - Games list moved into the site editor, with a build-time check.
  - Clear messages for illegal moves instead of silent resets. The old pre-check (`isValidPGN`) rejected valid games with nested variations or `;` comments.
  - The game-details box is compacted so the move list keeps its room on laptops.
  - Colours now follow the site theme.
- **Nov 2026**
  - Fixed a hang: a PGN ending in `*`, or containing `!`/`?` annotations or a `1/2-1/2` result, sent the parser into an infinite loop that froze and then reset the page.
  - Added `;` comments and zero-castling.
  - Locked square sizes and reduced the piece size.
  - One-screen layout, with Board / Game tabs on phones.
  - Keyboard shortcuts no longer fire while typing in the PGN box.
- **Feb 2026**
  - Removed the highlight on the moved piece.
