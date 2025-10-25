/**
 * Memory Game - Digital Detective Games
 * Jogo da memória com diferentes níveis de dificuldade
 */

class MemoryGame {
    constructor() {
        // Configurações de dificuldade
        this.difficulties = {
            easy: { rows: 3, cols: 4 },
            medium: { rows: 4, cols: 4 },
            hard: { rows: 4, cols: 6 }
        };

        // Ícones Font Awesome para as cartas
        this.icons = [
            'fa-lock', 'fa-key', 'fa-laptop', 'fa-desktop', 
            'fa-mobile', 'fa-keyboard', 'fa-computer-mouse', 'fa-floppy-disk',
            'fa-satellite-dish', 'fa-plug', 'fa-battery-full', 'fa-lightbulb',
            'fa-gamepad', 'fa-bullseye', 'fa-dice', 'fa-ghost',
            'fa-rocket', 'fa-bolt', 'fa-fire', 'fa-gem',
            'fa-trophy', 'fa-star', 'fa-flag', 'fa-heart'
        ];

        // Estado do jogo
        this.currentDifficulty = 'medium';
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.gameActive = true;
        this.soundEnabled = true;
        this.timer = 0;
        this.timerInterval = null;
        this.canFlip = true;

        // Estatísticas
        this.stats = {
            bestMoves: Infinity,
            games: 0
        };

        // Elementos DOM
        this.gameBoard = document.getElementById('game-board');
        this.movesDisplay = document.getElementById('moves');
        this.pairsDisplay = document.getElementById('pairs');
        this.totalPairsDisplay = document.getElementById('total-pairs');
        this.timerDisplay = document.getElementById('timer');
        this.statusDisplay = document.getElementById('game-status');
        this.restartBtn = document.getElementById('restart-btn');
        this.soundBtn = document.getElementById('sound-btn');
        this.difficultyBtns = document.querySelectorAll('.difficulty-btn');
        this.bestMovesDisplay = document.getElementById('best-moves');
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
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.gameActive = true;
        this.canFlip = true;
        this.timer = 0;

        // Parar timer anterior
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        // Iniciar timer
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.timerDisplay.textContent = this.timer;
        }, 1000);

        // Criar cartas
        this.createCards();
        this.renderBoard();
        this.updateDisplay();
        this.statusDisplay.innerHTML = '<i class="fas fa-brain icon-red"></i> Encontre todos os pares!';
    }

    createCards() {
        const config = this.difficulties[this.currentDifficulty];
        const totalCards = config.rows * config.cols;
        const pairsNeeded = totalCards / 2;

        // Selecionar ícones aleatórios
        const selectedIcons = this.shuffleArray([...this.icons]).slice(0, pairsNeeded);
        
        // Criar pares e embaralhar
        this.cards = this.shuffleArray([...selectedIcons, ...selectedIcons]);
        
        this.totalPairsDisplay.textContent = pairsNeeded;
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    renderBoard() {
        const config = this.difficulties[this.currentDifficulty];
        
        this.gameBoard.innerHTML = '';
        this.gameBoard.className = 'memory-board';
        this.gameBoard.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;

        this.cards.forEach((icon, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.index = index;
            card.dataset.icon = icon;

            const cardBack = document.createElement('div');
            cardBack.className = 'card-back';
            cardBack.innerHTML = '<i class="fas fa-question"></i>';

            const cardFront = document.createElement('div');
            cardFront.className = 'card-front';
            cardFront.innerHTML = `<i class="fas ${icon}"></i>`;

            card.appendChild(cardBack);
            card.appendChild(cardFront);

            card.addEventListener('click', () => this.flipCard(index));

            this.gameBoard.appendChild(card);
        });
    }

    flipCard(index) {
        if (!this.canFlip || !this.gameActive) return;

        const card = this.gameBoard.children[index];
        
        // Não virar se já estiver virada ou combinada
        if (card.classList.contains('flipped') || card.classList.contains('matched')) {
            return;
        }

        // Limitar a 2 cartas viradas
        if (this.flippedCards.length >= 2) return;

        // Virar carta
        card.classList.add('flipped');
        this.flippedCards.push({ 
            index, 
            icon: card.dataset.icon, 
            element: card 
        });
        
        this.playSound('flip');

        // Verificar se duas cartas foram viradas
        if (this.flippedCards.length === 2) {
            this.canFlip = false;
            this.moves++;
            this.movesDisplay.textContent = this.moves;
            
            setTimeout(() => {
                this.checkMatch();
            }, 800);
        }
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;

        if (card1.icon === card2.icon) {
            // Par encontrado!
            card1.element.classList.add('matched');
            card2.element.classList.add('matched');
            this.matchedPairs++;
            this.pairsDisplay.textContent = this.matchedPairs;
            this.playSound('match');
            
            this.checkWin();
        } else {
            // Não combinou - virar de volta após delay
            setTimeout(() => {
                card1.element.classList.remove('flipped');
                card2.element.classList.remove('flipped');
                this.playSound('nomatch');
            }, 600);
        }

        this.flippedCards = [];
        this.canFlip = true;
    }

    checkWin() {
        const config = this.difficulties[this.currentDifficulty];
        const totalPairs = (config.rows * config.cols) / 2;

        if (this.matchedPairs === totalPairs) {
            this.gameActive = false;
            clearInterval(this.timerInterval);
            
            this.statusDisplay.innerHTML = `<i class="fas fa-trophy icon-red"></i> Você venceu em ${this.moves} jogadas!`;
            
            // Atualizar melhor pontuação
            if (this.moves < this.stats.bestMoves) {
                this.stats.bestMoves = this.moves;
            }
            
            this.stats.games++;
            this.saveStats(true); // Pass true to indicate win
            this.updateDisplay();
            this.playSound('win');
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

    updateDisplay() {
        this.movesDisplay.textContent = this.moves;
        this.pairsDisplay.textContent = this.matchedPairs;
        this.timerDisplay.textContent = this.timer;
        this.bestMovesDisplay.textContent = this.stats.bestMoves === Infinity ? '∞' : this.stats.bestMoves;
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
            case 'flip':
                oscillator.frequency.value = 400;
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
            case 'match':
                oscillator.frequency.value = 700;
                gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
            case 'nomatch':
                oscillator.frequency.value = 250;
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
                break;
            case 'win':
                oscillator.frequency.value = 900;
                gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
                break;
        }
    }

    saveStats(won = false) {
        // Salvar no localStorage
        localStorage.setItem('memory-stats', JSON.stringify(this.stats));
        
        // Salvar no banco de dados se ganhou
        if (won && typeof DDGConfig !== 'undefined' && DDGConfig.utils && DDGConfig.utils.saveGameStats) {
            DDGConfig.utils.saveGameStats('memory', {
                score: this.moves,
                won: true,
                time: this.timer
            }).catch(err => {
                console.log('Estatísticas salvas localmente, mas falhou no banco de dados');
            });
        }
    }

    loadStats() {
        const saved = localStorage.getItem('memory-stats');
        if (saved) {
            this.stats = JSON.parse(saved);
        }
    }
}

// Inicializar o jogo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});