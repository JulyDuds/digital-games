/**
 * Wordle Game - Digital Detective Games
 * Jogo de adivinhar palavras de 5 letras
 */

class WordleGame {
    constructor() {
        // Banco de palavras de 5 letras
        this.wordList = [
            'AMIGO', 'AMOR', 'BARCO', 'BEBER', 'BESTA', 'BRAVO', 'CARRO', 'CERVO',
            'CINCO', 'COISA', 'DENTE', 'FAZER', 'FALAR', 'FELIZ', 'FORCA', 'FORTE',
            'GENTE', 'GRANDE', 'HOMEM', 'HONRA', 'HOTEL', 'JOGAR', 'JOVEM', 'LEGAL',
            'LENTO', 'LIMPO', 'LIVRE', 'LOUCO', 'LUGAR', 'MAIOR', 'MENOR', 'METAL',
            'MOEDA', 'MORTE', 'MUNDO', 'NOBRE', 'NORTE', 'NOITE', 'NUNCA', 'ORDEM',
            'PAPEL', 'PERTO', 'PLANO', 'PODER', 'PONTO', 'PORTA', 'PRETO', 'QUEDA',
            'RAPAZ', 'REINO', 'ROSTO', 'SANTO', 'SENSO', 'SOBRE', 'TEMPO', 'TERRA',
            'TOMAR', 'TOTAL', 'TRONO', 'TURNO', 'VALOR', 'VELHO', 'VERDE', 'VINDA',
            'VIVER', 'VOLTAR', 'COMUM', 'CERTO', 'CLARO', 'SENHA', 'TECLA', 'MOUSE',
            'TELA', 'DADOS', 'VIRUS', 'LOGIN', 'EMAIL', 'REDE', 'SITE', 'JOGOS'
        ];

        // Estado do jogo
        this.targetWord = '';
        this.currentRow = 0;
        this.currentCol = 0;
        this.guesses = [];
        this.currentGuess = '';
        this.gameActive = true;
        this.soundEnabled = true;

        // Estatísticas
        this.stats = {
            wins: 0,
            games: 0,
            streak: 0
        };

        // Elementos DOM
        this.board = document.getElementById('wordle-board');
        this.keyboard = document.getElementById('keyboard');
        this.currentRowDisplay = document.getElementById('current-row');
        this.streakDisplay = document.getElementById('streak');
        this.statusDisplay = document.getElementById('game-status');
        this.messageBox = document.getElementById('message-box');
        this.restartBtn = document.getElementById('restart-btn');
        this.soundBtn = document.getElementById('sound-btn');
        this.winsDisplay = document.getElementById('wins');
        this.gamesDisplay = document.getElementById('games');

        this.init();
    }

    init() {
        // Carregar estatísticas
        this.loadStats();

        // Criar tabuleiro
        this.createBoard();

        // Criar teclado
        this.createKeyboard();

        // Event listeners
        this.restartBtn.addEventListener('click', () => this.newGame());
        this.soundBtn.addEventListener('click', () => this.toggleSound());

        // Teclado físico
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Iniciar jogo
        this.newGame();
    }

    newGame() {
        // Escolher palavra aleatória
        this.targetWord = this.wordList[Math.floor(Math.random() * this.wordList.length)];
        
        // Reset estado
        this.currentRow = 0;
        this.currentCol = 0;
        this.guesses = [];
        this.currentGuess = '';
        this.gameActive = true;

        // Limpar tabuleiro
        document.querySelectorAll('.letter-box').forEach(box => {
            box.textContent = '';
            box.className = 'letter-box';
        });

        // Limpar teclado
        document.querySelectorAll('.key').forEach(key => {
            key.className = key.dataset.letter ? 'key' : 'key ' + (key.dataset.action || '');
        });

        this.updateDisplay();
        this.statusDisplay.textContent = 'Adivinhe a palavra de 5 letras!';
        this.messageBox.style.display = 'none';
        this.updateCurrentBox();
    }

    createBoard() {
        this.board.innerHTML = '';
        
        for (let row = 0; row < 6; row++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'wordle-row';
            
            for (let col = 0; col < 5; col++) {
                const letterBox = document.createElement('div');
                letterBox.className = 'letter-box';
                letterBox.dataset.row = row;
                letterBox.dataset.col = col;
                rowDiv.appendChild(letterBox);
            }
            
            this.board.appendChild(rowDiv);
        }
    }

    createKeyboard() {
        const rows = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '←']
        ];

        this.keyboard.innerHTML = '';
        
        rows.forEach((row, rowIndex) => {
            row.forEach(letter => {
                const key = document.createElement('button');
                
                if (letter === 'ENTER') {
                    key.className = 'key enter';
                    key.textContent = 'ENTER';
                    key.dataset.action = 'enter';
                } else if (letter === '←') {
                    key.className = 'key backspace';
                    key.innerHTML = '<i class="fas fa-backspace"></i>';
                    key.dataset.action = 'backspace';
                } else {
                    key.className = 'key';
                    key.textContent = letter;
                    key.dataset.letter = letter;
                }
                
                key.addEventListener('click', () => this.handleKeyClick(letter));
                this.keyboard.appendChild(key);
            });
        });
    }

    handleKeyPress(e) {
        if (!this.gameActive) return;

        const key = e.key.toUpperCase();

        if (/^[A-Z]$/.test(key)) {
            this.addLetter(key);
        } else if (e.key === 'Enter') {
            this.submitGuess();
        } else if (e.key === 'Backspace') {
            this.removeLetter();
        }
    }

    handleKeyClick(letter) {
        if (!this.gameActive) return;

        if (letter === 'ENTER') {
            this.submitGuess();
        } else if (letter === '←') {
            this.removeLetter();
        } else {
            this.addLetter(letter);
        }
    }

    addLetter(letter) {
        if (this.currentCol < 5) {
            this.currentGuess += letter;
            this.currentCol++;
            this.updateBoard();
            this.playSound('type');
        }
    }

    removeLetter() {
        if (this.currentCol > 0) {
            this.currentGuess = this.currentGuess.slice(0, -1);
            this.currentCol--;
            this.updateBoard();
            this.playSound('type');
        }
    }

    submitGuess() {
        if (this.currentCol !== 5) {
            this.showMessage('Palavra incompleta!', 'error');
            return;
        }

        // Verificar feedback
        this.checkGuess();
        this.guesses.push(this.currentGuess);

        // Verificar vitória
        if (this.currentGuess === this.targetWord) {
            this.gameActive = false;
            this.stats.wins++;
            this.stats.streak++;
            this.stats.games++;
            this.showMessage(`🎉 Parabéns! A palavra era ${this.targetWord}!`, 'success');
            this.statusDisplay.textContent = '🎉 Você venceu!';
            this.playSound('win');
            this.saveStats();
            this.updateDisplay();
            return;
        }

        // Próxima linha
        this.currentRow++;
        this.currentCol = 0;
        this.currentGuess = '';

        if (this.currentRow >= 6) {
            // Game over
            this.gameActive = false;
            this.stats.games++;
            this.stats.streak = 0;
            this.showMessage(`😢 A palavra era: ${this.targetWord}`, 'error');
            this.statusDisplay.textContent = `💀 Game Over! Palavra: ${this.targetWord}`;
            this.playSound('lose');
            this.saveStats();
            this.updateDisplay();
        } else {
            this.updateBoard();
        }
    }

    checkGuess() {
        const guess = this.currentGuess;
        const target = this.targetWord;
        const result = [];
        const targetLetters = target.split('');
        const guessLetters = guess.split('');

        // Primeiro passar: marcar corretos
        for (let i = 0; i < 5; i++) {
            if (guessLetters[i] === targetLetters[i]) {
                result[i] = 'correct';
                targetLetters[i] = null;
                guessLetters[i] = null;
            }
        }

        // Segundo passar: marcar presentes
        for (let i = 0; i < 5; i++) {
            if (guessLetters[i] !== null) {
                const targetIndex = targetLetters.indexOf(guessLetters[i]);
                if (targetIndex !== -1) {
                    result[i] = 'present';
                    targetLetters[targetIndex] = null;
                } else {
                    result[i] = 'absent';
                }
            }
        }

        // Aplicar cores ao tabuleiro
        for (let i = 0; i < 5; i++) {
            const box = document.querySelector(`.letter-box[data-row="${this.currentRow}"][data-col="${i}"]`);
            box.classList.add(result[i]);

            // Atualizar teclado
            const letter = guess[i];
            const key = document.querySelector(`.key[data-letter="${letter}"]`);
            if (key && !key.classList.contains('correct')) {
                if (result[i] === 'correct') {
                    key.className = 'key correct';
                } else if (result[i] === 'present' && !key.classList.contains('present')) {
                    key.className = 'key present';
                } else if (result[i] === 'absent') {
                    key.classList.add('absent');
                }
            }
        }
    }

    updateBoard() {
        // Limpar linha atual
        for (let col = 0; col < 5; col++) {
            const box = document.querySelector(`.letter-box[data-row="${this.currentRow}"][data-col="${col}"]`);
            if (box && !box.classList.contains('correct') && 
                !box.classList.contains('present') && 
                !box.classList.contains('absent')) {
                box.textContent = this.currentGuess[col] || '';
                box.classList.remove('current');
            }
        }

        this.updateCurrentBox();
    }

    updateCurrentBox() {
        // Destacar caixa atual
        document.querySelectorAll('.letter-box').forEach(box => {
            box.classList.remove('current');
        });

        if (this.gameActive && this.currentCol < 5) {
            const currentBox = document.querySelector(
                `.letter-box[data-row="${this.currentRow}"][data-col="${this.currentCol}"]`
            );
            if (currentBox) {
                currentBox.classList.add('current');
            }
        }
    }

    showMessage(text, type) {
        this.messageBox.textContent = text;
        this.messageBox.className = 'message-box ' + type;
        this.messageBox.style.display = 'block';

        setTimeout(() => {
            this.messageBox.style.display = 'none';
        }, 3000);
    }

    updateDisplay() {
        this.currentRowDisplay.textContent = this.currentRow + 1;
        this.streakDisplay.textContent = this.stats.streak;
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
            case 'type':
                oscillator.frequency.value = 400;
                gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.05);
                break;
            case 'win':
                oscillator.frequency.value = 800;
                gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
                break;
            case 'lose':
                oscillator.frequency.value = 150;
                gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
                break;
        }
    }

    saveStats() {
        localStorage.setItem('wordle-stats', JSON.stringify(this.stats));
    }

    loadStats() {
        const saved = localStorage.getItem('wordle-stats');
        if (saved) {
            this.stats = JSON.parse(saved);
        }
    }
}

// Inicializar o jogo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new WordleGame();
});

