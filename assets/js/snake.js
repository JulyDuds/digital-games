/**
 * Snake Game - DigitalGames
 * Jogo clássico da cobrinha
 */

class SnakeGame {
    constructor() {
        // Canvas e contexto
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Configurações do jogo
        this.gridSize = 20;
        this.tileCountX = this.canvas.width / this.gridSize;
        this.tileCountY = this.canvas.height / this.gridSize;

        // Estado do jogo
        this.snake = [{x: 10, y: 10}];
        this.food = {x: 5, y: 5};
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.highScore = 0;
        this.speed = 1;
        this.gameSpeed = 150;
        this.gameLoop = null;
        this.isPaused = false;
        this.isGameOver = false;
        this.soundEnabled = true;
        this.gameStartTime = null;
        this.currentTime = '00:00';
        this.timerInterval = null;
        this.gameRunning = false;

        // Estatísticas
        this.stats = {
            highScore: parseInt(localStorage.getItem('snake-highscore')) || 0,
            games: 0
        };

        // Elementos DOM
        this.currentScoreDisplay = document.getElementById('current-score');
        this.highScoreDisplay = document.getElementById('high-score');
        this.speedDisplay = document.getElementById('speed');
        this.scoreDisplay = document.getElementById('score');
        this.timeDisplay = document.getElementById('time');
        this.statusDisplay = document.getElementById('game-status');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.soundBtn = document.getElementById('sound-btn');
        
        // Controles mobile
        this.upBtn = document.getElementById('up-btn');
        this.downBtn = document.getElementById('down-btn');
        this.leftBtn = document.getElementById('left-btn');
        this.rightBtn = document.getElementById('right-btn');

        this.init();
    }

    init() {
        // Carregar recorde
        this.highScore = this.stats.highScore;
        this.highScoreDisplay.textContent = this.highScore;

        // Event listeners
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.soundBtn.addEventListener('click', () => this.toggleSound());

        // Controles do teclado
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Controles mobile
        this.upBtn.addEventListener('click', () => this.changeDirection('up'));
        this.downBtn.addEventListener('click', () => this.changeDirection('down'));
        this.leftBtn.addEventListener('click', () => this.changeDirection('left'));
        this.rightBtn.addEventListener('click', () => this.changeDirection('right'));

        // Desenhar estado inicial
        this.draw();
    }

    startGame() {
        if (this.gameRunning) return;

        // Reset estado
        this.snake = [{x: 10, y: 10}];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.speed = 1;
        this.gameSpeed = 150;
        this.isPaused = false;
        this.isGameOver = false;
        this.gameRunning = true;

        // Gerar comida
        this.generateFood();

        // Iniciar timer
        this.gameStartTime = Date.now();
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);

        // Atualizar UI
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.statusDisplay.innerHTML = '<i class="fas fa-running icon-red"></i> Jogo em andamento!';
        this.updateDisplay();

        // Iniciar loop do jogo
        this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
    }

    handleKeyPress(e) {
        if (!this.gameRunning) return;

        switch(e.key) {
            case 'ArrowUp':
                this.changeDirection('up');
                e.preventDefault();
                break;
            case 'ArrowDown':
                this.changeDirection('down');
                e.preventDefault();
                break;
            case 'ArrowLeft':
                this.changeDirection('left');
                e.preventDefault();
                break;
            case 'ArrowRight':
                this.changeDirection('right');
                e.preventDefault();
                break;
            case ' ':
                this.togglePause();
                e.preventDefault();
                break;
        }
    }

    changeDirection(newDirection) {
        // Prevenir movimento oposto
        if (this.direction === 'up' && newDirection === 'down') return;
        if (this.direction === 'down' && newDirection === 'up') return;
        if (this.direction === 'left' && newDirection === 'right') return;
        if (this.direction === 'right' && newDirection === 'left') return;

        this.nextDirection = newDirection;
    }

    update() {
        if (this.isPaused || this.isGameOver) return;

        // Atualizar direção
        this.direction = this.nextDirection;

        // Mover cobra
        const head = {x: this.snake[0].x, y: this.snake[0].y};

        switch(this.direction) {
            case 'up':
                head.y -= 1;
                break;
            case 'down':
                head.y += 1;
                break;
            case 'left':
                head.x -= 1;
                break;
            case 'right':
                head.x += 1;
                break;
        }

        // Verificar colisão com paredes
        if (head.x < 0 || head.x >= this.tileCountX || 
            head.y < 0 || head.y >= this.tileCountY) {
            this.gameOver();
            return;
        }

        // Verificar colisão com o próprio corpo
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.gameOver();
                return;
            }
        }

        // Adicionar nova cabeça
        this.snake.unshift(head);

        // Verificar se comeu a comida
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.generateFood();
            this.playSound('eat');

            // Aumentar velocidade a cada 50 pontos
            if (this.score % 50 === 0) {
                this.speed++;
                this.gameSpeed = Math.max(50, this.gameSpeed - 10);
                clearInterval(this.gameLoop);
                this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
            }

            this.updateDisplay();
        } else {
            // Remover cauda
            this.snake.pop();
        }

        this.draw();
    }

    generateFood() {
        let validPosition = false;
        
        while (!validPosition) {
            this.food = {
                x: Math.floor(Math.random() * this.tileCountX),
                y: Math.floor(Math.random() * this.tileCountY)
            };

            // Verificar se não está em cima da cobra
            validPosition = !this.snake.some(segment => 
                segment.x === this.food.x && segment.y === this.food.y
            );
        }
    }

    draw() {
        // Limpar canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Desenhar grade (opcional)
        this.ctx.strokeStyle = '#1a1a1a';
        this.ctx.lineWidth = 1;
        for (let x = 0; x < this.tileCountX; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.gridSize, 0);
            this.ctx.lineTo(x * this.gridSize, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.tileCountY; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.gridSize);
            this.ctx.lineTo(this.canvas.width, y * this.gridSize);
            this.ctx.stroke();
        }

        // Desenhar cobra 
        this.ctx.fillStyle = '#ff0000'; 
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            this.ctx.fillRect(
                segment.x * this.gridSize + 1, 
                segment.y * this.gridSize + 1, 
                this.gridSize - 2, 
                this.gridSize - 2
            );
        }

        // Desenhar cabeça
        const head = this.snake[0];
        this.ctx.fillStyle = '#fa6a6aff'; 
        this.ctx.fillRect(
            head.x * this.gridSize + 1, 
            head.y * this.gridSize + 1, 
            this.gridSize - 2, 
            this.gridSize - 2
        );
        
        // Adicionar borda branca na cabeça
        this.ctx.strokeStyle = '#ff4f4fff';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(
            head.x * this.gridSize + 1, 
            head.y * this.gridSize + 1, 
            this.gridSize - 2, 
            this.gridSize - 2
        );

        // Desenhar comida 
        this.ctx.fillStyle = '#c0c0c0'; // Cinza claro
        this.ctx.fillRect(
            this.food.x * this.gridSize + 1, 
            this.food.y * this.gridSize + 1, 
            this.gridSize - 2, 
            this.gridSize - 2
        );
        
        // Borda da comida
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(
            this.food.x * this.gridSize + 1, 
            this.food.y * this.gridSize + 1, 
            this.gridSize - 2, 
            this.gridSize - 2
        );
    }

    togglePause() {
        if (!this.gameRunning) return;

        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            this.statusDisplay.innerHTML = '<i class="fas fa-pause icon-red"></i> Jogo pausado';
            this.pauseBtn.innerHTML = '<i class="fas fa-play"></i> Continuar';
        } else {
            this.statusDisplay.innerHTML = '<i class="fas fa-running icon-red"></i> Jogo em andamento!';
            this.pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pausar';
        }
    }

    gameOver() {
        this.isGameOver = true;
        this.gameRunning = false;
        
        clearInterval(this.gameLoop);
        clearInterval(this.timerInterval);

        // Calcular tempo jogado
        const timePlayedSeconds = Math.floor((Date.now() - this.gameStartTime) / 1000);

        // Atualizar recorde
        const isNewHighScore = this.score > this.highScore;
        if (isNewHighScore) {
            this.highScore = this.score;
            this.stats.highScore = this.score;
            localStorage.setItem('snake-highscore', this.highScore);
            this.highScoreDisplay.textContent = this.highScore;
        }

        this.stats.games++;
        this.statusDisplay.innerHTML = `<i class="fas fa-skull icon-red"></i> Game Over! Pontuação: ${this.score}`;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pausar';

        this.playSound('gameover');

        // Salvar estatísticas no banco de dados
        if (typeof DDGConfig !== 'undefined' && DDGConfig.utils && DDGConfig.utils.saveGameStats) {
            DDGConfig.utils.saveGameStats('snake', {
                score: this.score,
                won: false, // Snake não tem vitória definida
                time: timePlayedSeconds
            }).catch(err => {
                console.log('Estatísticas salvas localmente, mas falhou no banco de dados');
            });
        }
    }

    updateTimer() {
        const elapsed = Math.floor((Date.now() - this.gameStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        this.currentTime = `${minutes}:${seconds}`;
        this.timeDisplay.textContent = this.currentTime;
    }

    updateDisplay() {
        this.currentScoreDisplay.textContent = this.score;
        this.scoreDisplay.textContent = this.score;
        this.speedDisplay.textContent = this.speed;
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
            case 'eat':
                oscillator.frequency.value = 600;
                gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
            case 'gameover':
                oscillator.frequency.value = 150;
                gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
                break;
        }
    }
}

// Inicializar o jogo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});