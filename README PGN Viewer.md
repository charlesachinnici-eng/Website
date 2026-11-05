# PGN Game Viewer

`PGN_Reader.html` is the Reno Chess Club's game viewer. It plays through chess games in PGN format, shows variations and annotations, and can analyse any position with the Stockfish engine. Everything runs in the browser, and the page is a single self-contained file plus the shared `style.css`.

## Using the viewer

**Load a game** in one of two ways:
- Pick one of the built-in games from **Select a game**:
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

## Running it locally

Use a local web server rather than opening the file directly. Stockfish runs as a Web Worker, and browsers don't allow that from `file://` pages. In VS Code, install the **Live Server** extension (the workspace recommends it), then right-click `PGN_Reader.html` and choose **Open with Live Server**.

## How it works

- **Parsing:** `parsePGNMoves()` strips the header tags. `tokenizePGN()` splits the movetext into tokens (moves, comments, variations, annotations, results). `buildGameTree()` builds a tree of `GameNode`s: the main line is each node's first child, and variations hang off `variations`. Each node stores its position as a FEN.
- **Move legality:** checked by [chess.js](https://github.com/jhlywa/chess.js) 0.10.3.
- **Board:** a CSS grid of 64 squares using Unicode chess pieces. It sizes itself to the largest square that fits the available space (CSS container queries). Squares are locked to exactly 1/8 of the board, so a large piece glyph can't stretch a row or column.
- **Engine:** [stockfish.js](https://github.com/nmrugg/stockfish.js) 10.0.2, loaded as a Web Worker and driven over the UCI protocol.

### Dependencies (both from cdnjs, nothing to install)

- `chess.js` 0.10.3: https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js
- `stockfish.js` 10.0.2: https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js

The `stockfish-windows-x86-64` folder in the project is a desktop build of the engine. The web page doesn't use it, and it's excluded from git by `.gitignore`.

## Customising

- **Square colours:** `.square.light` (`#ccb89a`) and `.square.dark` (`#9a7454`) in the page's `<style>` block.
- **Piece size:** the `font-size` in the `.square` rule, currently `calc(min(100cqw, 100cqh) * 0.0775)`. Raise `0.0775` for bigger pieces. Non-pawn pieces are drawn 12% larger than pawns (`1.12em`).
- **Sample games:** the game list in the page's script. Each entry has a `name` and a `pgn`.

## Known limitations

- **Illegal moves are dropped silently.** If a pasted PGN contains an illegal or mistyped move, that move and everything after it in that line are skipped. The game just ends early, with no error message, and the browser console names the bad move.
- **Games must start from the standard position.** `[FEN "..."]` / `[SetUp "1"]` headers are ignored.
- **One game at a time.** If you paste a file containing several games, the first game loads and the later ones are mostly discarded as illegal moves. Paste games one at a time.
- **Best move is shown in engine notation** (e.g. `e2e4`), not as `e4`.

## Change log

- **Nov 2026**
  - Fixed a hang: a PGN ending in `*`, or containing `!`/`?` annotations or a `1/2-1/2` result, sent the parser into an infinite loop that froze and then reset the page.
  - Added `;` comments and zero-castling.
  - Locked square sizes and reduced the piece size.
  - One-screen layout, with Board / Game tabs on phones.
  - Keyboard shortcuts no longer fire while typing in the PGN box.
- **Feb 2026**
  - Removed the highlight on the moved piece.
