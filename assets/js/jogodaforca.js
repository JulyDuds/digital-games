/**
 * Hangman Game - Digital Detective Games
 * Jogo da Forca com banco de palavras, categorias e dicas
 */

class HangmanGame {
    constructor() {
        // Banco de palavras com categorias e dicas
        this.wordBank = [
            { word: 'JAVASCRIPT', category: 'Programação', hint: 'Linguagem de programação para web' },
            { word: 'PYTHON', category: 'Programação', hint: 'Linguagem com nome de cobra' },
            { word: 'DATABASE', category: 'Programação', hint: 'Armazena dados estruturados' },
            { word: 'ALGORITMO', category: 'Programação', hint: 'Sequência lógica de instruções' },
            { word: 'COMPUTADOR', category: 'Tecnologia', hint: 'Máquina que processa dados' },
            { word: 'INTERNET', category: 'Tecnologia', hint: 'Rede mundial de computadores' },
            { word: 'CIBERSEGURANCA', category: 'Segurança', hint: 'Proteção contra ataques digitais' },
            { word: 'FIREWALL', category: 'Segurança', hint: 'Barreira de proteção de rede' },
            { word: 'HACKER', category: 'Segurança', hint: 'Especialista em sistemas' },
            { word: 'INTELIGENCIA', category: 'Ciência', hint: 'Capacidade de aprender' },
            { word: 'DETETIVE', category: 'Profissão', hint: 'Investiga crimes' },
            { word: 'ENIGMA', category: 'Mistério', hint: 'Quebra-cabeça difícil' }
        ];

        // Estado do jogo
        this.currentWord = null;
        this.currentCategory = '';
        this.currentHint = '';
        this.guessedLetters = [];
        this.wrongGuesses = 0;
        this.maxWrongGuesses = 6;
        this.gameActive = true;
        this.soundEnabled = true;
        this.hintUsed = false;

        // Estatísticas
        this.stats = {
            wins: 0,
            games: 0
        };

        // Elementos do DOM
        this.canvas = document.getElementById('hangman-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.wordDisplay = document.getElementById('word-display');
        this.categoryDisplay = document.getElementById('category');
        this.hintBox = document.getElementById('hint-box');
        this.hintText = document.getElementById('hint-text');
        this.livesDisplay = document.getElementById('lives');
        this.correctDisplay = document.getElementById('correct');
        this.wrongDisplay = document.getElementById('wrong');
        this.statusDisplay = document.getElementById('game-status');
        this.keyboard = document.getElementById('keyboard');
        this.restartBtn = document.getElementById('restart-btn');
        this.soundBtn = document.getElementById('sound-btn');
        this.hintBtn = document.getElementById('hint-btn');
        this.winsDisplay = document.getElementById('wins');
        this.gamesDisplay = document.getElementById('games');

        this.init();
    }

    async init() {
        // Carregar estatísticas
        this.loadStats();

        // Carregar estatísticas do banco de dados primeiro
        await this.loadStatsFromDatabase();

        // Criar teclado
        this.createKeyboard();

        // Event listeners
        this.restartBtn.addEventListener('click', () => this.newGame());
        this.soundBtn.addEventListener('click', () => this.toggleSound());
        this.hintBtn.addEventListener('click', () => this.showHint());

        // Suporte para teclado físico
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Iniciar primeiro jogo
        this.newGame();
    }

    newGame() {
        // Escolher palavra aleatória
        const wordData = this.wordBank[Math.floor(Math.random() * this.wordBank.length)];
        this.currentWord = wordData.word;
        this.currentCategory = wordData.category;
        this.currentHint = wordData.hint;

        // Reset estado
        this.guessedLetters = [];
        this.wrongGuesses = 0;
        this.gameActive = true;
        this.hintUsed = false;
        this.hintBox.style.display = 'none';
        this.hintBtn.disabled = false;

        // Resetar teclado
        document.querySelectorAll('.key').forEach(key => {
            key.classList.remove('disabled');
        });

        // Atualizar display
        this.categoryDisplay.textContent = this.currentCategory;
        this.drawHangman();
        this.updateDisplay();
        this.statusDisplay.innerHTML = '<i class="fas fa-search icon-red"></i> Adivinhe a palavra!';
    }

    createKeyboard() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        this.keyboard.innerHTML = '';

        letters.forEach(letter => {
            const key = document.createElement('button');
            key.className = 'key';
            key.textContent = letter;
            key.dataset.letter = letter;
            key.addEventListener('click', () => this.guessLetter(letter));
            this.keyboard.appendChild(key);
        });
    }

    handleKeyPress(e) {
        if (!this.gameActive) return;

        const letter = e.key.toUpperCase();
        if (/^[A-Z]$/.test(letter)) {
            this.guessLetter(letter);
        }
    }

    guessLetter(letter) {
        if (!this.gameActive || this.guessedLetters.includes(letter)) {
            return;
        }

        this.guessedLetters.push(letter);

        // Desabilitar tecla
        const key = document.querySelector(`[data-letter="${letter}"]`);
        if (key) {
            key.classList.add('disabled');
        }

        // Verificar se a letra está na palavra
        if (this.currentWord.includes(letter)) {
            this.playSound('correct');
            this.updateDisplay();
            this.checkWin();
        } else {
            this.wrongGuesses++;
            this.playSound('wrong');
            this.drawHangman();
            this.updateDisplay();
            this.checkLoss();
        }
    }

    updateDisplay() {
        // Atualizar palavra
        let displayWord = '';
        for (let char of this.currentWord) {
            if (this.guessedLetters.includes(char)) {
                displayWord += char + ' ';
            } else {
                displayWord += '_ ';
            }
        }
        this.wordDisplay.textContent = displayWord.trim();

        // Atualizar informações
        this.livesDisplay.textContent = this.maxWrongGuesses - this.wrongGuesses;
        this.correctDisplay.textContent = this.guessedLetters.filter(l => this.currentWord.includes(l)).length;
        this.wrongDisplay.textContent = this.wrongGuesses;
        this.winsDisplay.textContent = this.stats.wins;
        this.gamesDisplay.textContent = this.stats.games;
    }

    drawHangman() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';

        // Base
        ctx.beginPath();
        ctx.moveTo(50, 350);
        ctx.lineTo(200, 350);
        ctx.stroke();

        // Poste vertical
        ctx.beginPath();
        ctx.moveTo(100, 350);
        ctx.lineTo(100, 50);
        ctx.stroke();

        // Poste horizontal
        ctx.beginPath();
        ctx.moveTo(100, 50);
        ctx.lineTo(250, 50);
        ctx.stroke();

        // Corda
        ctx.beginPath();
        ctx.moveTo(250, 50);
        ctx.lineTo(250, 100);
        ctx.stroke();

        // Desenhar partes do boneco baseado nos erros
        if (this.wrongGuesses >= 1) {
            // Cabeça
            ctx.beginPath();
            ctx.arc(250, 130, 30, 0, Math.PI * 2);
            ctx.stroke();
        }

        if (this.wrongGuesses >= 2) {
            // Corpo
            ctx.beginPath();
            ctx.moveTo(250, 160);
            ctx.lineTo(250, 260);
            ctx.stroke();
        }

        if (this.wrongGuesses >= 3) {
            // Braço esquerdo
            ctx.beginPath();
            ctx.moveTo(250, 180);
            ctx.lineTo(220, 220);
            ctx.stroke();
        }

        if (this.wrongGuesses >= 4) {
            // Braço direito
            ctx.beginPath();
            ctx.moveTo(250, 180);
            ctx.lineTo(280, 220);
            ctx.stroke();
        }

        if (this.wrongGuesses >= 5) {
            // Perna esquerda
            ctx.beginPath();
            ctx.moveTo(250, 260);
            ctx.lineTo(220, 320);
            ctx.stroke();
        }

        if (this.wrongGuesses >= 6) {
            // Perna direita
            ctx.beginPath();
            ctx.moveTo(250, 260);
            ctx.lineTo(280, 320);
            ctx.stroke();
        }
    }

    showHint() {
        if (!this.hintUsed && this.gameActive) {
            this.hintUsed = true;
            this.hintBox.style.display = 'block';
            this.hintText.textContent = this.currentHint;
            this.hintBtn.disabled = true;
            this.playSound('hint');
        }
    }

    checkWin() {
        const allLettersGuessed = this.currentWord.split('').every(letter => 
            this.guessedLetters.includes(letter)
        );

        if (allLettersGuessed) {
            this.gameActive = false;
            this.statusDisplay.innerHTML = '<i class="fas fa-trophy icon-red"></i> Você venceu!';
            this.stats.wins++;
            this.stats.games++;
            this.saveStats();
            this.updateDisplay();
            this.playSound('win');
            
            // Salvar no banco de dados após atualizar display
            this.saveStatsToDatabase(true);
        }
    }

    checkLoss() {
        if (this.wrongGuesses >= this.maxWrongGuesses) {
            this.gameActive = false;
            this.statusDisplay.innerHTML = `<i class="fas fa-skull icon-red"></i> Perdeu! A palavra era: ${this.currentWord}`;
            this.stats.games++;
            this.saveStats();
            this.updateDisplay();
            this.playSound('lose');
            
            // Salvar no banco de dados após atualizar display
            this.saveStatsToDatabase(false);
        }
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
            case 'correct':
                oscillator.frequency.value = 600;
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
            case 'wrong':
                oscillator.frequency.value = 200;
                gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
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
                gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
                break;
            case 'hint':
                oscillator.frequency.value = 500;
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.15);
                break;
        }
    }

    saveStats() {
        localStorage.setItem('hangman-stats', JSON.stringify(this.stats));
    }

    loadStats() {
        const saved = localStorage.getItem('hangman-stats');
        if (saved) {
            this.stats = JSON.parse(saved);
        }
    }

    async loadStatsFromDatabase() {
        // Carregar estatísticas do banco de dados
        if (typeof DDGConfig !== 'undefined' && DDGConfig.utils && DDGConfig.utils.getGameStats) {
            try {
                const stats = await DDGConfig.utils.getGameStats('jogodaforca');
                if (stats) {
                    this.stats.wins = stats.games_won || 0;
                    this.stats.games = stats.games_played || 0;
                    this.updateDisplay();
                }
            } catch (err) {
                console.log('Erro ao carregar estatísticas do banco de dados');
            }
        }
    }

    async saveStatsToDatabase(won) {
        // Salvar no banco de dados
        if (typeof DDGConfig !== 'undefined' && DDGConfig.utils && DDGConfig.utils.saveGameStats) {
            try {
                console.log('Tentando salvar estatísticas no banco de dados...', { won, stats: this.stats });
                const result = await DDGConfig.utils.saveGameStats('jogodaforca', {
                    score: won ? 1 : 0,
                    won: won,
                    time: 0
                });
                console.log('Resultado do salvamento:', result);
            } catch (err) {
                console.error('Erro ao salvar estatísticas no banco de dados:', err);
            }
        } else {
            console.error('DDGConfig.utils.saveGameStats não está disponível');
        }
    }
}

// Inicializar o jogo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new HangmanGame();
});