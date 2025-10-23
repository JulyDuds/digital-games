// Gerenciador de Janelas - Digital Detective Games
class WindowManager {
    constructor() {
        this.windows = new Map();
        this.zIndexCounter = 1000;
        this.activeWindow = null;
        this.init();
    }

    init() {
        // Event listeners para ícones do desktop
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            icon.addEventListener('dblclick', () => {
                const gameName = icon.dataset.game;
                this.openWindow(gameName);
            });
        });

        // Start button e menu
        const startButton = document.getElementById('start-button');
        const startMenu = document.getElementById('start-menu');

        startButton.addEventListener('click', (e) => {
            e.stopPropagation();
            startMenu.classList.toggle('hidden');
        });

        // Fechar menu ao clicar fora
        document.addEventListener('click', (e) => {
            if (!startMenu.contains(e.target) && !startButton.contains(e.target)) {
                startMenu.classList.add('hidden');
            }
        });

        // Ações do menu
        document.querySelectorAll('.start-menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                this.handleMenuAction(action);
                startMenu.classList.add('hidden');
            });
        });

        // Atualizar relógio
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    handleMenuAction(action) {
        switch(action) {
            case 'about':
                window.open('about.html', '_blank');
                break;
            case 'demo':
                window.open('demo.html', '_blank');
                break;
            case 'help':
                window.open('INSTALL.md', '_blank');
                break;
            case 'reset':
                if (confirm('Tem certeza que deseja resetar todas as estatísticas? Esta ação não pode ser desfeita.')) {
                    // Limpar todas as estatísticas do localStorage
                    ['tictactoe-scores', 'minesweeper-stats', 'hangman-stats', 'pong-stats', 'memory-stats', 'snake-highscore', 'wordle-stats', 'solitaire-stats'].forEach(key => {
                        localStorage.removeItem(key);
                    });
                    alert('Estatísticas resetadas com sucesso!');
                    // Recarregar página
                    location.reload();
                }
                break;
        }
    }

    openWindow(gameName) {
        // Se a janela já existe, apenas focus nela
        if (this.windows.has(gameName)) {
            this.focusWindow(gameName);
            return;
        }

        const gameConfig = this.getGameConfig(gameName);
        if (!gameConfig) return;

        // Criar janela a partir do template
        const template = document.getElementById('window-template');
        const windowEl = template.content.cloneNode(true).querySelector('.window');
        
        // Configurar janela
        windowEl.dataset.game = gameName;
        windowEl.querySelector('.window-title').textContent = gameConfig.title;
        windowEl.querySelector('iframe').src = gameConfig.url;

        // Posicionar janela (cascata)
        const offset = this.windows.size * 30;
        windowEl.style.left = `${100 + offset}px`;
        windowEl.style.top = `${50 + offset}px`;
        windowEl.style.width = `${gameConfig.width}px`;
        windowEl.style.height = `${gameConfig.height}px`;
        windowEl.style.zIndex = ++this.zIndexCounter;

        // Adicionar ao DOM
        document.body.appendChild(windowEl);

        // Configurar event listeners
        this.setupWindowEvents(windowEl, gameName);

        // Adicionar à lista de janelas
        this.windows.set(gameName, {
            element: windowEl,
            config: gameConfig,
            isMaximized: false,
            isMinimized: false,
            previousState: null
        });

        // Adicionar à taskbar
        this.addToTaskbar(gameName, gameConfig.title);

        // Focar na janela
        this.focusWindow(gameName);
    }

    setupWindowEvents(windowEl, gameName) {
        const titlebar = windowEl.querySelector('.window-titlebar');
        const minimizeBtn = windowEl.querySelector('.minimize-btn');
        const maximizeBtn = windowEl.querySelector('.maximize-btn');
        const closeBtn = windowEl.querySelector('.close-btn');

        // Arrastar janela
        let isDragging = false;
        let dragOffsetX = 0;
        let dragOffsetY = 0;

        titlebar.addEventListener('mousedown', (e) => {
            if (e.target.closest('.window-controls')) return;
            if (this.windows.get(gameName).isMaximized) return;

            isDragging = true;
            dragOffsetX = e.clientX - windowEl.offsetLeft;
            dragOffsetY = e.clientY - windowEl.offsetTop;
            this.focusWindow(gameName);
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const newX = e.clientX - dragOffsetX;
            const newY = e.clientY - dragOffsetY;

            windowEl.style.left = `${Math.max(0, newX)}px`;
            windowEl.style.top = `${Math.max(0, newY)}px`;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Redimensionar janela
        this.setupResizeHandles(windowEl, gameName);

        // Controles da janela
        minimizeBtn.addEventListener('click', () => this.minimizeWindow(gameName));
        maximizeBtn.addEventListener('click', () => this.toggleMaximize(gameName));
        closeBtn.addEventListener('click', () => this.closeWindow(gameName));

        // Focar ao clicar
        windowEl.addEventListener('mousedown', () => this.focusWindow(gameName));

        // Duplo clique na barra de título para maximizar
        titlebar.addEventListener('dblclick', (e) => {
            if (!e.target.closest('.window-controls')) {
                this.toggleMaximize(gameName);
            }
        });
    }

    setupResizeHandles(windowEl, gameName) {
        const handles = windowEl.querySelectorAll('.resize-handle');
        
        handles.forEach(handle => {
            let isResizing = false;
            let startX, startY, startWidth, startHeight, startLeft, startTop;

            handle.addEventListener('mousedown', (e) => {
                if (this.windows.get(gameName).isMaximized) return;

                isResizing = true;
                startX = e.clientX;
                startY = e.clientY;
                startWidth = windowEl.offsetWidth;
                startHeight = windowEl.offsetHeight;
                startLeft = windowEl.offsetLeft;
                startTop = windowEl.offsetTop;

                e.stopPropagation();
                this.focusWindow(gameName);
            });

            document.addEventListener('mousemove', (e) => {
                if (!isResizing) return;

                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;

                const minWidth = 400;
                const minHeight = 300;

                if (handle.classList.contains('resize-e')) {
                    windowEl.style.width = `${Math.max(minWidth, startWidth + deltaX)}px`;
                } else if (handle.classList.contains('resize-w')) {
                    const newWidth = Math.max(minWidth, startWidth - deltaX);
                    if (newWidth > minWidth) {
                        windowEl.style.width = `${newWidth}px`;
                        windowEl.style.left = `${startLeft + deltaX}px`;
                    }
                } else if (handle.classList.contains('resize-s')) {
                    windowEl.style.height = `${Math.max(minHeight, startHeight + deltaY)}px`;
                } else if (handle.classList.contains('resize-n')) {
                    const newHeight = Math.max(minHeight, startHeight - deltaY);
                    if (newHeight > minHeight) {
                        windowEl.style.height = `${newHeight}px`;
                        windowEl.style.top = `${startTop + deltaY}px`;
                    }
                } else if (handle.classList.contains('resize-se')) {
                    windowEl.style.width = `${Math.max(minWidth, startWidth + deltaX)}px`;
                    windowEl.style.height = `${Math.max(minHeight, startHeight + deltaY)}px`;
                } else if (handle.classList.contains('resize-sw')) {
                    const newWidth = Math.max(minWidth, startWidth - deltaX);
                    if (newWidth > minWidth) {
                        windowEl.style.width = `${newWidth}px`;
                        windowEl.style.left = `${startLeft + deltaX}px`;
                    }
                    windowEl.style.height = `${Math.max(minHeight, startHeight + deltaY)}px`;
                } else if (handle.classList.contains('resize-ne')) {
                    windowEl.style.width = `${Math.max(minWidth, startWidth + deltaX)}px`;
                    const newHeight = Math.max(minHeight, startHeight - deltaY);
                    if (newHeight > minHeight) {
                        windowEl.style.height = `${newHeight}px`;
                        windowEl.style.top = `${startTop + deltaY}px`;
                    }
                } else if (handle.classList.contains('resize-nw')) {
                    const newWidth = Math.max(minWidth, startWidth - deltaX);
                    if (newWidth > minWidth) {
                        windowEl.style.width = `${newWidth}px`;
                        windowEl.style.left = `${startLeft + deltaX}px`;
                    }
                    const newHeight = Math.max(minHeight, startHeight - deltaY);
                    if (newHeight > minHeight) {
                        windowEl.style.height = `${newHeight}px`;
                        windowEl.style.top = `${startTop + deltaY}px`;
                    }
                }
            });

            document.addEventListener('mouseup', () => {
                isResizing = false;
            });
        });
    }

    minimizeWindow(gameName) {
        const window = this.windows.get(gameName);
        if (!window) return;

        window.isMinimized = true;
        window.element.classList.add('minimized');
        
        const taskbarApp = document.querySelector(`.taskbar-app[data-game="${gameName}"]`);
        if (taskbarApp) {
            taskbarApp.classList.remove('active');
        }
    }

    toggleMaximize(gameName) {
        const window = this.windows.get(gameName);
        if (!window) return;

        if (window.isMaximized) {
            // Restaurar
            window.element.classList.remove('maximized');
            if (window.previousState) {
                window.element.style.left = window.previousState.left;
                window.element.style.top = window.previousState.top;
                window.element.style.width = window.previousState.width;
                window.element.style.height = window.previousState.height;
            }
            window.isMaximized = false;
        } else {
            // Maximizar
            window.previousState = {
                left: window.element.style.left,
                top: window.element.style.top,
                width: window.element.style.width,
                height: window.element.style.height
            };
            window.element.classList.add('maximized');
            window.isMaximized = true;
        }
    }

    closeWindow(gameName) {
        const window = this.windows.get(gameName);
        if (!window) return;

        window.element.remove();
        this.windows.delete(gameName);
        this.removeFromTaskbar(gameName);
    }

    focusWindow(gameName) {
        const window = this.windows.get(gameName);
        if (!window) return;

        // Se estiver minimizada, restaurar
        if (window.isMinimized) {
            window.isMinimized = false;
            window.element.classList.remove('minimized');
        }

        // Trazer para frente
        window.element.style.zIndex = ++this.zIndexCounter;
        this.activeWindow = gameName;

        // Atualizar taskbar
        document.querySelectorAll('.taskbar-app').forEach(app => {
            app.classList.remove('active');
        });
        const taskbarApp = document.querySelector(`.taskbar-app[data-game="${gameName}"]`);
        if (taskbarApp) {
            taskbarApp.classList.add('active');
        }
    }

    addToTaskbar(gameName, title) {
        const taskbarApps = document.getElementById('taskbar-apps');
        const taskbarApp = document.createElement('div');
        taskbarApp.className = 'taskbar-app active';
        taskbarApp.dataset.game = gameName;
        taskbarApp.textContent = title;

        taskbarApp.addEventListener('click', () => {
            const window = this.windows.get(gameName);
            if (window.isMinimized || window.element.style.zIndex < this.zIndexCounter) {
                this.focusWindow(gameName);
            } else {
                this.minimizeWindow(gameName);
            }
        });

        taskbarApps.appendChild(taskbarApp);
    }

    removeFromTaskbar(gameName) {
        const taskbarApp = document.querySelector(`.taskbar-app[data-game="${gameName}"]`);
        if (taskbarApp) {
            taskbarApp.remove();
        }
    }

    getGameConfig(gameName) {
        const configs = {
            'tictactoe': {
                title: 'Tic-Tac-Toe',
                url: 'tictactoe.html',
                width: 700,
                height: 700
            },
            'minesweeper': {
                title: 'Campo Minado',
                url: 'minesweeper.html',
                width: 700,
                height: 700
            },
            'jogodaforca': {
                title: 'Jogo da Forca',
                url: 'jogodaforca.html',
                width: 900,
                height: 850
            },
            'pong': {
                title: 'Pong',
                url: 'pong.html',
                width: 900,
                height: 700
            },
            'memory': {
                title: 'Memory Game',
                url: 'memory.html',
                width: 700,
                height: 600
            },
            'snake': {
                title: 'Snake',
                url: 'snake.html',
                width: 800,
                height: 750
            },
            'wordle': {
                title: 'Wordle',
                url: 'wordle.html',
                width: 750,
                height: 850
            },
            'solitaire': {
                title: 'Paciência',
                url: 'solitaire.html',
                width: 900,
                height: 800
            }
        };

        return configs[gameName];
    }

    updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds}`;
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.windowManager = new WindowManager();
});

