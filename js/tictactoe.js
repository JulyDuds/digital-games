/**
 * Tic-Tac-Toe Game - Digital Detective Games
 * Jogo da Velha com IA acessível
 */

class TicTacToe {
    constructor() {
        // Estado do jogo
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameMode = 'ai';
        this.gameActive = true;
        this.soundEnabled = true;
        this.difficulty = 'easy'; // 'easy', 'medium', 'hard'

        // Estatísticas
        this.stats = {
            xWins: 0,
            oWins: 0,
            draws: 0,
            games: 0
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
        this.loadStats();

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

        if (this.board[cellIndex] !== '' || !this.gameActive) {
            return;
        }

        // Fazer jogada do jogador
        this.makeMove(cellIndex, this.currentPlayer);

        // Se for modo IA e ainda tiver jogo, IA joga
        if (this.gameMode === 'ai' && this.gameActive && this.currentPlayer === 'O') {
            setTimeout(() => {
                this.aiMove();
            }, 600);
        }
    }

    makeMove(index, player) {
        this.board[index] = player;
        const cell = this.cells[index];
        cell.textContent = player;
        cell.classList.add('taken', player.toLowerCase());

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

        let move;
        const availableMoves = this.getAvailableMoves();
        
        // IA FÁCIL - Comportamento mais previsível e com erros
        if (availableMoves.length === 0) return;

        // 1. Tentar vencer (40% de chance de não perceber)
        if (Math.random() > 0.4) {
            move = this.findWinningMove('O');
        }

        // 2. Bloquear jogador (30% de chance de não bloquear)
        if (!move && Math.random() > 0.3) {
            move = this.findWinningMove('X');
        }

        // 3. Jogadas estratégicas com probabilidades diferentes
        if (!move) {
            const random = Math.random();
            
            if (random < 0.4) {
                // 40% - Jogada aleatória (pode ser ruim)
                move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            } else if (random < 0.7) {
                // 30% - Centro ou canto
                move = this.findStrategicMove();
            } else {
                // 30% - Jogada que cria oportunidades para o jogador
                move = this.findGenerousMove();
            }
        }

        // Garantir que a jogada é válida
        if (move !== null && move !== undefined && this.board[move] === '') {
            this.makeMove(move, 'O');
        } else {
            // Fallback: jogada aleatória
            const fallbackMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            this.makeMove(fallbackMove, 'O');
        }
    }

    findWinningMove(player) {
        for (const pattern of this.winPatterns) {
            const positions = pattern.map(index => this.board[index]);
            const emptyIndex = pattern.find(index => this.board[index] === '');
            
            // Verificar se há 2 do mesmo jogador e 1 vazio
            if (positions.filter(cell => cell === player).length === 2 && emptyIndex !== undefined) {
                return emptyIndex;
            }
        }
        return null;
    }

    findStrategicMove() {
        // Prioridade: centro > cantos > arestas
        if (this.board[4] === '') return 4; // Centro
        
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(index => this.board[index] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        // Se não há cantos, retorna null para cair no fallback
        return null;
    }

    findGenerousMove() {
        // Encontra jogadas que dão oportunidades para o jogador
        const availableMoves = this.getAvailableMoves();
        
        // Filtra jogadas que não criam ameaças imediatas para a IA
        const safeMoves = availableMoves.filter(move => {
            // Simula a jogada
            this.board[move] = 'O';
            const createsThreat = this.checkWin('O');
            this.board[move] = '';
            
            // Prefere jogadas que não criam ameaças diretas
            return !createsThreat;
        });
        
        // Se há jogadas seguras, escolhe uma aleatoriamente
        if (safeMoves.length > 0) {
            return safeMoves[Math.floor(Math.random() * safeMoves.length)];
        }
        
        // Se não há jogadas seguras, retorna null para cair no fallback
        return null;
    }

    getAvailableMoves() {
        return this.board
            .map((cell, index) => cell === '' ? index : null)
            .filter(index => index !== null);
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
            this.statusDisplay.innerHTML = '<i class="fas fa-handshake icon-red"></i> Empate!';
            this.stats.draws++;
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

            if (result === 'X') {
                this.statusDisplay.innerHTML = '<i class="fas fa-trophy icon-red"></i> Jogador X venceu!';
                this.stats.xWins++;
                this.playSound('win');
            } else {
                this.statusDisplay.innerHTML = '<i class="fas fa-trophy icon-red"></i> Jogador O venceu!';
                this.stats.oWins++;
                this.playSound('lose');
            }
        }

        this.stats.games++;
        this.saveStats();
        this.updateDisplay();
    }

    restartGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;

        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('taken', 'x', 'o', 'winner');
        });

        this.updateDisplay();
        this.statusDisplay.innerHTML = '<i class="fas fa-chess-board icon-red"></i> ' + (this.gameMode === 'ai' ? 'Sua vez!' : 'Vez do jogador X');
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
        this.currentPlayerDisplay.className = this.currentPlayer.toLowerCase();
        
        if (this.gameActive) {
            if (this.gameMode === 'ai') {
                this.statusDisplay.innerHTML = '<i class="fas fa-chess-board icon-red"></i> ' + (this.currentPlayer === 'X' ? 'Sua vez!' : 'IA está pensando...');
            } else {
                this.statusDisplay.innerHTML = '<i class="fas fa-chess-board icon-red"></i> Vez do jogador ' + this.currentPlayer;
            }
        }

        // Atualizar scores
        this.scoreXDisplay.textContent = this.stats.xWins;
        this.scoreODisplay.textContent = this.stats.oWins;
        this.scoreDrawDisplay.textContent = this.stats.draws;
        
        this.winsDisplay.textContent = this.stats.xWins;
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
            case 'move':
                oscillator.frequency.value = 400;
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                break;
            case 'win':
                // Sequência de tons para vitória
                [600, 800, 1000].forEach((freq, i) => {
                    setTimeout(() => {
                        const osc = audioContext.createOscillator();
                        const gn = audioContext.createGain();
                        osc.connect(gn);
                        gn.connect(audioContext.destination);
                        osc.frequency.value = freq;
                        gn.gain.setValueAtTime(0.2, audioContext.currentTime);
                        gn.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                        osc.start(audioContext.currentTime);
                        osc.stop(audioContext.currentTime + 0.2);
                    }, i * 150);
                });
                return;
            case 'lose':
                oscillator.frequency.value = 200;
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                break;
            case 'draw':
                oscillator.frequency.value = 500;
                gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                break;
        }

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }

    saveStats() {
        localStorage.setItem('tictactoe-stats', JSON.stringify(this.stats));
    }

    loadStats() {
        const saved = localStorage.getItem('tictactoe-stats');
        if (saved) {
            this.stats = JSON.parse(saved);
        }
    }
}

// Inicializar o jogo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});