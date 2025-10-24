/**
 * Pong Game - Digital Detective Games
 * Jogo clássico Pong com IA e diferentes níveis de dificuldade
 */

class PongGame {
    constructor() {
        // Canvas e contexto
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Configurações de dificuldade
        this.difficulties = {
            easy: { aiSpeed: 3, ballSpeed: 4, aiError: 30 },
            medium: { aiSpeed: 5, ballSpeed: 6, aiError: 20 },
            hard: { aiSpeed: 7, ballSpeed: 8, aiError: 10 }
        };

        this.currentDifficulty = 'medium';

        // Estado do jogo
        this.gameRunning = false;
        this.gamePaused = false;
        this.soundEnabled = true;

        // Placar
        this.playerScore = 0;
        this.aiScore = 0;
        this.maxScore = 5;

        // Estatísticas
        this.stats = {
            wins: 0,
            games: 0
        };

        // Raquetes
        this.paddleWidth = 15;
        this.paddleHeight = 80;
        this.paddleSpeed = 8;

        this.player = {
            x: 30,
            y: this.canvas.height / 2 - this.paddleHeight / 2,
            dy: 0
        };

        this.ai = {
            x: this.canvas.width - 30 - this.paddleWidth,
            y: this.canvas.height / 2 - this.paddleHeight / 2,
            dy: 0
        };

        // Bola
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 8,
            dx: 0,
            dy: 0,
            speed: 6
        };

        // Controles
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            w: false,
            s: false
        };

        // Elementos DOM
        this.playerScoreDisplay = document.getElementById('player-score');
        this.aiScoreDisplay = document.getElementById('ai-score');
        this.statusDisplay = document.getElementById('game-status');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
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
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.soundBtn.addEventListener('click', () => this.toggleSound());

        this.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.changeDifficulty(e.target.dataset.difficulty);
            });
        });

        // Controles do teclado
        document.addEventListener('keydown', (e) => {
            if (e.key in this.keys) {
                this.keys[e.key] = true;
                e.preventDefault();
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key in this.keys) {
                this.keys[e.key] = false;
                e.preventDefault();
            }
        });

        // Desenhar estado inicial
        this.draw();
        this.updateDisplay();
    }

    startGame() {
        if (this.gameRunning) return;

        this.gameRunning = true;
        this.gamePaused = false;
        this.playerScore = 0;
        this.aiScore = 0;
        this.resetBall();
        
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.statusDisplay.innerHTML = '<i class="fas fa-running icon-red"></i> Jogo em andamento!';

        this.gameLoop();
    }

    togglePause() {
        if (!this.gameRunning) return;

        this.gamePaused = !this.gamePaused;

        if (this.gamePaused) {
            this.statusDisplay.innerHTML = '<i class="fas fa-pause icon-red"></i> Jogo pausado';
            this.pauseBtn.querySelector('i').className = 'fas fa-play';
            this.pauseBtn.innerHTML = '<i class="fas fa-play"></i> Continuar';
        } else {
            this.statusDisplay.innerHTML = '<i class="fas fa-running icon-red"></i> Jogo em andamento!';
            this.pauseBtn.querySelector('i').className = 'fas fa-pause';
            this.pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pausar';
            this.gameLoop();
        }
    }

    resetBall() {
        const config = this.difficulties[this.currentDifficulty];
        
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.speed = config.ballSpeed;
        
        const angle = (Math.random() * Math.PI / 2) - Math.PI / 4;
        const direction = Math.random() < 0.5 ? 1 : -1;
        
        this.ball.dx = direction * this.ball.speed * Math.cos(angle);
        this.ball.dy = this.ball.speed * Math.sin(angle);
    }

    gameLoop() {
        if (!this.gameRunning || this.gamePaused) return;

        this.update();
        this.draw();

        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        // Mover jogador
        if (this.keys.ArrowUp || this.keys.w) {
            this.player.y -= this.paddleSpeed;
        }
        if (this.keys.ArrowDown || this.keys.s) {
            this.player.y += this.paddleSpeed;
        }

        // Limitar movimento do jogador
        this.player.y = Math.max(0, Math.min(this.canvas.height - this.paddleHeight, this.player.y));

        // IA melhorada
        const config = this.difficulties[this.currentDifficulty];
        const aiCenter = this.ai.y + this.paddleHeight / 2;
        const ballCenter = this.ball.y;
        const error = (Math.random() - 0.5) * config.aiError;

        if (this.ball.dx > 0) {
            if (aiCenter < ballCenter + error - 5) {
                this.ai.y += config.aiSpeed;
            } else if (aiCenter > ballCenter + error + 5) {
                this.ai.y -= config.aiSpeed;
            }
        }

        // Limitar movimento da IA
        this.ai.y = Math.max(0, Math.min(this.canvas.height - this.paddleHeight, this.ai.y));

        // Mover bola
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        // Colisão com paredes superior e inferior
        if (this.ball.y - this.ball.radius < 0 || this.ball.y + this.ball.radius > this.canvas.height) {
            this.ball.dy = -this.ball.dy;
            this.playSound('wall');
        }

        // Colisão com raquete do jogador
        if (this.ball.x - this.ball.radius < this.player.x + this.paddleWidth &&
            this.ball.x + this.ball.radius > this.player.x &&
            this.ball.y > this.player.y &&
            this.ball.y < this.player.y + this.paddleHeight) {
            
            const hitPos = (this.ball.y - (this.player.y + this.paddleHeight / 2)) / (this.paddleHeight / 2);
            this.ball.dx = Math.abs(this.ball.dx);
            this.ball.dy = hitPos * this.ball.speed;
            
            // Aumentar velocidade gradualmente
            this.ball.speed += 0.2;
            this.ball.dx *= 1.05;
            
            this.ball.x = this.player.x + this.paddleWidth + this.ball.radius;
            this.playSound('paddle');
        }

        // Colisão com raquete da IA
        if (this.ball.x + this.ball.radius > this.ai.x &&
            this.ball.x - this.ball.radius < this.ai.x + this.paddleWidth &&
            this.ball.y > this.ai.y &&
            this.ball.y < this.ai.y + this.paddleHeight) {
            
            const hitPos = (this.ball.y - (this.ai.y + this.paddleHeight / 2)) / (this.paddleHeight / 2);
            this.ball.dx = -Math.abs(this.ball.dx);
            this.ball.dy = hitPos * this.ball.speed;
            
            this.ball.speed += 0.2;
            this.ball.dx *= 1.05;
            
            this.ball.x = this.ai.x - this.ball.radius;
            this.playSound('paddle');
        }

        // Pontuação
        if (this.ball.x - this.ball.radius < 0) {
            this.aiScore++;
            this.playSound('score');
            this.checkGameEnd();
            this.resetBall();
        } else if (this.ball.x + this.ball.radius > this.canvas.width) {
            this.playerScore++;
            this.playSound('score');
            this.checkGameEnd();
            this.resetBall();
        }

        this.updateDisplay();
    }

    checkGameEnd() {
        if (this.playerScore >= this.maxScore || this.aiScore >= this.maxScore) {
            this.gameRunning = false;
            this.startBtn.disabled = false;
            this.pauseBtn.disabled = true;
            this.pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pausar';

            if (this.playerScore > this.aiScore) {
                this.statusDisplay.innerHTML = '<i class="fas fa-trophy icon-red"></i> Você venceu!';
                this.stats.wins++;
                this.playSound('win');
            } else {
                this.statusDisplay.innerHTML = '<i class="fas fa-robot icon-red"></i> IA venceu!';
                this.playSound('lose');
            }

            this.stats.games++;
            this.saveStats();
            this.updateDisplay();
        }
    }

    draw() {
        // Limpar canvas
        this.ctx.fillStyle = '#242424';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Linha central
        this.ctx.strokeStyle = '#808080';
        this.ctx.setLineDash([10, 10]);
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Raquete do jogador
        this.ctx.fillStyle = '#FD0100';
        this.ctx.fillRect(this.player.x, this.player.y, this.paddleWidth, this.paddleHeight);

        // Raquete da IA
        this.ctx.fillStyle = '#CBDCC1';
        this.ctx.fillRect(this.ai.x, this.ai.y, this.paddleWidth, this.paddleHeight);

        // Bola
        this.ctx.fillStyle = '#FD0100';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    changeDifficulty(difficulty) {
        if (this.gameRunning) return;

        this.currentDifficulty = difficulty;

        this.difficultyBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.difficulty === difficulty) {
                btn.classList.add('active');
            }
        });
    }

    updateDisplay() {
        this.playerScoreDisplay.textContent = this.playerScore;
        this.aiScoreDisplay.textContent = this.aiScore;
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
            case 'paddle':
                oscillator.frequency.value = 440;
                gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
            case 'wall':
                oscillator.frequency.value = 330;
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
            case 'score':
                oscillator.frequency.value = 600;
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
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
        localStorage.setItem('pong-stats', JSON.stringify(this.stats));
    }

    loadStats() {
        const saved = localStorage.getItem('pong-stats');
        if (saved) {
            this.stats = JSON.parse(saved);
        }
    }
}

// Inicializar o jogo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new PongGame();
});