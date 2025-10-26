/**
 * Configurações Globais - DigitalGames
 * Centralize todas as configurações do projeto aqui
 */

const DDGConfig = {
    // Informações do projeto
    projectName: 'DigitalGames',
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
            url: 'games/tictactoe.html',
            icon: 'fa-times',
            width: 700,
            height: 750,
            description: 'Jogo da Velha contra IA'
        },
        minesweeper: {
            title: 'Campo Minado',
            url: 'games/minesweeper.html',
            icon: 'fa-bomb',
            width: 700,
            height: 750,
            description: 'Encontre todas as minas'
        },
        jogodaforca: {
            title: 'Jogo da Forca',
            url: 'games/jogodaforca.html',
            icon: 'fa-user-secret',
            width: 800,
            height: 700,
            description: 'Adivinhe a palavra secreta'
        },
        pong: {
            title: 'Pong',
            url: 'games/pong.html',
            icon: 'fa-table-tennis',
            width: 700,
            height: 600,
            description: 'Clássico jogo de tênis de mesa'
        },
        memory: {
            title: 'Memory Game',
            url: 'games/memory.html',
            icon: 'fa-brain',
            width: 700,
            height: 700,
            description: 'Encontre todos os pares'
        },
        snake: {
            title: 'Snake',
            url: 'games/snake.html',
            icon: 'fa-gamepad',
            width: 600,
            height: 600,
            description: 'Clássico jogo da cobrinha'
        },
        wordle: {
            title: 'Wordle',
            url: 'games/wordle.html',
            icon: 'fa-font',
            width: 500,
            height: 600,
            description: 'Adivinhe a palavra em 6 tentativas'
        },
        solitaire: {
            title: 'Paciência',
            url: 'games/solitaire.html',
            icon: 'fa-spade',
            width: 800,
            height: 600,
            description: 'Jogo de cartas clássico'
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

    // API endpoints
    api: {
        saveStats: '../api/save_stats.php',
        getStats: '../api/get_stats.php'
    },

    // Utilitários
    utils: {
        // Salvar dados no localStorage
        save(key, data) {
            localStorage.setItem(DDGConfig.storage.prefix + key, JSON.stringify(data));
        },
        
        // Carregar dados do localStorage
        load(key) {
            const data = localStorage.getItem(DDGConfig.storage.prefix + key);
            return data ? JSON.parse(data) : null;
        },
        
        // Limpar dados do localStorage
        clear(key) {
            if (key) {
                localStorage.removeItem(DDGConfig.storage.prefix + key);
            } else {
                // Limpar todos os dados do projeto
                Object.keys(localStorage).forEach(k => {
                    if (k.startsWith(DDGConfig.storage.prefix)) {
                        localStorage.removeItem(k);
                    }
                });
            }
        },

        // API endpoints (corrigidos para caminho relativo)
        api: {
            saveStats: '../api/save_stats.php',
            getStats: '../api/get_stats.php'
        },
        // Salvar estatísticas do jogo no banco de dados
        async saveGameStats(gameId, stats) {
            try {
                const response = await fetch(DDGConfig.api.saveStats, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        game: gameId,
                        stats: stats
                    })
                });

                if (!response.ok) {
                    console.error('Erro ao salvar estatísticas:', response.statusText);
                    return false;
                }

                const data = await response.json();
                
                if (data.success) {
                    console.log('Estatísticas salvas com sucesso!');
                    return data.stats;
                } else {
                    console.error('Erro ao salvar estatísticas:', data.error);
                    return false;
                }
            } catch (error) {
                console.error('Erro ao salvar estatísticas:', error);
                return false;
            }
        },

        // Obter estatísticas do jogo do banco de dados
        async getGameStats(gameId) {
            try {
                const response = await fetch(`${DDGConfig.api.getStats}?game=${gameId}`);
                
                if (!response.ok) {
                    console.error('Erro ao obter estatísticas:', response.statusText);
                    return null;
                }

                const data = await response.json();
                
                if (data.success) {
                    return data.stats;
                } else {
                    console.error('Erro ao obter estatísticas:', data.error);
                    return null;
                }
            } catch (error) {
                console.error('Erro ao obter estatísticas:', error);
                return null;
            }
        }
    }
};

// Exportar configurações
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DDGConfig;
}

