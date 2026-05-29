// Game Manager
function startGame(game) {
    document.getElementById('menuSection').style.display = 'none';
    document.getElementById('gameSection').style.display = 'block';
    document.getElementById('gameTitle').textContent = game.toUpperCase();
    
    const container = document.getElementById('gameContainer');
    container.innerHTML = '';
    
    switch(game) {
        case 'snake':
            initSnakeGame();
            break;
        case 'tictactoe':
            initTicTacToe();
            break;
        case '2048':
            init2048();
            break;
        case 'memory':
            initMemoryGame();
            break;
        case 'rps':
            initRockPaperScissors();
            break;
        case 'flappy':
            initFlappyBird();
            break;
    }
}

function backToMenu() {
    document.getElementById('menuSection').style.display = 'block';
    document.getElementById('gameSection').style.display = 'none';
    document.getElementById('gameContainer').innerHTML = '';
    document.getElementById('gameStats').innerHTML = '';
    
    // Clean up Flappy Bird event listeners if they exist
    if (window.flappyKeyHandler) {
        document.removeEventListener('keydown', window.flappyKeyHandler);
        window.flappyKeyHandler = null;
    }
    if (window.flappyClickHandler) {
        document.removeEventListener('click', window.flappyClickHandler);
        window.flappyClickHandler = null;
    }
}

// ============ SNAKE GAME ============
function initSnakeGame() {
    const container = document.getElementById('gameContainer');
    container.innerHTML = `
        <div style="text-align: center;">
            <canvas id="snakeCanvas" width="400" height="400"></canvas>
            <div class="snake-controls">
                <button onclick="snakeGame.togglePause()">Pause/Resume</button>
                <button onclick="startGame('snake')">New Game</button>
                <p>Score: <span id="snakeScore">0</span></p>
                <p style="font-size: 0.9em; color: #666;">Use Arrow Keys to Move</p>
            </div>
        </div>
    `;
    
    const canvas = document.getElementById('snakeCanvas');
    const ctx = canvas.getContext('2d');
    
    const snakeGame = window.snakeGame = {
        snake: [{x: 200, y: 200}],
        food: {x: Math.random() * 20 | 0, y: Math.random() * 20 | 0},
        direction: {x: 1, y: 0},
        nextDirection: {x: 1, y: 0},
        score: 0,
        gameRunning: true,
        gamePaused: false,
        
        togglePause() {
            this.gamePaused = !this.gamePaused;
        },
        
        update() {
            if (!this.gameRunning || this.gamePaused) return;
            
            this.direction = this.nextDirection;
            const head = {x: this.snake[0].x + this.direction.x, y: this.snake[0].y + this.direction.y};
            
            // Check wall collision
            if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
                this.endGame();
                return;
            }
            
            // Check self collision
            if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
                this.endGame();
                return;
            }
            
            this.snake.unshift(head);
            
            // Check food collision
            if (head.x === this.food.x && head.y === this.food.y) {
                this.score += 10;
                document.getElementById('snakeScore').textContent = this.score;
                this.food = {x: Math.random() * 20 | 0, y: Math.random() * 20 | 0};
            } else {
                this.snake.pop();
            }
        },
        
        draw() {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw grid
            ctx.strokeStyle = '#222';
            ctx.lineWidth = 0.5;
            for (let i = 0; i <= 20; i++) {
                ctx.beginPath();
                ctx.moveTo(i * 20, 0);
                ctx.lineTo(i * 20, canvas.height);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, i * 20);
                ctx.lineTo(canvas.width, i * 20);
                ctx.stroke();
            }
            
            // Draw snake
            ctx.fillStyle = '#00ff00';
            this.snake.forEach(segment => {
                ctx.fillRect(segment.x * 20, segment.y * 20, 20, 20);
            });
            
            // Draw food
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(this.food.x * 20, this.food.y * 20, 20, 20);
        },
        
        endGame() {
            this.gameRunning = false;
            alert('Game Over! Final Score: ' + this.score);
        },
        
        gameLoop() {
            this.update();
            this.draw();
            setTimeout(() => this.gameLoop(), 100);
        }
    };
    
    document.addEventListener('keydown', (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
            const directions = {
                'ArrowUp': {x: 0, y: -1},
                'ArrowDown': {x: 0, y: 1},
                'ArrowLeft': {x: -1, y: 0},
                'ArrowRight': {x: 1, y: 0}
            };
            const newDir = directions[e.key];
            // Prevent reversing
            if (!(snakeGame.direction.x === -newDir.x && snakeGame.direction.y === -newDir.y)) {
                snakeGame.nextDirection = newDir;
            }
        }
    });
    
    snakeGame.gameLoop();
}

// ============ TIC TAC TOE ============
function initTicTacToe() {
    const container = document.getElementById('gameContainer');
    container.innerHTML = `
        <div class="ttt-container">
            <div class="ttt-status" id="tttStatus">Your turn (X)</div>
            <div class="ttt-board" id="tttBoard"></div>
            <button class="ttt-reset" onclick="startGame('tictactoe')">New Game</button>
        </div>
    `;
    
    const board = Array(9).fill(null);
    let gameActive = true;
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    
    function checkWinner() {
        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return board.includes(null) ? null : 'draw';
    }
    
    function makeAIMove() {
        const emptySpots = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
        if (emptySpots.length === 0) return;
        
        // Simple AI: check if can win, check if can block, else random
        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            const values = [board[a], board[b], board[c]];
            if (values.filter(v => v === 'O').length === 2 && values.includes(null)) {
                board[pattern[values.indexOf(null)]] = 'O';
                return;
            }
        }
        
        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            const values = [board[a], board[b], board[c]];
            if (values.filter(v => v === 'X').length === 2 && values.includes(null)) {
                board[pattern[values.indexOf(null)]] = 'O';
                return;
            }
        }
        
        board[emptySpots[Math.floor(Math.random() * emptySpots.length)]] = 'O';
    }
    
    function updateBoard() {
        const tttBoard = document.getElementById('tttBoard');
        tttBoard.innerHTML = '';
        
        board.forEach((val, idx) => {
            const cell = document.createElement('button');
            cell.className = 'ttt-cell';
            cell.textContent = val || '';
            cell.onclick = () => {
                if (!gameActive || board[idx] !== null) return;
                board[idx] = 'X';
                updateBoard();
                
                let winner = checkWinner();
                if (winner) {
                    gameActive = false;
                    document.getElementById('tttStatus').textContent = 
                        winner === 'draw' ? "It's a Draw!" : winner === 'X' ? 'You Win!' : 'AI Wins!';
                    return;
                }
                
                makeAIMove();
                updateBoard();
                
                winner = checkWinner();
                if (winner) {
                    gameActive = false;
                    document.getElementById('tttStatus').textContent = 
                        winner === 'draw' ? "It's a Draw!" : winner === 'X' ? 'You Win!' : 'AI Wins!';
                }
            };
            tttBoard.appendChild(cell);
        });
    }
    
    updateBoard();
}

// ============ 2048 GAME ============
function init2048() {
    const container = document.getElementById('gameContainer');
    container.innerHTML = `
        <div class="game-2048">
            <div class="score-info">
                <div>Score<div class="score-value" id="score2048">0</div></div>
                <div>Best<div class="score-value" id="best2048">0</div></div>
            </div>
            <div class="grid-2048" id="grid2048"></div>
            <div class="game-controls">
                <button onclick="startGame('2048')">New Game</button>
            </div>
        </div>
    `;
    
    let grid = Array(16).fill(0);
    let score = 0;
    let best = localStorage.getItem('best2048') || 0;
    document.getElementById('best2048').textContent = best;
    
    function addNewTile() {
        const empty = grid.map((v, i) => v === 0 ? i : null).filter(v => v !== null);
        if (empty.length > 0) {
            grid[empty[Math.floor(Math.random() * empty.length)]] = Math.random() < 0.9 ? 2 : 4;
        }
    }
    
    function canMove() {
        for (let i = 0; i < 16; i++) {
            if (grid[i] === 0) return true;
            const row = Math.floor(i / 4);
            const col = i % 4;
            if (col < 3 && grid[i] === grid[i + 1]) return true;
            if (row < 3 && grid[i] === grid[i + 4]) return true;
        }
        return false;
    }
    
    function move(direction) {
        const oldGrid = [...grid];
        
        if (direction === 'left' || direction === 'right') {
            for (let row = 0; row < 4; row++) {
                let line = grid.slice(row * 4, row * 4 + 4);
                line = line.filter(v => v !== 0);
                
                for (let i = 0; i < line.length - 1; i++) {
                    if (line[i] === line[i + 1]) {
                        line[i] *= 2;
                        score += line[i];
                        line.splice(i + 1, 1);
                    }
                }
                
                if (direction === 'right') {
                    while (line.length < 4) line.unshift(0);
                } else {
                    while (line.length < 4) line.push(0);
                }
                
                grid.splice(row * 4, 4, ...line);
            }
        } else {
            for (let col = 0; col < 4; col++) {
                let line = [grid[col], grid[col + 4], grid[col + 8], grid[col + 12]];
                line = line.filter(v => v !== 0);
                
                for (let i = 0; i < line.length - 1; i++) {
                    if (line[i] === line[i + 1]) {
                        line[i] *= 2;
                        score += line[i];
                        line.splice(i + 1, 1);
                    }
                }
                
                if (direction === 'down') {
                    while (line.length < 4) line.unshift(0);
                } else {
                    while (line.length < 4) line.push(0);
                }
                
                for (let i = 0; i < 4; i++) {
                    grid[col + i * 4] = line[i];
                }
            }
        }
        
        if (JSON.stringify(grid) !== JSON.stringify(oldGrid)) {
            addNewTile();
            draw();
        }
    }
    
    function draw() {
        const gridContainer = document.getElementById('grid2048');
        gridContainer.innerHTML = '';
        
        grid.forEach(val => {
            const tile = document.createElement('div');
            tile.className = 'tile' + (val ? ` tile-${val}` : '');
            tile.textContent = val || '';
            gridContainer.appendChild(tile);
        });
        
        document.getElementById('score2048').textContent = score;
        if (score > best) {
            best = score;
            localStorage.setItem('best2048', best);
            document.getElementById('best2048').textContent = best;
        }
    }
    
    document.addEventListener('keydown', (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
            const directions = {
                'ArrowUp': 'up',
                'ArrowDown': 'down',
                'ArrowLeft': 'left',
                'ArrowRight': 'right'
            };
            move(directions[e.key]);
        }
    });
    
    addNewTile();
    addNewTile();
    draw();
}

// ============ MEMORY GAME ============
function initMemoryGame() {
    const container = document.getElementById('gameContainer');
    container.innerHTML = `
        <div style="text-align: center;">
            <div style="margin-bottom: 20px;">Matches: <span id="memoryMatches">0</span>/8</div>
            <div class="memory-grid" id="memoryGrid"></div>
            <button class="ttt-reset" onclick="startGame('memory')">New Game</button>
        </div>
    `;
    
    const emojis = ['🍎', '🍌', '🍒', '🍊', '🍇', '🍓', '🍑', '🥝'];
    let cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    let flipped = Array(16).fill(false);
    let matched = Array(16).fill(false);
    let lockBoard = false;
    let firstCard = null;
    let matches = 0;
    
    function createGrid() {
        const grid = document.getElementById('memoryGrid');
        grid.innerHTML = '';
        
        cards.forEach((card, idx) => {
            const btn = document.createElement('button');
            btn.className = 'memory-card' + (matched[idx] ? ' matched' : '');
            btn.textContent = flipped[idx] || matched[idx] ? card : '';
            btn.onclick = () => flipCard(idx, btn);
            grid.appendChild(btn);
        });
    }
    
    function flipCard(idx, btn) {
        if (lockBoard || flipped[idx] || matched[idx]) return;
        
        flipped[idx] = true;
        btn.classList.add('flipped');
        btn.textContent = cards[idx];
        
        if (firstCard === null) {
            firstCard = idx;
        } else {
            lockBoard = true;
            if (cards[firstCard] === cards[idx]) {
                matched[firstCard] = true;
                matched[idx] = true;
                matches++;
                document.getElementById('memoryMatches').textContent = matches;
                firstCard = null;
                lockBoard = false;
                createGrid();
                
                if (matches === 8) {
                    setTimeout(() => alert('You Won! All pairs matched!'), 300);
                }
            } else {
                setTimeout(() => {
                    flipped[firstCard] = false;
                    flipped[idx] = false;
                    firstCard = null;
                    lockBoard = false;
                    createGrid();
                }, 800);
            }
        }
    }
    
    createGrid();
}

// ============ ROCK PAPER SCISSORS ============
function initRockPaperScissors() {
    const container = document.getElementById('gameContainer');
    container.innerHTML = `
        <div class="rps-container">
            <div class="rps-scores">
                <div>You: <span id="rpsPlayerScore">0</span></div>
                <div>Computer: <span id="rpsComputerScore">0</span></div>
            </div>
            <div class="rps-choices">
                <button class="choice-btn" onclick="playRPS('rock')">🪨</button>
                <button class="choice-btn" onclick="playRPS('paper')">📄</button>
                <button class="choice-btn" onclick="playRPS('scissors')">✂️</button>
            </div>
            <div class="rps-result" id="rpsResult"></div>
            <button class="ttt-reset" onclick="startGame('rps')">Reset Score</button>
        </div>
    `;
    
    window.playerScoreRPS = 0;
    window.computerScoreRPS = 0;
    
    window.playRPS = function(choice) {
        const choices = ['rock', 'paper', 'scissors'];
        const computer = choices[Math.floor(Math.random() * 3)];
        
        let result;
        if (choice === computer) {
            result = "It's a Tie!";
        } else if (
            (choice === 'rock' && computer === 'scissors') ||
            (choice === 'paper' && computer === 'rock') ||
            (choice === 'scissors' && computer === 'paper')
        ) {
            result = 'You Win!';
            window.playerScoreRPS++;
        } else {
            result = 'Computer Wins!';
            window.computerScoreRPS++;
        }
        
        const choiceEmojis = {rock: '🪨', paper: '📄', scissors: '✂️'};
        document.getElementById('rpsResult').textContent = 
            `You: ${choiceEmojis[choice]} | Computer: ${choiceEmojis[computer]} | ${result}`;
        document.getElementById('rpsPlayerScore').textContent = window.playerScoreRPS;
        document.getElementById('rpsComputerScore').textContent = window.computerScoreRPS;
    };
}

// ============ FLAPPY BIRD ============
function initFlappyBird() {
    const container = document.getElementById('gameContainer');
    container.innerHTML = `
        <div style="text-align: center;">
            <div class="flappy-controls" style="margin-bottom: 15px;">
                <button onclick="startGame('flappy')" style="background: #28a745; color: white; border: none; padding: 12px 30px; border-radius: 8px; cursor: pointer; font-size: 1.1em; margin: 5px; font-weight: bold;">🔄 New Game</button>
                <button onclick="flappyGame.togglePause()" style="background: #667eea; color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-size: 1em; margin: 5px;">Pause/Resume</button>
            </div>
            <div style="margin-bottom: 15px;">
                <span style="font-size: 1.1em; font-weight: bold;">Score: <span id="flappyScore">0</span></span> | 
                <span style="font-size: 1.1em; font-weight: bold;">Best: <span id="flappyBest">0</span></span>
            </div>
            <canvas id="flappyCanvas" width="400" height="600"></canvas>
            <div class="flappy-controls" style="margin-top: 15px;">
                <p style="font-size: 0.9em; color: #666;">Click or Space to Flap • R to Restart Anytime</p>
            </div>
        </div>
    `;
    
    const canvas = document.getElementById('flappyCanvas');
    const ctx = canvas.getContext('2d');
    
    let bestFlappy = parseInt(localStorage.getItem('flappyBest') || 0);
    document.getElementById('flappyBest').textContent = bestFlappy;
    
    const flappyGame = window.flappyGame = {
        bird: {x: 50, y: 250, width: 28, height: 24, velocity: 0, rotation: 0},
        pipes: [],
        score: 0,
        gameRunning: true,
        gamePaused: false,
        pipeGap: 180,
        pipeWidth: 70,
        gravity: 0.6,
        frameCount: 0,
        
        togglePause() {
            this.gamePaused = !this.gamePaused;
        },
        
        flap() {
            this.bird.velocity = -9;
        },
        
        update() {
            if (!this.gameRunning || this.gamePaused) return;
            
            this.frameCount++;
            this.bird.velocity += this.gravity;
            this.bird.y += this.bird.velocity;
            
            // Bird rotation based on velocity
            if (this.bird.velocity < -5) {
                this.bird.rotation = -0.3;
            } else if (this.bird.velocity > 5) {
                this.bird.rotation = 0.3;
            } else {
                this.bird.rotation = this.bird.velocity * 0.03;
            }
            
            if (this.bird.y + this.bird.height > canvas.height - 70 || this.bird.y < 0) {
                this.endGame();
                return;
            }
            
            if (this.pipes.length === 0 || this.pipes[this.pipes.length - 1].x < canvas.width - 200) {
                const gapStart = Math.random() * (canvas.height - this.pipeGap - 150) + 80;
                this.pipes.push({
                    x: canvas.width,
                    topHeight: gapStart,
                    scored: false
                });
            }
            
            this.pipes = this.pipes.filter(pipe => pipe.x > -this.pipeWidth);
            
            this.pipes.forEach(pipe => {
                pipe.x -= 6;
                
                if (
                    (this.bird.x < pipe.x + this.pipeWidth && this.bird.x + this.bird.width > pipe.x) &&
                    (this.bird.y < pipe.topHeight || this.bird.y + this.bird.height > pipe.topHeight + this.pipeGap)
                ) {
                    this.endGame();
                }
                
                if (!pipe.scored && pipe.x + this.pipeWidth < this.bird.x) {
                    pipe.scored = true;
                    this.score++;
                    document.getElementById('flappyScore').textContent = this.score;
                }
            });
        },
        
        drawBird() {
            ctx.save();
            ctx.translate(this.bird.x + this.bird.width / 2, this.bird.y + this.bird.height / 2);
            ctx.rotate(this.bird.rotation);
            
            // Bird body (yellow)
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.ellipse(0, 0, 12, 10, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Bird outline
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Eye white
            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.arc(6, -2, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Eye pupil
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(7, -2, 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Wing
            ctx.fillStyle = '#FFB900';
            ctx.beginPath();
            ctx.ellipse(-6, 0, 6, 8, -0.3, 0, Math.PI * 2);
            ctx.fill();
            
            // Beak
            ctx.fillStyle = '#FF8C00';
            ctx.beginPath();
            ctx.moveTo(9, -1);
            ctx.lineTo(16, -2);
            ctx.lineTo(9, 2);
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
        },
        
        drawPipe(pipe) {
            // Top pipe
            const topGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + this.pipeWidth, 0);
            topGradient.addColorStop(0, '#1a7d1a');
            topGradient.addColorStop(1, '#228B22');
            ctx.fillStyle = topGradient;
            ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            
            // Top pipe outline
            ctx.strokeStyle = '#0d4d0d';
            ctx.lineWidth = 3;
            ctx.strokeRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            
            // Top pipe rim
            ctx.fillStyle = '#32CD32';
            ctx.fillRect(pipe.x - 4, pipe.topHeight - 10, this.pipeWidth + 8, 10);
            ctx.strokeStyle = '#1a7d1a';
            ctx.lineWidth = 2;
            ctx.strokeRect(pipe.x - 4, pipe.topHeight - 10, this.pipeWidth + 8, 10);
            
            // Bottom pipe
            const bottomStart = pipe.topHeight + this.pipeGap;
            const bottomGradient = ctx.createLinearGradient(pipe.x, bottomStart, pipe.x + this.pipeWidth, bottomStart);
            bottomGradient.addColorStop(0, '#1a7d1a');
            bottomGradient.addColorStop(1, '#228B22');
            ctx.fillStyle = bottomGradient;
            ctx.fillRect(pipe.x, bottomStart, this.pipeWidth, canvas.height - bottomStart - 70);
            
            // Bottom pipe outline
            ctx.strokeStyle = '#0d4d0d';
            ctx.lineWidth = 3;
            ctx.strokeRect(pipe.x, bottomStart, this.pipeWidth, canvas.height - bottomStart - 70);
            
            // Bottom pipe rim
            ctx.fillStyle = '#32CD32';
            ctx.fillRect(pipe.x - 4, bottomStart, this.pipeWidth + 8, 10);
            ctx.strokeStyle = '#1a7d1a';
            ctx.lineWidth = 2;
            ctx.strokeRect(pipe.x - 4, bottomStart, this.pipeWidth + 8, 10);
        },
        
        draw() {
            // Sky background with gradient
            const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            skyGradient.addColorStop(0, '#87CEEB');
            skyGradient.addColorStop(1, '#E0F6FF');
            ctx.fillStyle = skyGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Clouds
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            ctx.ellipse(80, 80, 40, 20, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(320, 120, 35, 18, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Ground
            const groundGradient = ctx.createLinearGradient(0, canvas.height - 70, 0, canvas.height);
            groundGradient.addColorStop(0, '#7CB342');
            groundGradient.addColorStop(1, '#558B2F');
            ctx.fillStyle = groundGradient;
            ctx.fillRect(0, canvas.height - 70, canvas.width, 70);
            
            // Ground outline
            ctx.strokeStyle = '#33691E';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, canvas.height - 70);
            ctx.lineTo(canvas.width, canvas.height - 70);
            ctx.stroke();
            
            // Grass pattern
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.lineWidth = 1;
            for (let i = 0; i < canvas.width; i += 20) {
                ctx.beginPath();
                ctx.moveTo(i, canvas.height - 70);
                ctx.lineTo(i + 10, canvas.height - 60);
                ctx.stroke();
            }
            
            // Draw pipes
            this.pipes.forEach(pipe => this.drawPipe(pipe));
            
            // Draw bird
            this.drawBird();
            
            // Draw score and UI
            ctx.fillStyle = '#000';
            ctx.font = 'bold 28px Arial';
            ctx.fillText('Score: ' + this.score, 15, 40);
            
            // Draw best score
            ctx.font = 'bold 16px Arial';
            ctx.fillText('Best: ' + bestFlappy, 15, 65);
        },
        
        endGame() {
            this.gameRunning = false;
            // Clean up event listeners
            document.removeEventListener('keydown', window.flappyKeyHandler);
            canvas.removeEventListener('click', window.flappyClickHandler);
            
            setTimeout(() => {
                if (this.score > bestFlappy) {
                    bestFlappy = this.score;
                    localStorage.setItem('flappyBest', bestFlappy);
                    alert('🎉 NEW BEST SCORE! ' + this.score);
                } else {
                    alert('Game Over! Score: ' + this.score);
                }
            }, 300);
        },
        
        gameLoop() {
            this.update();
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
        }
    };
    
    // Create named event handlers for cleanup
    window.flappyKeyHandler = (e) => {
        if (!flappyGame.gameRunning) return;
        if (e.code === 'Space') {
            e.preventDefault();
            flappyGame.flap();
        }
        if (e.key.toLowerCase() === 'r') {
            e.preventDefault();
            startGame('flappy');
        }
    };
    
    window.flappyClickHandler = () => {
        if (!flappyGame.gameRunning) return;
        flappyGame.flap();
    };
    
    document.addEventListener('keydown', window.flappyKeyHandler);
    canvas.addEventListener('click', window.flappyClickHandler);
    
    flappyGame.gameLoop();
}
