/**
 * Minesweeper Game - DigitalGames
 * Campo Minado clássico com diferentes níveis de dificuldade
 */

class Minesweeper {
    constructor() {
        // Configurações de dificuldade
        this.difficulties = {
            easy: { rows: 8, cols: 8, mines: 10 },
            medium: { rows: 12, cols: 12, mines: 25 },
            hard: { rows: 16, cols: 16, mines: 50 }
        };

        // Estado do jogo
        this.currentDifficulty = 'medium';
        this.rows = this.difficulties[this.currentDifficulty].rows;
        this.cols = this.difficulties[this.currentDifficulty].cols;
        this.minesCount = this.difficulties[this.currentDifficulty].mines;
        
        this.board = [];
        this.minePositions = [];
        this.revealed = [];
        this.flagged = [];
        this.gameActive = false;
        this.gameStarted = false;
        this.soundEnabled = true;
        this.timer = 0;
        this.timerInterval = null;
        this.firstClick = true;

        // Estatísticas
        this.stats = {
            wins: 0,
            games: 0,
            bestTimes: {
                easy: null,
                medium: null,
                hard: null
            }
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
        this.firstClick = true;
        this.timer = 0;
        this.stopTimer();

        // Atualizar configurações baseadas na dificuldade
        const config = this.difficulties[this.currentDifficulty];
        this.rows = config.rows;
        this.cols = config.cols;
        this.minesCount = config.mines;

        // Inicializar arrays
        const totalCells = this.rows * this.cols;
        this.board = Array(totalCells).fill(0);
        this.revealed = Array(totalCells).fill(false);
        this.flagged = Array(totalCells).fill(false);
        this.minePositions = [];

        // Renderizar tabuleiro
        this.renderBoard();
        this.updateDisplay();
        this.statusDisplay.innerHTML = '<i class="fas fa-flag icon-red"></i> Clique para começar!';
        this.statusDisplay.className = '';
    }

    placeMines(firstClickIndex) {
        this.minePositions = [];
        const totalCells = this.rows * this.cols;
        
        // Criar array de posições possíveis (excluindo primeira clique e suas vizinhas)
        const safeZone = this.getNeighbors(firstClickIndex);
        safeZone.push(firstClickIndex);
        const possiblePositions = [];
        
        for (let i = 0; i < totalCells; i++) {
            if (!safeZone.includes(i)) {
                possiblePositions.push(i);
            }
        }

        // Embaralhar posições possíveis
        this.shuffleArray(possiblePositions);

        // Colocar minas
        for (let i = 0; i < this.minesCount; i++) {
            if (i < possiblePositions.length) {
                const minePos = possiblePositions[i];
                this.board[minePos] = -1;
                this.minePositions.push(minePos);
            }
        }

        // Calcular números para todas as células
        for (let i = 0; i < totalCells; i++) {
            if (this.board[i] !== -1) {
                const neighbors = this.getNeighbors(i);
                const mineCount = neighbors.filter(n => this.board[n] === -1).length;
                this.board[i] = mineCount;
            }
        }
    }

    getNeighbors(index) {
        const row = Math.floor(index / this.cols);
        const col = index % this.cols;
        const neighbors = [];

        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const newRow = row + dr;
                const newCol = col + dc;
                if (newRow >= 0 && newRow < this.rows && 
                    newCol >= 0 && newCol < this.cols) {
                    neighbors.push(newRow * this.cols + newCol);
                }
            }
        }

        return neighbors;
    }

    renderBoard() {
        this.gameBoard.innerHTML = '';
        this.gameBoard.className = `minesweeper-board ${this.currentDifficulty}`;
        this.gameBoard.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;

        for (let i = 0; i < this.rows * this.cols; i++) {
            const cell = document.createElement('div');
            cell.className = 'minesweeper-cell';
            cell.dataset.index = i;

            // Event listeners
            cell.addEventListener('click', (e) => this.handleCellClick(e));
            cell.addEventListener('contextmenu', (e) => this.handleCellRightClick(e));
            
            // Para melhor experiência mobile
            cell.addEventListener('touchstart', (e) => {
                e.preventDefault();
                cell.classList.add('pressed');
            });

            cell.addEventListener('touchend', (e) => {
                e.preventDefault();
                cell.classList.remove('pressed');
            });

            this.gameBoard.appendChild(cell);
        }
    }

    handleCellClick(e) {
        if (!this.gameActive) return;
        
        const index = parseInt(e.currentTarget.dataset.index);
        this.revealCell(index);
    }

    handleCellRightClick(e) {
        e.preventDefault();
        if (!this.gameActive) return;
        
        const index = parseInt(e.currentTarget.dataset.index);
        this.toggleFlag(index);
    }

    revealCell(index) {
        if (this.revealed[index] || this.flagged[index]) return;

        // Primeira jogada - colocar minas
        if (this.firstClick) {
            this.firstClick = false;
            this.gameStarted = true;
            this.placeMines(index);
            this.startTimer();
            this.statusDisplay.innerHTML = '<i class="fas fa-running icon-red"></i> Jogo em andamento...';
        }

        this.revealed[index] = true;
        const cell = this.gameBoard.children[index];
        cell.classList.add('revealed');

        const value = this.board[index];

        // Verificar se é mina
        if (value === -1) {
            cell.classList.add('mine', 'exploded');
            cell.innerHTML = '<i class="fas fa-bomb"></i>';
            this.gameOver(false);
            this.playSound('lose');
            return;
        }

        // Mostrar valor da célula
        if (value > 0) {
            cell.textContent = value;
            cell.classList.add(`number-${value}`);
            this.playSound('reveal');
        } else {
            // Célula vazia - revelar recursivamente em cascata
            cell.textContent = '';
            this.playSound('reveal-empty');
            this.revealAdjacentCells(index);
        }

        this.checkWin();
    }

    revealAdjacentCells(index) {
        // Usar uma fila para processamento BFS (Breadth-First Search)
        const queue = [index];
        const visited = new Set([index]);
        
        while (queue.length > 0) {
            const currentIndex = queue.shift();
            const neighbors = this.getNeighbors(currentIndex);
            
            for (const neighbor of neighbors) {
                if (visited.has(neighbor) || this.revealed[neighbor] || this.flagged[neighbor]) {
                    continue;
                }
                
                this.revealed[neighbor] = true;
                visited.add(neighbor);
                const neighborCell = this.gameBoard.children[neighbor];
                neighborCell.classList.add('revealed');
                
                const neighborValue = this.board[neighbor];
                
                if (neighborValue === 0) {
                    neighborCell.textContent = '';
                    queue.push(neighbor);
                } else if (neighborValue > 0) {
                    neighborCell.textContent = neighborValue;
                    neighborCell.classList.add(`number-${neighborValue}`);
                }
            }
        }
    }

    toggleFlag(index) {
        if (this.revealed[index]) return;

        const flagsUsed = this.flagged.filter(f => f).length;
        
        if (!this.flagged[index] && flagsUsed >= this.minesCount) {
            this.playSound('error');
            return;
        }

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
        let allNonMinesRevealed = true;
        
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] !== -1 && !this.revealed[i]) {
                allNonMinesRevealed = false;
                break;
            }
        }

        if (allNonMinesRevealed) {
            this.gameOver(true);
        }
    }

    gameOver(won) {
        this.gameActive = false;
        this.stopTimer();

        // Revelar todo o tabuleiro
        this.revealAllCells();

        if (won) {
            this.statusDisplay.innerHTML = '<i class="fas fa-trophy icon-red"></i> Vitória! Parabéns!';
            this.statusDisplay.classList.add('win');
            this.stats.wins++;
            
            // Atualizar melhor tempo
            const currentBest = this.stats.bestTimes[this.currentDifficulty];
            if (!currentBest || this.timer < currentBest) {
                this.stats.bestTimes[this.currentDifficulty] = this.timer;
            }
            
            this.playSound('win');
        } else {
            this.statusDisplay.innerHTML = '<i class="fas fa-bomb icon-red"></i> Game Over! Tente novamente.';
            this.statusDisplay.classList.add('lose');
            this.playSound('lose');
        }

        this.stats.games++;
        this.saveStats(won);
        this.updateDisplay();
    }

    revealAllCells() {
        for (let i = 0; i < this.board.length; i++) {
            const cell = this.gameBoard.children[i];
            
            if (this.board[i] === -1) {
                // Mina
                if (this.flagged[i] && !this.revealed[i]) {
                    // Mina corretamente marcada
                    cell.classList.add('flagged', 'mine-correct');
                } else if (!this.flagged[i]) {
                    // Mina não marcada
                    cell.classList.add('mine');
                    cell.innerHTML = '<i class="fas fa-bomb"></i>';
                }
            } else {
                // Não é mina
                if (this.flagged[i]) {
                    // Bandeira incorreta
                    cell.classList.add('flagged', 'mine-wrong');
                    cell.innerHTML = '<i class="fas fa-times"></i>';
                } else if (!this.revealed[i]) {
                    // Célula não revelada
                    cell.classList.add('revealed');
                    const value = this.board[i];
                    if (value > 0) {
                        cell.textContent = value;
                        cell.classList.add(`number-${value}`);
                    }
                }
            }
        }
    }

    changeDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        
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
        const flagsUsed = this.flagged.filter(f => f).length;
        const minesLeft = this.minesCount - flagsUsed;
        
        this.minesDisplay.textContent = minesLeft;
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
            this.playSound('toggle');
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
                oscillator.frequency.value = 400;
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                break;
                
            case 'reveal-empty':
                oscillator.frequency.value = 300;
                gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                break;
                
            case 'flag':
                oscillator.frequency.value = 600;
                gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
                break;
                
            case 'win':
                oscillator.frequency.value = 800;
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
                break;
                
            case 'lose':
                oscillator.frequency.value = 150;
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
                break;
                
            case 'error':
                oscillator.frequency.value = 200;
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                break;
                
            case 'toggle':
                oscillator.frequency.value = 500;
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
                break;
        }

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    saveStats(won = false) {
        // Salvar no localStorage
        localStorage.setItem('minesweeper-stats', JSON.stringify(this.stats));
        
        // Salvar no banco de dados
        if (typeof DDGConfig !== 'undefined' && DDGConfig.utils && DDGConfig.utils.saveGameStats) {
            DDGConfig.utils.saveGameStats('minesweeper', {
                score: won ? this.timer : 0,
                won: won,
                time: this.timer
            }).catch(err => {
                console.log('Estatísticas salvas localmente, mas falhou no banco de dados');
            });
        }
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