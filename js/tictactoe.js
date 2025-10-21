/**
 * Tic-Tac-Toe Game - Digital Detective Games
 * Jogo da Velha com IA usando algoritmo Minimax
 */

class TicTacToe {
    constructor() {
        // Estado do jogo
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameMode = 'ai'; // 'ai' ou 'player'
        this.gameActive = true;
        this.soundEnabled = true;

        // Estatísticas
        this.scores = {
            x: 0,
            o: 0,
            draw: 0
        };

        // Combinações vencedoras
        this.winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
            [0, 4, 8], [2, 4, 6]             // Diagonais
        ];

        // Elementos do DOM
        this.cells = document.querySelectorAll('.cell');
        this.statusDisplay = document.getElementById('game-status');
        this.currentPlayerDisplay = document.getElementById('current-player');
        this.restartBtn = document.getElementById('restart-btn');
        this.soundBtn = document.getElementById('sound-btn');
        this.modeBtns = document.querySelectorAll('.mode-btn');
        
        this.scoreXDisplay = document.getElementById('score-x');
        this.scoreODisplay = document.getElementById('score-o');
        this.scoreDrawDisplay = document.getElementById('score-draw');
        this.winsDisplay = document.getElementById('wins');
        this.gamesDisplay = document.getElementById('games');

        this.init();
    }

    init() {
        // Carregar estatísticas
        this.loadScores();

        // Event listeners
        this.cells.forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(e));
        });

        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.soundBtn.addEventListener('click', () => this.toggleSound());

        this.modeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.changeMode(e.target.dataset.mode));
        });

        this.updateDisplay();
    }

    handleCellClick(e) {
        const cellIndex = parseInt(e.target.dataset.index);

        // Verificar se a célula já está ocupada ou se o jogo acabou
        if (this.board[cellIndex] !== '' || !this.gameActive) {
            return;
        }

        // Fazer a jogada
        this.makeMove(cellIndex, this.currentPlayer);

        // Se estiver no modo IA e o jogo ainda estiver ativo
        if (this.gameMode === 'ai' && this.gameActive && this.currentPlayer === 'O') {
            // Pequeno delay para a IA parecer mais natural
            setTimeout(() => {
                this.aiMove();
            }, 500);
        }
    }

    makeMove(index, player) {
        this.board[index] = player;
        this.cells[index].textContent = player;
        this.cells[index].classList.add('taken', player.toLowerCase());

        this.playSound('move');

        // Verificar vitória ou empate
        if (this.checkWin(player)) {
            this.endGame(player);
            return;
        }

        if (this.checkDraw()) {
            this.endGame('draw');
            return;
        }

        // Trocar jogador
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateDisplay();
    }

    aiMove() {
        if (!this.gameActive) return;

        // Usar Minimax para encontrar a melhor jogada
        const bestMove = this.findBestMove();
        this.makeMove(bestMove, 'O');
    }

    findBestMove() {
        let bestScore = -Infinity;
        let bestMove = -1;

        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                let score = this.minimax(this.board, 0, false);
                this.board[i] = '';

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }

        return bestMove;
    }

    minimax(board, depth, isMaximizing) {
        // Verificar estados terminais
        if (this.checkWin('O')) return 10 - depth;
        if (this.checkWin('X')) return depth - 10;
        if (this.checkDraw()) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    let score = this.minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    let score = this.minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    checkWin(player) {
        return this.winPatterns.some(pattern => {
            return pattern.every(index => this.board[index] === player);
        });
    }

    checkDraw() {
        return this.board.every(cell => cell !== '');
    }

    endGame(result) {
        this.gameActive = false;

        if (result === 'draw') {
            this.statusDisplay.textContent = 'Empate!';
            this.scores.draw++;
            this.playSound('draw');
        } else {
            // Destacar células vencedoras
            const winPattern = this.winPatterns.find(pattern => {
                return pattern.every(index => this.board[index] === result);
            });

            if (winPattern) {
                winPattern.forEach(index => {
                    this.cells[index].classList.add('winner');
                });
            }

            this.statusDisplay.textContent = `Jogador ${result} venceu!`;
            
            if (result === 'X') {
                this.scores.x++;
                this.playSound('win');
            } else {
                this.scores.o++;
                this.playSound('lose');
            }
        }

        this.saveScores();
        this.updateDisplay();
    }

    restartGame() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameActive = true;

        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('taken', 'x', 'o', 'winner');
        });

        this.updateDisplay();
    }

    changeMode(mode) {
        this.gameMode = mode;
        
        this.modeBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            }
        });

        this.restartGame();
    }

    updateDisplay() {
        this.currentPlayerDisplay.textContent = this.currentPlayer;
        
        if (this.gameActive) {
            if (this.gameMode === 'ai') {
                if (this.currentPlayer === 'X') {
                    this.statusDisplay.textContent = 'Sua vez!';
                } else {
                    this.statusDisplay.textContent = 'IA está pensando...';
                }
            } else {
                this.statusDisplay.textContent = `Vez do jogador ${this.currentPlayer}`;
            }
        }

        // Atualizar scores
        this.scoreXDisplay.textContent = this.scores.x;
        this.scoreODisplay.textContent = this.scores.o;
        this.scoreDrawDisplay.textContent = this.scores.draw;
        
        const totalGames = this.scores.x + this.scores.o + this.scores.draw;
        this.winsDisplay.textContent = this.scores.x;
        this.gamesDisplay.textContent = totalGames;
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

        // Criar e tocar som usando Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Diferentes sons para diferentes eventos
        switch(type) {
            case 'move':
                oscillator.frequency.value = 400;
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
            case 'win':
                oscillator.frequency.value = 800;
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
            case 'lose':
                oscillator.frequency.value = 200;
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
            case 'draw':
                oscillator.frequency.value = 500;
                gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
                break;
        }
    }

    saveScores() {
        localStorage.setItem('tictactoe-scores', JSON.stringify(this.scores));
    }

    loadScores() {
        const saved = localStorage.getItem('tictactoe-scores');
        if (saved) {
            this.scores = JSON.parse(saved);
        }
    }
}

// Inicializar o jogo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});

