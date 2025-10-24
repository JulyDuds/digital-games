<?php
/**
 * Página Principal - Digital Detective Games
 * Sistema de jogos retro no estilo Windows 98
 */

// Verificar se há erros de PHP
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    require_once 'config.php';
    require_once 'includes.php';

    // Verificar se o usuário está logado
    requireLogin();
} catch (Exception $e) {
    // Se houver erro de configuração, mostrar página de erro
    error_log("Erro no index.php: " . $e->getMessage());
    
    // Redirecionar para página de erro ou login
    if (strpos($e->getMessage(), 'database') !== false) {
        header('Location: install_database.php');
        exit;
    } else {
        header('Location: login.html?error=' . urlencode('Erro de configuração do sistema'));
        exit;
    }
}

// Registrar atividade
logActivity('page_access', 'index.php');

// Incluir header
includeHeader('Digital Detective Games');
?>

<div class="desktop">
    <?php renderDesktopIcons(); ?>
    
    <?php renderStartMenu(); ?>
    
    <?php renderTaskbar(); ?>
    
    <?php renderWelcomeMessage(); ?>
</div>

<?php renderWindowTemplate(); ?>

<script>
// Configurações globais do sistema
const DDGConfig = {
    // Informações do projeto
    projectName: '<?php echo SYSTEM_NAME; ?>',
    version: '<?php echo VERSION; ?>',
    year: <?php echo YEAR; ?>,

    // Configurações de som
    audio: {
        enabled: <?php echo $AUDIO_CONFIG['enabled'] ? 'true' : 'false'; ?>,
        defaultVolume: <?php echo $AUDIO_CONFIG['default_volume']; ?>,
        sounds: <?php echo json_encode($AUDIO_CONFIG['sounds']); ?>
    },

    // Configurações de janelas
    windows: {
        minWidth: <?php echo WINDOW_MIN_WIDTH; ?>,
        minHeight: <?php echo WINDOW_MIN_HEIGHT; ?>,
        defaultWidth: <?php echo WINDOW_DEFAULT_WIDTH; ?>,
        defaultHeight: <?php echo WINDOW_DEFAULT_HEIGHT; ?>,
        cascade: {
            offsetX: 30,
            offsetY: 30,
            startX: 100,
            startY: 50
        }
    },

    // Configurações de jogos
    games: <?php echo json_encode($GAME_CONFIG); ?>,

    // Paleta de cores
    colors: <?php echo json_encode($COLORS); ?>,

    // LocalStorage keys
    storage: {
        prefix: 'ddg_',
        keys: {
            settings: 'settings',
            scores: 'scores'
        }
    },

    // Informações do usuário
    user: {
        username: '<?php echo htmlspecialchars(getCurrentUser()['username']); ?>',
        name: '<?php echo htmlspecialchars(getCurrentUser()['name']); ?>',
        role: '<?php echo htmlspecialchars(getCurrentUser()['role']); ?>',
        loginTime: <?php echo getCurrentUser()['login_time']; ?>
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
        },

        // Enviar estatísticas para o servidor
        sendStats(gameId, stats) {
            fetch('api/save_stats.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    game: gameId,
                    stats: stats
                })
            }).catch(error => {
                console.log('Erro ao salvar estatísticas:', error);
            });
        }
    }
};

// Função para mostrar informações do sistema
function showSystemInfo() {
    const info = `
Sistema: ${DDGConfig.projectName}
Versão: ${DDGConfig.version}
Usuário: ${DDGConfig.user.name} (${DDGConfig.user.role})
Login: ${new Date(DDGConfig.user.loginTime * 1000).toLocaleString()}
Navegador: ${navigator.userAgent}
Resolução: ${screen.width}x${screen.height}
    `;
    
    alert(info);
}

// Função para mostrar estatísticas
function showStats() {
    // Implementar modal de estatísticas
    console.log('Mostrar estatísticas do usuário');
}

// Função para mostrar ajuda
function showHelp() {
    const help = `
Digital Detective Games - Ajuda

CONTROLES:
• Clique duplo nos ícones para abrir jogos
• Use o botão Menu para acessar opções
• Arraste as janelas para mover
• Redimensione arrastando as bordas

JOGOS DISPONÍVEIS:
• Tic-Tac-Toe: Jogo da velha contra IA
• Campo Minado: Encontre todas as minas
• Jogo da Forca: Adivinhe a palavra
• Pong: Clássico jogo de tênis
• Memory: Encontre os pares
• Snake: Cobrinha clássica
• Wordle: Adivinhe a palavra
• Paciência: Jogo de cartas

ATALHOS:
• F1: Ajuda
• F5: Atualizar página
• Ctrl+R: Resetar estatísticas
• Alt+F4: Fechar janela ativa

Para mais informações, consulte o menu Sobre.
    `;
    
    alert(help);
}

// Função para resetar estatísticas
function resetStats() {
    if (confirm('Tem certeza que deseja resetar todas as estatísticas?\n\nEsta ação não pode ser desfeita.')) {
        DDGConfig.utils.clear();
        alert('Estatísticas resetadas com sucesso!');
        location.reload();
    }
}

// Função para mostrar demonstração
function showDemo() {
    alert('Demonstração:\n\nEste sistema simula o ambiente Windows 98 com jogos clássicos.\n\nExperimente os diferentes jogos disponíveis clicando nos ícones do desktop.');
}

// Função para administração (apenas admin)
function showAdmin() {
    if (DDGConfig.user.role !== 'admin') {
        alert('Acesso negado. Apenas administradores podem acessar esta função.');
        return;
    }
    
    alert('Painel de Administração:\n\n• Visualizar logs de acesso\n• Gerenciar usuários\n• Configurações do sistema\n• Estatísticas globais\n\n(Em desenvolvimento)');
}

// Event listeners para o menu inicial
document.addEventListener('DOMContentLoaded', function() {
    // Configurar ações do menu
    const menuItems = document.querySelectorAll('.start-menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const action = this.dataset.action;
            
            switch(action) {
                case 'about':
                    showSystemInfo();
                    break;
                case 'demo':
                    showDemo();
                    break;
                case 'stats':
                    showStats();
                    break;
                case 'help':
                    showHelp();
                    break;
                case 'admin':
                    showAdmin();
                    break;
                case 'reset':
                    resetStats();
                    break;
            }
        });
    });

    // Atalhos de teclado
    document.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'F1':
                e.preventDefault();
                showHelp();
                break;
            case 'F5':
                e.preventDefault();
                location.reload();
                break;
        }
        
        // Ctrl+R para resetar estatísticas
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            resetStats();
        }
    });

    // Mostrar informações de boas-vindas para novos usuários
    const isFirstVisit = !DDGConfig.utils.load('visited');
    if (isFirstVisit) {
        DDGConfig.utils.save('visited', true);
        setTimeout(() => {
            alert('Bem-vindo ao Digital Detective Games!\n\nClique duplo nos ícones para jogar.\nUse o menu para mais opções.\n\nDivirta-se!');
        }, 1000);
    }
});

// Exportar configurações para uso em outros scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DDGConfig;
}
</script>

<?php includeFooter(); ?>
