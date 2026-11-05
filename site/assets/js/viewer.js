// Game Viewer (PGN_Reader page). Needs chess.js, pgn-parser.js and GAME_DATABASE loaded first.

// GAME_DATABASE (the games list) is written into the page by the site build from site/_data/games/.

// ============================================================
// Chess piece Unicode symbols
// ============================================================
const pieces = {
    'K': { symbol: '♔', type: 'king' },
    'Q': { symbol: '♕', type: 'queen' },
    'R': { symbol: '♖', type: 'rook' },
    'B': { symbol: '♗', type: 'bishop' },
    'N': { symbol: '♘', type: 'knight' },
    'P': { symbol: '♙', type: 'pawn' },
    'k': { symbol: '♚', type: 'king' },
    'q': { symbol: '♛', type: 'queen' },
    'r': { symbol: '♜', type: 'rook' },
    'b': { symbol: '♝', type: 'bishop' },
    'n': { symbol: '♞', type: 'knight' },
    'p': { symbol: '♟', type: 'pawn' }
};

// ============================================================
// Global Variables
// ============================================================
let chess = new Chess();
let gameTree = null;
let currentNode = null;
let gameInfo = {};
let isFlipped = false;
let analysisEnabled = false;
let engineWorker = null;
let engineReady = false;

// The PGN parser (GameNode, parsePGNMoves, ...) is in pgn-parser.js, shared with the site build.

// ============================================================
// Stockfish Integration
// ============================================================
function startEngine() {
    try {
        document.getElementById('analysisStatus').textContent = 'Loading engine...';
        
        const sfUrl = 'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js';
        const blob = new Blob(['importScripts("' + sfUrl + '");'], {type: 'application/javascript'});
        engineWorker = new Worker(URL.createObjectURL(blob));
        
        engineWorker.onmessage = function(e) {
            parseEngineOutput(e.data);
        };
        
        engineWorker.onerror = function(e) {
            document.getElementById('analysisStatus').textContent = 'Error: ' + e.message;
        };
        
        engineWorker.postMessage('uci');
        engineWorker.postMessage('isready');
        
    } catch (error) {
        console.error('Failed to start engine:', error);
        document.getElementById('analysisStatus').textContent = 'Failed to load engine';
    }
}

function parseEngineOutput(message) {
    if (message === 'readyok') {
        engineReady = true;
        document.getElementById('analysisStatus').textContent = 'Engine ready';
        
        if (analysisEnabled) {
            analyzePosition();
        }
        return;
    }
    
    if (message.startsWith('info')) {
        const depthMatch = message.match(/\sdepth (\d+)/);
        if (depthMatch) {
            document.getElementById('analysisDepth').textContent = `Depth: ${depthMatch[1]}`;
            document.getElementById('analysisStatus').textContent = `Analyzing... depth ${depthMatch[1]}`;
        }
        
        const scoreMatch = message.match(/score cp (-?\d+)/);
        if (scoreMatch) {
            const centipawns = parseInt(scoreMatch[1]);
            const pawns = (centipawns / 100).toFixed(2);
            document.getElementById('analysisEval').textContent = `Evaluation: ${pawns > 0 ? '+' : ''}${pawns}`;
        }
        
        const mateMatch = message.match(/score mate (-?\d+)/);
        if (mateMatch) {
            const mateIn = parseInt(mateMatch[1]);
            if (mateIn > 0) {
                document.getElementById('analysisEval').textContent = `Evaluation: White mates in ${mateIn}`;
            } else {
                document.getElementById('analysisEval').textContent = `Evaluation: Black mates in ${Math.abs(mateIn)}`;
            }
        }
        
        const pvMatch = message.match(/pv ([a-h][1-8][a-h][1-8][qrbn]?)/);
        if (pvMatch) {
            document.getElementById('analysisBestMove').textContent = `Best move: ${pvMatch[1]}`;
        }
    }
    
    if (message.startsWith('bestmove')) {
        const moveMatch = message.match(/bestmove ([a-h][1-8][a-h][1-8][qrbn]?)/);
        if (moveMatch) {
            document.getElementById('analysisBestMove').textContent = `Best move: ${moveMatch[1]}`;
        }
        document.getElementById('analysisStatus').textContent = 'Analysis complete';
    }
}

function analyzePosition() {
    if (!engineWorker || !analysisEnabled || !engineReady) return;
    
    // Get the FEN from currentNode if available, otherwise use starting position
    const fen = currentNode ? currentNode.fen
        : 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    
    document.getElementById('analysisStatus').textContent = 'Analyzing...';
    document.getElementById('analysisEval').textContent = 'Evaluation: --';
    document.getElementById('analysisBestMove').textContent = 'Best move: --';
    document.getElementById('analysisDepth').textContent = 'Depth: 0';
    
    try {
        engineWorker.postMessage('stop');
        engineWorker.postMessage('ucinewgame');
        engineWorker.postMessage('position fen ' + fen);
        engineWorker.postMessage('go depth 45');
    } catch (error) {
        console.error('Analysis error:', error);
        document.getElementById('analysisStatus').textContent = 'Analysis error';
    }
}

function toggleAnalysis() {
    const btn = document.getElementById('analysisBtn');
    const panel = document.getElementById('analysisPanel');
    
    if (!engineWorker) {
        panel.classList.add('active');
        startEngine();
    }
    
    analysisEnabled = !analysisEnabled;
    
    if (analysisEnabled) {
        btn.classList.add('active');
        btn.textContent = '✓ Analysis ON';
        panel.classList.add('active');
        
        if (engineReady) {
            analyzePosition();
        }
    } else {
        btn.classList.remove('active');
        btn.textContent = '🔍 Analysis';
        panel.classList.remove('active');
        
        if (engineWorker) {
            engineWorker.postMessage('stop');
        }
    }
}

// ============================================================
// Display Functions
// ============================================================
function displayGameInfo(info) {
    const gameInfoDiv = document.getElementById('gameInfo');
    let hasInfo = false;
    let html = '';
    
    if (info.Event) {
        html += `<p><strong>Event:</strong> ${info.Event}</p>`;
        hasInfo = true;
    }
    if (info.White) {
        html += `<p><strong>White:</strong> ${info.White}</p>`;
        hasInfo = true;
    }
    if (info.Black) {
        html += `<p><strong>Black:</strong> ${info.Black}</p>`;
        hasInfo = true;
    }
    if (info.Result) {
        html += `<p><strong>Result:</strong> ${info.Result}</p>`;
        hasInfo = true;
    }
    if (info.Date) {
        html += `<p><strong>Date:</strong> ${info.Date}</p>`;
        hasInfo = true;
    }
    if (info.Site) {
        html += `<p><strong>Site:</strong> ${info.Site}</p>`;
        hasInfo = true;
    }
    
    if (hasInfo) {
        gameInfoDiv.innerHTML = html;
        gameInfoDiv.style.display = 'block';
    } else {
        gameInfoDiv.style.display = 'none';
    }
}

function displayMoves() {
    const movesDiv = document.getElementById('movesDisplay');
    movesDiv.innerHTML = '';
    
    if (!gameTree) return;
    
    displayMovesRecursive(gameTree, movesDiv, 1, false);
}

function displayMovesRecursive(node, container, moveNumber, isVariation) {
    node.children.forEach((child, index) => {
        // Display pre-comment if exists
        if (child.preComment) {
            const preCommentSpan = document.createElement('span');
            preCommentSpan.className = 'move-comment';
            preCommentSpan.textContent = child.preComment + ' ';
            container.appendChild(preCommentSpan);
        }
        
        // Display move number
        if (child.move.color === 'w') {
            const numSpan = document.createElement('span');
            numSpan.className = 'move-number';
            numSpan.textContent = `${moveNumber}.`;
            container.appendChild(numSpan);
        } else {
            // Black move: show N... only when flow was interrupted
            const needsNumber =
                node.move === null ||           // start of game or variation
                child.preComment !== null ||    // this Black move has a pre-comment
                node.postComment !== null ||    // preceding White move had a post-comment
                node.variations.length > 0;    // preceding White move had variations after it

            if (needsNumber) {
                const numSpan = document.createElement('span');
                numSpan.className = 'move-number';
                numSpan.textContent = `${moveNumber}...`;
                container.appendChild(numSpan);
            }
        }
        
        // Display the move
        let moveClass = 'move' + (isVariation ? ' variation' : '');
        if (child === currentNode) {
            moveClass += ' current';
        }
        
        const moveSpan = document.createElement('span');
        moveSpan.className = moveClass;
        moveSpan.textContent = child.move.san;
        moveSpan.onclick = () => goToNode(child);
        container.appendChild(moveSpan);
        
        // Display post-comment if exists
        if (child.postComment) {
            const postCommentSpan = document.createElement('span');
            postCommentSpan.className = 'move-comment';
            postCommentSpan.textContent = child.postComment + ' ';
            container.appendChild(postCommentSpan);
        }
        
        // Display variations immediately after this move
        child.variations.forEach(varNode => {
            const varDiv = document.createElement('span');
            varDiv.className = 'variation-group';
            container.appendChild(varDiv);
            
            varDiv.appendChild(document.createTextNode('('));
            displayMovesRecursive(varNode, varDiv, 
                child.move.color === 'w' ? moveNumber : moveNumber + 1, true);
            varDiv.appendChild(document.createTextNode(') '));
        });
        
        // Continue with main line
        const nextMoveNumber = child.move.color === 'b' ? moveNumber + 1 : moveNumber;
        displayMovesRecursive(child, container, nextMoveNumber, isVariation);
    });
}

// ============================================================
// Board Functions
// ============================================================
function initBoard() {
    const board = document.getElementById('chessboard');
    board.innerHTML = '';
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            const actualRow = isFlipped ? row : 7 - row;
            const actualCol = isFlipped ? 7 - col : col;
            
            square.className = 'square ' + ((actualRow + actualCol) % 2 === 0 ? 'light' : 'dark');
            square.dataset.row = actualRow;
            square.dataset.col = actualCol;
            board.appendChild(square);
        }
    }
    
    updateBoard();
}

function updateBoard() {
    const squares = document.querySelectorAll('.square');
    
    // Use currentNode FEN if available, otherwise show starting position
    const fen = currentNode
        ? currentNode.fen
        : 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    
    chess.load(fen);
    const position = chess.board();
    
    squares.forEach(square => {
        square.innerHTML = '';
    });
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = position[row][col];
            if (piece) {
                const actualRow = isFlipped ? 7 - row : row;
                const actualCol = isFlipped ? 7 - col : col;
                const index = actualRow * 8 + actualCol;
                
                const pieceChar = piece.color === 'w' ? piece.type.toUpperCase() : piece.type;
                const pieceData = pieces[pieceChar];
                
                if (pieceData) {
                    const pieceSpan = document.createElement('span');
                    pieceSpan.textContent = pieceData.symbol;
                    pieceSpan.className = 'piece-' + pieceData.type;
                    squares[index].appendChild(pieceSpan);
                }
            }
        }
    }
}

// ============================================================
// Navigation Functions
// ============================================================
function goToNode(node) {
    currentNode = node;
    updateBoard();
    displayMoves();
    updateButtons();
    
    if (analysisEnabled && engineReady) {
        analyzePosition();
    }
}

function goToStart() {
    if (gameTree) {
        currentNode = gameTree;
        updateBoard();
        displayMoves();
        updateButtons();
        
        if (analysisEnabled && engineReady) {
            analyzePosition();
        }
    }
}

function goToPrevious() {
    if (currentNode && currentNode.parent) {
        goToNode(currentNode.parent);
    }
}

function goToNext() {
    if (currentNode && currentNode.children.length > 0) {
        goToNode(currentNode.children[0]);
    }
}

function goToEnd() {
    if (!currentNode) return;
    
    let node = currentNode;
    while (node.children.length > 0) {
        node = node.children[0];
    }
    goToNode(node);
}

function flipBoard() {
    isFlipped = !isFlipped;
    initBoard();
}

function updateButtons() {
    document.getElementById('startBtn').disabled = !currentNode || !currentNode.parent;
    document.getElementById('prevBtn').disabled = !currentNode || !currentNode.parent;
    document.getElementById('nextBtn').disabled = !currentNode || currentNode.children.length === 0;
    document.getElementById('endBtn').disabled = !currentNode || currentNode.children.length === 0;
}

// ============================================================
// Load Game
// ============================================================
function showPgnError(message) {
    const box = document.getElementById('pgnError');
    if (message) {
        box.textContent = message;
        box.hidden = false;
    } else {
        box.textContent = '';
        box.hidden = true;
    }
}

function loadGame() {
    const pgn = document.getElementById('pgnInput').value.trim();
    showPgnError(null);
    
    if (!pgn) {
        showPgnError('Paste a game in PGN notation into the box above, or choose one from the list.');
        return;
    }
    
    let tree;
    try {
        tree = parsePGNMoves(pgn);
    } catch (error) {
        console.error('PGN Error:', error);
        showPgnError('Sorry, this game could not be read. Please check that it is in PGN notation.');
        return;
    }
    
    if (tree.children.length === 0) {
        const first = tree.errors[0];
        showPgnError(first
            ? `No moves could be read. The first problem is at ${first.label}, which isn't a legal move there.`
            : 'No moves were found. Please check that the text is a chess game in PGN notation.');
        return;
    }
    
    gameInfo = parsePGNHeaders(pgn);
    gameTree = tree;
    currentNode = gameTree;
    
    displayGameInfo(gameInfo);
    displayMoves();
    goToStart();
    
    // Part of the game could not be read: show what loaded, and say where it stopped
    if (tree.errors.length) {
        const first = tree.errors[0];
        showPgnError(first.inVariation
            ? `A side line has a problem at ${first.label} (not a legal move there). The rest of the game loaded normally.`
            : `The game stops at ${first.label}: that isn't a legal move there, so the moves after it were skipped. Check the PGN for a typo.`);
    }
    
    // Reset Stockfish for new game
    if (analysisEnabled && engineReady) {
        analyzePosition();
    }
}

function clearPGN() {
    document.getElementById('pgnInput').value = '';
    document.getElementById('gameSelect').selectedIndex = 0;
    showPgnError(null);
    document.getElementById('gameInfo').style.display = 'none';
    document.getElementById('movesDisplay').innerHTML = '';
    gameTree = null;
    currentNode = null;
    gameInfo = {};
    
    initBoard(); // Will show starting position since currentNode is null
    updateButtons();
    
    // Reset analysis display and re-analyze starting position
    document.getElementById('analysisEval').textContent = 'Evaluation: --';
    document.getElementById('analysisBestMove').textContent = 'Best move: --';
    document.getElementById('analysisDepth').textContent = 'Depth: 0';
    
    if (analysisEnabled && engineReady) {
        analyzePosition();
    }
}

// ============================================================
// Game Database Functions
// ============================================================
function populateGameSelector() {
    const select = document.getElementById('gameSelect');
    
    GAME_DATABASE.forEach((game, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = game.name;
        select.appendChild(option);
    });
}

function loadSelectedGame() {
    const select = document.getElementById('gameSelect');
    const selectedIndex = select.value;
    
    if (selectedIndex === '') {
        return;
    }
    
    const game = GAME_DATABASE[selectedIndex];
    document.getElementById('pgnInput').value = game.pgn;
    loadGame();
}

// ============================================================
// Event Listeners
// ============================================================
document.getElementById('gameSelect').addEventListener('change', loadSelectedGame);
document.getElementById('loadBtn').addEventListener('click', loadGame);
document.getElementById('clearBtn').addEventListener('click', clearPGN);
document.getElementById('startBtn').addEventListener('click', goToStart);
document.getElementById('prevBtn').addEventListener('click', goToPrevious);
document.getElementById('nextBtn').addEventListener('click', goToNext);
document.getElementById('endBtn').addEventListener('click', goToEnd);
document.getElementById('flipBtn').addEventListener('click', flipBoard);
document.getElementById('analysisBtn').addEventListener('click', toggleAnalysis);

document.addEventListener('keydown', (e) => {
    // Ignore shortcuts while typing in the PGN box, the game list, or any other form field
    const t = e.target;
    if (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) return;
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Home') goToStart();
    if (e.key === 'End') goToEnd();
});

// ============================================================
// Initialize
// ============================================================
populateGameSelector();
initBoard();
updateButtons();

// Board / Game tabs (narrow screens only - on desktop both panels show side by side)
(function () {
    const layout = document.querySelector('.pgn-layout');
    const tabs = document.querySelectorAll('.pgn-tab');
    function showTab(name) {
        layout.dataset.tab = name;
        tabs.forEach(t => {
            const on = t.dataset.tab === name;
            t.classList.toggle('active', on);
            t.setAttribute('aria-selected', on);
        });
    }
    tabs.forEach(t => t.addEventListener('click', () => showTab(t.dataset.tab)));
    // After a game loads successfully, jump to the board so the user sees it
    function afterLoad() {
        setTimeout(() => {
            const moves = document.getElementById('movesDisplay');
            const err = document.querySelector('.moves-section .error-message:not([hidden])');
            if (moves.children.length > 0 && !err) showTab('board');
        }, 0);
    }
    document.getElementById('loadBtn').addEventListener('click', afterLoad);
    document.getElementById('gameSelect').addEventListener('change', afterLoad);
})();
