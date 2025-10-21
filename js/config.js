/**
 * Configurações Globais - Digital Detective Games
 * Centralize todas as configurações do projeto aqui
 */

const DDGConfig = {
    // Informações do projeto
    projectName: 'Digital Detective Games',
    version: '1.0.0',
    year: new Date().getFullYear(),

    // Configurações de som
    audio: {
        enabled: true,
        defaultVolume: 0.5,
        sounds: {
            move: { frequency: 400, duration: 0.1, gain: 0.1 },
            win: { frequency: 800, duration: 0.4, gain: 0.25 },
            lose: { frequency: 150, duration: 0.5, gain: 0.25 },
            click: { frequency: 600, duration: 0.1, gain: 0.15 }
        }
    },

    // Configurações de janelas
    windows: {
        minWidth: 400,
        minHeight: 300,
        defaultWidth: 700,
        defaultHeight: 600,
        cascade: {
            offsetX: 30,
            offsetY: 30,
            startX: 100,
            startY: 50
        }
    },

    // Configurações de jogos
    games: {
        tictactoe: {
            title: 'Tic-Tac-Toe',
            url: 'tictactoe.html',
            icon: 'fa-times',
            width: 600,
            height: 650,
            description: 'Jogo da Velha contra IA'
        },
        minesweeper: {
            title: 'Campo Minado',
            url: 'minesweeper.html',
            icon: 'fa-bomb',
            width: 700,
            height: 750,
            description: 'Encontre todas as minas'
        },
        jogodaforca: {
            title: 'Jogo da Forca',
            url: 'jogodaforca.html',
            icon: 'fa-user-secret',
            width: 800,
            height: 700,
            description: 'Adivinhe a palavra secreta'
        },
        pong: {
            title: 'Pong',
            url: 'pong.html',
            icon: 'fa-table-tennis',
            width: 700,
            height: 600,
            description: 'Clássico jogo de tênis de mesa'
        },
        memory: {
            title: 'Memory Game',
            url: 'memory.html',
            icon: 'fa-brain',
            width: 700,
            height: 700,
            description: 'Encontre todos os pares'
        }
    },

    // Paleta de cores (mesmas definidas no CSS)
    colors: {
        primary: '#242424',
        secondary: '#808080',
        accent: '#FD0100',
        light: '#CBDCC1',
        dark: '#1a1a1a'
    },

    // LocalStorage keys
    storage: {
        prefix: 'ddg_',
        keys: {
            settings: 'settings',
            scores: 'scores'
        }
    },

    // Utilitários
    utils: {
        // Salvar dados no localStorage
        save(key, data) {
            localStorage.setItem(this.storage.prefix + key, JSON.stringify(data));
        },
        
        // Carregar dados do localStorage
        load(key) {
            const data = localStorage.getItem(this.storage.prefix + key);
            return data ? JSON.parse(data) : null;
        },
        
        // Limpar dados do localStorage
        clear(key) {
            if (key) {
                localStorage.removeItem(this.storage.prefix + key);
            } else {
                // Limpar todos os dados do projeto
                Object.keys(localStorage).forEach(k => {
                    if (k.startsWith(this.storage.prefix)) {
                        localStorage.removeItem(k);
                    }
                });
            }
        }
    }
};

// Exportar configurações
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DDGConfig;
}

