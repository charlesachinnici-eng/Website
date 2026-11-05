// ============================================================
// PGN parser - shared by the Game Viewer (in the browser) and the
// site build (which checks every game in the games list before publishing).
// Needs chess.js 0.10.x available as the global "Chess".
// ============================================================

class GameNode {
    constructor(move = null, preComment = null, postComment = null, parent = null) {
        this.move = move;
        this.preComment = preComment;
        this.postComment = postComment;
        this.parent = parent;
        this.children = [];
        this.variations = [];
        this.fen = null;
    }
    
    addChild(node) {
        this.children.push(node);
        return node;
    }
    
    addVariation(node) {
        this.variations.push(node);
        return node;
    }
}

function parsePGNHeaders(pgn) {
    const headerRegex = /\[(\w+)\s+"([^"]+)"\]/g;
    const info = {};
    let match;
    
    while ((match = headerRegex.exec(pgn)) !== null) {
        info[match[1]] = match[2];
    }
    
    return info;
}

function parsePGNMoves(pgn) {
    const movesText = pgn.replace(/\[.*?\]\s*/g, '');
    const root = new GameNode();
    root.fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    
    const tokens = tokenizePGN(movesText);
    // Problems found while reading (e.g. an illegal or mistyped move) are collected here
    root.errors = [];
    buildGameTree(root, tokens, 0, root.errors);
    
    return root;
}

function tokenizePGN(text) {
    const tokens = [];
    let i = 0;
    // Move-suffix annotations written as symbols, mapped to their standard NAG codes
    const SUFFIX_NAGS = { '!': '$1', '?': '$2', '!!': '$3', '??': '$4', '!?': '$5', '?!': '$6' };

    while (i < text.length) {
        while (i < text.length && /\s/.test(text[i])) i++;
        if (i >= text.length) break;

        const rest = text.substring(i);
        let m;

        if (text[i] === '{') {                                  // { comment }
            const start = i + 1;
            i++;
            while (i < text.length && text[i] !== '}') i++;
            tokens.push({ type: 'comment', value: text.substring(start, i).trim() });
            i++;
        }
        else if (text[i] === ';') {                             // ; comment to end of line
            const start = i + 1;
            while (i < text.length && text[i] !== '\n') i++;
            tokens.push({ type: 'comment', value: text.substring(start, i).trim() });
        }
        else if (text[i] === '(') {
            tokens.push({ type: 'var_start' });
            i++;
        }
        else if (text[i] === ')') {
            tokens.push({ type: 'var_end' });
            i++;
        }
        else if (text[i] === '$') {                             // $6 style NAG
            const start = i;
            i++;
            while (i < text.length && /\d/.test(text[i])) i++;
            tokens.push({ type: 'nag', value: text.substring(start, i) });
        }
        else if ((m = rest.match(/^(1-0|0-1|1\/2-1\/2|\*)/))) {  // game result
            tokens.push({ type: 'result', value: m[1] });
            i += m[1].length;
        }
        else if ((m = rest.match(/^0-0(-0)?/))) {               // castling written with zeros
            tokens.push({ type: 'move', value: m[1] ? 'O-O-O' : 'O-O' });
            i += m[0].length;
        }
        else if (/\d/.test(text[i])) {                          // move number: 12. or 12...
            while (i < text.length && /[\d.]/.test(text[i])) i++;
        }
        else if ((m = rest.match(/^[a-zA-Z][a-zA-Z0-9+#=\-]*/))) {  // a move, e.g. Nf3, exd5+, e8=Q#
            tokens.push({ type: 'move', value: m[0] });
            i += m[0].length;
        }
        else if ((m = rest.match(/^[!?]+/))) {                  // Nf3! / Bxc4?! annotations
            if (SUFFIX_NAGS[m[0]]) tokens.push({ type: 'nag', value: SUFFIX_NAGS[m[0]] });
            i += m[0].length;
        }
        else {
            // Anything else (stray punctuation, odd characters): skip it.
            // Always advancing here is what guarantees the loop can never hang.
            i++;
        }
    }

    return tokens;
}

function buildGameTree(node, tokens, index, errors) {
    const tempChess = new Chess(node.fen);
    let pendingPreComment = null;
    let i = index;
    
    while (i < tokens.length) {
        const token = tokens[i];
        
        if (token.type === 'comment') {
            pendingPreComment = token.value;
            i++;
        }
        else if (token.type === 'move') {
            try {
                const move = tempChess.move(token.value);
                if (move) {
                    // Check if next token is a comment (post-comment)
                    let postComment = null;
                    if (i + 1 < tokens.length && tokens[i + 1].type === 'comment') {
                        postComment = tokens[i + 1].value;
                        i++; // Skip the comment token
                    }
                    
                    const childNode = new GameNode(move, pendingPreComment, postComment, node);
                    childNode.fen = tempChess.fen();
                    node.addChild(childNode);
                    node = childNode;
                    pendingPreComment = null;
                }
                else {
                    recordError();
                }
            } catch (e) {
                recordError();
            }
            function recordError() {
                // e.g. "23... Qxe7": move number and side come from the position the move was tried in
                const fenParts = tempChess.fen().split(' ');
                const label = fenParts[5] + (fenParts[1] === 'w' ? '. ' : '... ') + token.value;
                if (errors) errors.push({ move: token.value, label: label, inVariation: !!node.parent && isInVariation(node) });
            }
            i++;
        }
        else if (token.type === 'var_start') {
            if (node.parent) {
                const varNode = new GameNode(null, null, null, node.parent);
                varNode.fen = node.parent.fen;
                node.parent.addVariation(varNode);
                i = buildGameTree(varNode, tokens, i + 1, errors);
            } else {
                i++;
            }
        }
        else if (token.type === 'var_end') {
            return i + 1;
        }
        else if (token.type === 'result') {
            i++;
        }
        else {
            i++;
        }
    }
    
    return i;
}

// True if this node sits inside a variation rather than the main line
function isInVariation(node) {
    while (node && node.parent) {
        if (node.parent.variations && node.parent.variations.includes(node)) return true;
        if (node.parent.children[0] !== node) return true;
        node = node.parent;
    }
    return false;
}

