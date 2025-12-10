const cvs = document.getElementById("tetrisbox");
const ctx = cvs.getContext("2d");
const nextCvs = document.getElementById("nextPiece");
const nextCtx = nextCvs.getContext("2d");
const scoreElement = document.getElementById("score");
const levelElement = document.getElementById("level");
const startBtn = document.getElementById("start-btn");

const ROW = 20;
const COL = 10;
const SQ = 24; // Square size
const VACANT = "TRANSPARENT"; // Empty color

// Draw a square - Updated to support fractional Y for smooth drop
function drawSquare(x, y, color, context = ctx) {
    if (color === VACANT) return;

    context.fillStyle = color;
    context.fillRect(x * SQ, y * SQ, SQ, SQ);

    // Add inner shadow/highlight for 3D/Neon effect
    context.strokeStyle = "rgba(255, 255, 255, 0.5)";
    context.lineWidth = 2;
    context.strokeRect(x * SQ, y * SQ, SQ, SQ);

    // Neon glow effect
    context.fillStyle = "rgba(255, 255, 255, 0.2)";
    context.fillRect(x * SQ + 4, y * SQ + 4, SQ - 8, SQ - 8);
}

// Create the board
let board = [];
for (let r = 0; r < ROW; r++) {
    board[r] = [];
    for (let c = 0; c < COL; c++) {
        board[r][c] = VACANT;
    }
}

// Draw the board
function drawBoard() {
    for (let r = 0; r < ROW; r++) {
        for (let c = 0; c < COL; c++) {
            if (board[r][c] != VACANT) {
                drawSquare(c, r, board[r][c]);
            }
        }
    }
}

// Tetromino Definitions
const I_TETROMINO = [
    [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
    ],
    [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ],
    [
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
    ],
    [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
    ]
];

const J_TETROMINO = [
    [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    [
        [0, 1, 1],
        [0, 1, 0],
        [0, 1, 0]
    ],
    [
        [0, 0, 0],
        [1, 1, 1],
        [0, 0, 1]
    ],
    [
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0]
    ]
];

const L_TETROMINO = [
    [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ],
    [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 1]
    ],
    [
        [0, 0, 0],
        [1, 1, 1],
        [1, 0, 0]
    ],
    [
        [1, 1, 0],
        [0, 1, 0],
        [0, 1, 0]
    ]
];

const O_TETROMINO = [
    [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
    ]
];

const S_TETROMINO = [
    [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],
    [
        [0, 1, 0],
        [0, 1, 1],
        [0, 0, 1]
    ],
    [
        [0, 0, 0],
        [0, 1, 1],
        [1, 1, 0]
    ],
    [
        [1, 0, 0],
        [1, 1, 0],
        [0, 1, 0]
    ]
];

const T_TETROMINO = [
    [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    [
        [0, 1, 0],
        [0, 1, 1],
        [0, 1, 0]
    ],
    [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0]
    ],
    [
        [0, 1, 0],
        [1, 1, 0],
        [0, 1, 0]
    ]
];

const Z_TETROMINO = [
    [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ],
    [
        [0, 0, 1],
        [0, 1, 1],
        [0, 1, 0]
    ],
    [
        [0, 0, 0],
        [1, 1, 0],
        [0, 1, 1]
    ],
    [
        [0, 1, 0],
        [1, 1, 0],
        [1, 0, 0]
    ]
];

const PIECES_DATA = [
    [Z_TETROMINO, "#ff0055"],
    [S_TETROMINO, "#00ff9d"],
    [T_TETROMINO, "#bf00ff"],
    [O_TETROMINO, "#ffe600"],
    [L_TETROMINO, "#ff6b00"],
    [I_TETROMINO, "#00f3ff"],
    [J_TETROMINO, "#2b00ff"]
];

// Generate Random Object
function randomPiece() {
    let r = Math.floor(Math.random() * PIECES_DATA.length);
    return new Piece(PIECES_DATA[r][0], PIECES_DATA[r][1]);
}

// The Object Piece
function Piece(tetromino, color) {
    this.tetromino = tetromino;
    this.color = color;
    this.tetrominoN = 0;
    this.activeTetromino = this.tetromino[this.tetrominoN];
    this.x = 3;
    this.y = -2;
}

// Draw method now supports vertical offset for smoothing
Piece.prototype.draw = function (offsetY = 0) {
    for (let r = 0; r < this.activeTetromino.length; r++) {
        for (let c = 0; c < this.activeTetromino.length; c++) {
            if (this.activeTetromino[r][c]) {
                drawSquare(this.x + c, this.y + r + offsetY, this.color);
            }
        }
    }
}

// Move Down
Piece.prototype.moveDown = function () {
    if (!this.collision(0, 1, this.activeTetromino)) {
        this.y++;
    } else {
        this.lock();
        if (gameOver) return;
        p = nextP;
        nextP = randomPiece();
        drawNextPiece();
    }
}

// Move Right
Piece.prototype.moveRight = function () {
    if (!this.collision(1, 0, this.activeTetromino)) {
        this.x++;
    }
}

// Move Left
Piece.prototype.moveLeft = function () {
    if (!this.collision(-1, 0, this.activeTetromino)) {
        this.x--;
    }
}

// Rotate
Piece.prototype.rotate = function () {
    let nextPattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
    let kick = 0;

    if (this.collision(0, 0, nextPattern)) {
        if (this.x > COL / 2) {
            kick = -1;
        } else {
            kick = 1;
        }
    }

    if (!this.collision(kick, 0, nextPattern)) {
        this.x += kick;
        this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length;
        this.activeTetromino = this.tetromino[this.tetrominoN];
    }
}

// Hard Drop
Piece.prototype.hardDrop = function () {
    if (gameOver || isPaused) return;
    while (!this.collision(0, 1, this.activeTetromino)) {
        this.y++;
    }
    this.lock(); // Lock immediately
    if (gameOver) return;
    p = nextP;
    nextP = randomPiece();
    drawNextPiece();
}

let score = 0;
let level = 1;

Piece.prototype.lock = function () {
    for (let r = 0; r < this.activeTetromino.length; r++) {
        for (let c = 0; c < this.activeTetromino.length; c++) {
            if (!this.activeTetromino[r][c]) {
                continue;
            }
            if (this.y + r < 0) {
                alert("GAME OVER");
                gameOver = true;
                break;
            }
            board[this.y + r][this.x + c] = this.color;
        }
    }
    if (!gameOver) {
        for (let r = 0; r < ROW; r++) {
            let isRowFull = true;
            for (let c = 0; c < COL; c++) {
                isRowFull = isRowFull && (board[r][c] != VACANT);
            }
            if (isRowFull) {
                for (let y = r; y > 1; y--) {
                    for (let c = 0; c < COL; c++) {
                        board[y][c] = board[y - 1][c];
                    }
                }
                for (let c = 0; c < COL; c++) {
                    board[0][c] = VACANT;
                }
                score += 10;
                if (score % 50 === 0) {
                    level += 1;
                    dropSpeed = Math.max(100, 1000 - (level * 100));
                }
            }
        }
        scoreElement.innerHTML = score;
        levelElement.innerHTML = level;
    }
}

// Collision detection
Piece.prototype.collision = function (x, y, piece) {
    for (let r = 0; r < piece.length; r++) {
        for (let c = 0; c < piece.length; c++) {
            if (!piece[r][c]) {
                continue;
            }
            let newX = this.x + c + x;
            let newY = this.y + r + y;

            if (newX < 0 || newX >= COL || newY >= ROW) {
                return true;
            }
            if (newY < 0) {
                continue;
            }
            if (board[newY][newX] != VACANT) {
                return true;
            }
        }
    }
    return false;
}

// Control
let gameOver = false;
let isPaused = false;
let dropStart = Date.now();
let dropSpeed = 1000;

let p;
let nextP;
let animationId;

function drawNextPiece() {
    nextCtx.clearRect(0, 0, nextCvs.width, nextCvs.height);
    let previewPiece = nextP.activeTetromino;
    let color = nextP.color;

    let offsetX = (4 - previewPiece.length);
    if (offsetX < 0) offsetX = 0;

    for (let r = 0; r < previewPiece.length; r++) {
        for (let c = 0; c < previewPiece.length; c++) {
            if (previewPiece[r][c]) {
                drawSquare(c + offsetX, r + 1, color, nextCtx);
            }
        }
    }
}

// Game Loop for logic and animation
function loop() {
    if (gameOver) {
        cancelAnimationFrame(animationId);
        return;
    }

    if (!isPaused) {
        let now = Date.now();
        let delta = now - dropStart;

        if (delta > dropSpeed) {
            p.moveDown();
            dropStart = Date.now();
        }

        // Render Frame
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        drawBoard();

        // Calculate smooth drop offset (0 to 1)
        let percent = delta / dropSpeed;
        if (percent > 1) percent = 1;

        // Draw active piece with offset
        p.draw(percent);
    }

    animationId = requestAnimationFrame(loop);
}

document.addEventListener("keydown", CONTROL);

function CONTROL(event) {
    if (gameOver) return;

    if (event.keyCode == 37) { // Left
        p.moveLeft();
    } else if (event.keyCode == 65) { // A
        p.rotate();
    } else if (event.keyCode == 39) { // Right
        p.moveRight();
    } else if (event.keyCode == 40) { // Down
        p.moveDown();
        dropStart = Date.now();
    } else if (event.keyCode == 32) { // Space
        p.hardDrop();
        dropStart = Date.now();
    } else if (event.keyCode == 80) { // P
        isPaused = !isPaused;
    }
}

startBtn.addEventListener("click", () => {
    // Reset
    if (gameOver) {
        gameOver = false;
        board = [];
        for (let r = 0; r < ROW; r++) {
            board[r] = [];
            for (let c = 0; c < COL; c++) {
                board[r][c] = VACANT;
            }
        }
        score = 0;
        level = 1;
        dropSpeed = 1000;
        scoreElement.innerHTML = score;
        levelElement.innerHTML = level;
    }

    if (!p || gameOver) { // Logic to ensure restart works
        if (animationId) cancelAnimationFrame(animationId);
        p = randomPiece();
        nextP = randomPiece();
        dropStart = Date.now();
        drawNextPiece();
        loop();
    }
});
