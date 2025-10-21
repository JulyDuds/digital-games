/**
 * Minesweeper Game - Digital Detective Games
 * Campo Minado clássico com diferentes níveis de dificuldade
 */

class Minesweeper {
    constructor() {
        // Configurações de dificuldade
        this.difficulties = {
            easy: { size: 8, mines: 10 },
            medium: { size: 12, mines: 25 },
            hard: { size: 16, mines: 50 }
        };

        // Estado do jogo
        this.currentDifficulty = 'medium';
        this.boardSize = this.difficulties[this.currentDifficulty].size;
        this.minesCount = this.difficulties[this.currentDifficulty].mines;
        this.board = [];
        this.revealed = [];
        this.flagged = [];
        this.gameActive = false;
        this.gameStarted = false;
        this.soundEnabled = true;
        this.timer = 0;
        this.timerInterval = null;

        // Estatísticas
        this.stats = {
            wins: 0,
            games: 0
        };

        // Elementos do DOM
        this.gameBoard = document.getElementById('game-board');
        this.minesDisplay = document.getElementById('mines-count');
        this.flagsDisplay = document.getElementById('flags-count');
        this.timerDisplay = document.getElementById('timer');
        this.statusDisplay = document.getElementById('game-status');
        this.restartBtn = document.getElementById('restart-btn');
        this.soundBtn = document.getElementById('sound-btn');
        this.difficultyBtns = document.querySelectorAll('.difficulty-btn');
        this.winsDisplay = document.getElementById('wins');
        this.gamesDisplay = document.getElementById('games');

        this.init();
    }

    init() {
        // Carregar estatísticas
        this.loadStats();

        // Event listeners
        this.restartBtn.addEventListener('click', () => this.newGame());
        this.soundBtn.addEventListener('click', () => this.toggleSound());

        this.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.changeDifficulty(e.target.dataset.difficulty);
            });
        });

        // Iniciar primeiro jogo
        this.newGame();
    }

    newGame() {
        // Reset estado
        this.gameActive = true;
        this.gameStarted = false;
        this.timer = 0;
        this.stopTimer();

        // Criar tabuleiro
        this.createBoard();
        this.renderBoard();
        this.updateDisplay();
        this.statusDisplay.textContent = 'Clique para começar!';
    }

    createBoard() {
        const totalCells = this.boardSize * this.boardSize;
        this.board = Array(totalCells).fill(0);
        this.revealed = Array(totalCells).fill(false);
        this.flagged = Array(totalCells).fill(false);
    }

    placeMines(firstClick) {
        // Garantir que a primeira célula clicada não tem mina
        const safeZone = this.getNeighbors(firstClick);
        safeZone.push(firstClick);

        let minesPlaced = 0;
        while (minesPlaced < this.minesCount) {
            const pos = Math.floor(Math.random() * this.board.length);
            if (this.board[pos] !== -1 && !safeZone.includes(pos)) {
                this.board[pos] = -1;
                minesPlaced++;
            }
        }

        // Calcular números
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] !== -1) {
                const neighbors = this.getNeighbors(i);
                const mineCount = neighbors.filter(n => this.board[n] === -1).length;
                this.board[i] = mineCount;
            }
        }
    }

    getNeighbors(index) {
        const row = Math.floor(index / this.boardSize);
        const col = index % this.boardSize;
        const neighbors = [];

        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const newRow = row + dr;
                const newCol = col + dc;
                if (newRow >= 0 && newRow < this.boardSize && 
                    newCol >= 0 && newCol < this.boardSize) {
                    neighbors.push(newRow * this.boardSize + newCol);
                }
            }
        }

        return neighbors;
    }

    renderBoard() {
        this.gameBoard.innerHTML = '';
        this.gameBoard.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;

        for (let i = 0; i < this.board.length; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i;

            cell.addEventListener('click', (e) => this.handleCellClick(e));
            cell.addEventListener('contextmenu', (e) => this.handleCellRightClick(e));

            this.gameBoard.appendChild(cell);
        }
    }

    handleCellClick(e) {
        e.preventDefault();
        const index = parseInt(e.target.dataset.index);

        if (!this.gameActive || this.revealed[index] || this.flagged[index]) {
            return;
        }

        // Primeira jogada - colocar minas
        if (!this.gameStarted) {
            this.gameStarted = true;
            this.placeMines(index);
            this.startTimer();
        }

        this.revealCell(index);
    }

    handleCellRightClick(e) {
        e.preventDefault();
        const index = parseInt(e.target.dataset.index);

        if (!this.gameActive || this.revealed[index]) {
            return;
        }

        this.toggleFlag(index);
    }

    revealCell(index) {
        if (this.revealed[index]) return;

        this.revealed[index] = true;
        const cell = this.gameBoard.children[index];
        cell.classList.add('revealed');

        // Verificar se é mina
        if (this.board[index] === -1) {
            cell.classList.add('mine');
            cell.innerHTML = '<i class="fas fa-bomb"></i>';
            this.gameOver(false);
            this.playSound('lose');
            return;
        }

        // Mostrar número
        const value = this.board[index];
        if (value > 0) {
            cell.textContent = value;
            cell.classList.add(`number-${value}`);
        } else {
            // Revelar células vizinhas vazias
            const neighbors = this.getNeighbors(index);
            neighbors.forEach(n => {
                if (!this.revealed[n] && !this.flagged[n]) {
                    this.revealCell(n);
                }
            });
        }

        this.playSound('reveal');
        this.checkWin();
    }

    toggleFlag(index) {
        this.flagged[index] = !this.flagged[index];
        const cell = this.gameBoard.children[index];

        if (this.flagged[index]) {
            cell.classList.add('flagged');
            cell.innerHTML = '<i class="fas fa-flag"></i>';
            this.playSound('flag');
        } else {
            cell.classList.remove('flagged');
            cell.innerHTML = '';
        }

        this.updateDisplay();
        this.checkWin();
    }

    checkWin() {
        // Verificar se todas as células não-mina foram reveladas
        const nonMineCells = this.board.filter(cell => cell !== -1).length;
        const revealedNonMine = this.revealed.filter((r, i) => r && this.board[i] !== -1).length;

        if (revealedNonMine === nonMineCells) {
            this.gameOver(true);
        }
    }

    gameOver(won) {
        this.gameActive = false;
        this.stopTimer();

        // Revelar todas as minas
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] === -1) {
                const cell = this.gameBoard.children[i];
                if (!this.flagged[i]) {
                    cell.classList.add('mine');
                    cell.innerHTML = '<i class="fas fa-bomb"></i>';
                }
            }
        }

        if (won) {
            this.statusDisplay.textContent = '🎉 Você venceu!';
            this.stats.wins++;
            this.playSound('win');
        } else {
            this.statusDisplay.textContent = '💣 Game Over!';
            this.playSound('lose');
        }

        this.stats.games++;
        this.saveStats();
        this.updateDisplay();
    }

    changeDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        this.boardSize = this.difficulties[difficulty].size;
        this.minesCount = this.difficulties[difficulty].mines;

        this.difficultyBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.difficulty === difficulty) {
                btn.classList.add('active');
            }
        });

        this.newGame();
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.timerDisplay.textContent = this.timer;
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateDisplay() {
        this.minesDisplay.textContent = this.minesCount;
        const flagsUsed = this.flagged.filter(f => f).length;
        this.flagsDisplay.textContent = `${flagsUsed}/${this.minesCount}`;
        this.timerDisplay.textContent = this.timer;
        this.winsDisplay.textContent = this.stats.wins;
        this.gamesDisplay.textContent = this.stats.games;
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const icon = this.soundBtn.querySelector('i');
        
        if (this.soundEnabled) {
            icon.className = 'fas fa-volume-up';
        } else {
            icon.className = 'fas fa-volume-mute';
        }
    }

    playSound(type) {
        if (!this.soundEnabled) return;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        switch(type) {
            case 'reveal':
                oscillator.frequency.value = 300;
                gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.05);
                break;
            case 'flag':
                oscillator.frequency.value = 600;
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
            case 'win':
                oscillator.frequency.value = 800;
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.4);
                break;
            case 'lose':
                oscillator.frequency.value = 150;
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
                break;
        }
    }

    saveStats() {
        localStorage.setItem('minesweeper-stats', JSON.stringify(this.stats));
    }

    loadStats() {
        const saved = localStorage.getItem('minesweeper-stats');
        if (saved) {
            this.stats = JSON.parse(saved);
        }
    }
}

// Inicializar o jogo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new Minesweeper();
});

