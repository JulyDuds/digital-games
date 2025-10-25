<?php
/**
 * Includes e Componentes - Digital Detective Games
 * Componentes reutilizáveis para o sistema
 */

// Função para incluir header
function includeHeader($title = '', $additionalCSS = '') {
    $pageTitle = $title ? $title . ' - ' . SYSTEM_NAME : SYSTEM_NAME;
    ?>
    <!DOCTYPE html>
    <html lang="pt-PT">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title><?php echo htmlspecialchars($pageTitle); ?></title>
        <link rel="icon" type="image/x-icon" href="assets/img/favicon.svg">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <link rel="stylesheet" href="assets/css/style.css">
        <?php if ($additionalCSS): ?>
            <style><?php echo $additionalCSS; ?></style>
        <?php endif; ?>
    </head>
    <body>
    <?php
}

// Função para incluir footer
function includeFooter($additionalJS = '') {
    ?>
        <script src="assets/js/footer.js"></script>
        <script src="assets/js/windows.js"></script>
        <?php if ($additionalJS): ?>
            <script><?php echo $additionalJS; ?></script>
        <?php endif; ?>
    </body>
    </html>
    <?php
}

// Função para renderizar barra de tarefas
function renderTaskbar() {
    $user = getCurrentUser();
    ?>
    <div class="taskbar">
        <div class="start-button" id="start-button">
            <span>Menu</span>
        </div>
        <div class="taskbar-apps" id="taskbar-apps"></div>
        <div class="taskbar-clock">
            <span id="clock"></span>
            <?php if ($user): ?>
                <div class="user-info">
                    <i class="fas fa-user"></i>
                    <span><?php echo htmlspecialchars($user['name']); ?></span>
                    <a href="logout.php" class="logout-btn" title="Sair">
                        <i class="fas fa-sign-out-alt"></i>
                    </a>
                </div>
            <?php endif; ?>
        </div>
    </div>
    <?php
}

// Função para renderizar menu inicial
function renderStartMenu() {
    global $GAME_CONFIG;
    ?>
    <div class="start-menu hidden" id="start-menu">
        <div class="start-menu-header">
            <div class="user-welcome">
                <?php if (isLoggedIn()): ?>
                    <i class="fas fa-user-circle"></i>
                    <span>Bem-vindo, <?php echo htmlspecialchars(getCurrentUser()['name']); ?>!</span>
                <?php else: ?>
                    <i class="fas fa-user-times"></i>
                    <span>Usuário não logado</span>
                <?php endif; ?>
            </div>
        </div>
        <div class="start-menu-items">
            <?php if (isLoggedIn()): ?>
                <div class="start-menu-item" onclick="window.location.href='profile.php'">
                    <i class="fas fa-user-circle"></i>
                    <span>Meu Perfil</span>
                </div>
            <?php endif; ?>
            <div class="start-menu-item" data-action="about">
                <i class="fas fa-info-circle"></i>
                <span>Sobre</span>
            </div>
            <div class="start-menu-item" data-action="demo">
                <i class="fas fa-tv"></i>
                <span>Demonstração</span>
            </div>
            <div class="start-menu-item" data-action="stats">
                <i class="fas fa-chart-bar"></i>
                <span>Estatísticas</span>
            </div>
            <div class="start-menu-separator"></div>
            <div class="start-menu-item" data-action="help">
                <i class="fas fa-question-circle"></i>
                <span>Ajuda</span>
            </div>
            <?php if (hasPermission('admin')): ?>
                <div class="start-menu-item" data-action="admin">
                    <i class="fas fa-cog"></i>
                    <span>Administração</span>
                </div>
            <?php endif; ?>
            <div class="start-menu-item" data-action="reset">
                <i class="fas fa-redo"></i>
                <span>Resetar Estatísticas</span>
            </div>
        </div>
    </div>
    <?php
}

// Função para renderizar ícones do desktop
function renderDesktopIcons() {
    global $GAME_CONFIG;
    ?>
    <div class="desktop-icons">
        <?php foreach ($GAME_CONFIG as $gameId => $game): ?>
            <?php if ($game['enabled']): ?>
                <div class="desktop-icon" data-game="<?php echo $gameId; ?>">
                    <div class="icon-image">
                        <?php 
                        // Mapear nomes dos jogos para nomes das imagens
                        $imageMap = [
                            'jogodaforca' => 'forca',
                            'pong' => 'pingpong'
                        ];
                        $imageName = $imageMap[$gameId] ?? $gameId;
                        ?>
                        <img src="assets/img/<?php echo $imageName; ?>.png" 
                             alt="<?php echo htmlspecialchars($game['title']); ?>" 
                             style="width: 40px; height: 40px;">
                    </div>
                    <div class="icon-label"><?php echo htmlspecialchars($game['title']); ?></div>
                </div>
            <?php endif; ?>
        <?php endforeach; ?>
    </div>
    <?php
}

// Função para renderizar template de janela
function renderWindowTemplate() {
    ?>
    <template id="window-template">
        <div class="window">
            <div class="window-titlebar">
                <span class="window-title"></span>
                <div class="window-controls">
                    <button class="window-btn minimize-btn"><i class="fas fa-window-minimize"></i></button>
                    <button class="window-btn maximize-btn"><i class="fas fa-window-maximize"></i></button>
                    <button class="window-btn close-btn"><i class="fas fa-times"></i></button>
                </div>
            </div>
            <div class="window-content">
                <iframe></iframe>
            </div>
            <div class="resize-handle resize-n"></div>
            <div class="resize-handle resize-s"></div>
            <div class="resize-handle resize-e"></div>
            <div class="resize-handle resize-w"></div>
            <div class="resize-handle resize-ne"></div>
            <div class="resize-handle resize-nw"></div>
            <div class="resize-handle resize-se"></div>
            <div class="resize-handle resize-sw"></div>
        </div>
    </template>
    <?php
}

// Função para renderizar mensagem de boas-vindas
function renderWelcomeMessage() {
    if (isset($_GET['welcome']) && isLoggedIn()): 
        $user = getCurrentUser();
        ?>
        <div class="welcome-message" id="welcome-message">
            <div class="welcome-content">
                <i class="fas fa-check-circle"></i>
                <h3>Login realizado com sucesso!</h3>
                <p>Bem-vindo de volta, <?php echo htmlspecialchars($user['name']); ?>!</p>
                <button onclick="closeWelcome()" class="btn btn-primary">Continuar</button>
            </div>
        </div>
        <style>
            .welcome-message {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                animation: fadeIn 0.5s ease-out;
            }
            .welcome-content {
                background: #c0c0c0;
                border: 2px solid;
                border-color: #ffffff #808080 #808080 #ffffff;
                padding: 30px;
                text-align: center;
                max-width: 400px;
                animation: slideIn 0.5s ease-out;
            }
            .welcome-content i {
                font-size: 48px;
                color: #00ff00;
                margin-bottom: 15px;
            }
            .welcome-content h3 {
                color: #000080;
                margin-bottom: 10px;
            }
            @keyframes slideIn {
                from { transform: scale(0.8); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
        </style>
        <script>
            function closeWelcome() {
                document.getElementById('welcome-message').style.display = 'none';
                // Remover parâmetro da URL
                const url = new URL(window.location);
                url.searchParams.delete('welcome');
                window.history.replaceState({}, '', url);
            }
            // Fechar automaticamente após 5 segundos
            setTimeout(closeWelcome, 5000);
        </script>
        <?php
    endif;
}

// Função para renderizar página de erro
function renderErrorPage($title, $message, $showBackButton = true) {
    includeHeader($title);
    ?>
    <div class="desktop">
        <div class="error-container">
            <div class="error-window">
                <div class="error-titlebar">
                    <div class="title">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span><?php echo htmlspecialchars($title); ?></span>
                    </div>
                </div>
                <div class="error-content">
                    <div class="error-icon">
                        <i class="fas fa-times-circle"></i>
                    </div>
                    <h2><?php echo htmlspecialchars($title); ?></h2>
                    <p><?php echo htmlspecialchars($message); ?></p>
                    <?php if ($showBackButton): ?>
                        <div class="error-actions">
                            <button onclick="history.back()" class="btn btn-primary">
                                <i class="fas fa-arrow-left"></i> Voltar
                            </button>
                            <button onclick="window.location.href='index.php'" class="btn">
                                <i class="fas fa-home"></i> Início
                            </button>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
    <style>
        .error-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: linear-gradient(135deg, #008080 0%, #004040 100%);
        }
        .error-window {
            background: #c0c0c0;
            border: 2px solid;
            border-color: #ffffff #808080 #808080 #ffffff;
            box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.5);
            max-width: 500px;
            width: 90%;
        }
        .error-titlebar {
            background: linear-gradient(90deg, #ff0000 0%, #ff8080 100%);
            color: white;
            padding: 8px 12px;
            font-size: 12px;
            font-weight: bold;
        }
        .error-titlebar .title {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .error-content {
            padding: 30px;
            text-align: center;
        }
        .error-icon i {
            font-size: 64px;
            color: #ff0000;
            margin-bottom: 20px;
        }
        .error-content h2 {
            color: #000080;
            margin-bottom: 15px;
        }
        .error-actions {
            margin-top: 25px;
            display: flex;
            gap: 10px;
            justify-content: center;
        }
    </style>
    <?php
    includeFooter();
}
?>
