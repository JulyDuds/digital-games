<?php
/**
 * Configurações Globais - DigitalGames
 * Arquivo de configuração centralizado para o sistema PHP
 */

// Incluir classe de banco de dados
require_once __DIR__ . '/database/Database.php';

// Configurações do banco de dados
define('DB_HOST', 'localhost');
define('DB_USERNAME', 'root');
define('DB_PASSWORD', '');
define('DB_NAME', 'digital_detective_games');
define('DB_CHARSET', 'utf8mb4');

// Configurações do sistema
define('SYSTEM_NAME', 'DigitalGames');
define('VERSION', '1.0.0');
define('AUTHOR', 'DigitalGames Team');
define('YEAR', date('Y'));

// Configurações de sessão
define('SESSION_TIMEOUT', 3600); // 1 hora em segundos
define('SESSION_NAME', 'DDG_SESSION');

// Configurações de segurança
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOGIN_LOCKOUT_TIME', 900); // 15 minutos

// Configurações de jogos
$GAME_CONFIG = [
    'tictactoe' => [
        'title' => 'Tic-Tac-Toe',
        'url' => 'games/tictactoe.html',
        'icon' => 'fa-times',
        'width' => 700,
        'height' => 750,
        'description' => 'Jogo da Velha contra IA',
        'enabled' => true
    ],
    'minesweeper' => [
        'title' => 'Campo Minado',
        'url' => 'games/minesweeper.html',
        'icon' => 'fa-bomb',
        'width' => 700,
        'height' => 750,
        'description' => 'Encontre todas as minas',
        'enabled' => true
    ],
    'jogodaforca' => [
        'title' => 'Jogo da Forca',
        'url' => 'games/jogodaforca.html',
        'icon' => 'fa-user-secret',
        'width' => 800,
        'height' => 700,
        'description' => 'Adivinhe a palavra secreta',
        'enabled' => true
    ],
    'pong' => [
        'title' => 'Pong',
        'url' => 'games/pong.html',
        'icon' => 'fa-table-tennis',
        'width' => 700,
        'height' => 600,
        'description' => 'Clássico jogo de tênis de mesa',
        'enabled' => true
    ],
    'memory' => [
        'title' => 'Memory Game',
        'url' => 'games/memory.html',
        'icon' => 'fa-brain',
        'width' => 700,
        'height' => 700,
        'description' => 'Encontre todos os pares',
        'enabled' => true
    ],
    'snake' => [
        'title' => 'Snake',
        'url' => 'games/snake.html',
        'icon' => 'fa-gamepad',
        'width' => 600,
        'height' => 600,
        'description' => 'Clássico jogo da cobrinha',
        'enabled' => true
    ],
    'wordle' => [
        'title' => 'Wordle',
        'url' => 'games/wordle.html',
        'icon' => 'fa-font',
        'width' => 500,
        'height' => 600,
        'description' => 'Adivinhe a palavra em 6 tentativas',
        'enabled' => true
    ],
    'solitaire' => [
        'title' => 'Paciência',
        'url' => 'games/solitaire.html',
        'icon' => 'fa-spade',
        'width' => 800,
        'height' => 600,
        'description' => 'Jogo de cartas clássico',
        'enabled' => true
    ]
];

// Configurações de janelas
define('WINDOW_MIN_WIDTH', 400);
define('WINDOW_MIN_HEIGHT', 300);
define('WINDOW_DEFAULT_WIDTH', 700);
define('WINDOW_DEFAULT_HEIGHT', 600);

// Configurações de áudio
$AUDIO_CONFIG = [
    'enabled' => true,
    'default_volume' => 0.5,
    'sounds' => [
        'move' => ['frequency' => 400, 'duration' => 0.1, 'gain' => 0.1],
        'win' => ['frequency' => 800, 'duration' => 0.4, 'gain' => 0.25],
        'lose' => ['frequency' => 150, 'duration' => 0.5, 'gain' => 0.25],
        'click' => ['frequency' => 600, 'duration' => 0.1, 'gain' => 0.15]
    ]
];

// Configurações de cores (mesmas do CSS)
$COLORS = [
    'primary' => '#242424',
    'secondary' => '#808080',
    'accent' => '#FD0100',
    'light' => '#CBDCC1',
    'dark' => '#1a1a1a'
];

// Instância global do banco de dados
$db = null;

function getDatabase() {
    global $db;
    if ($db === null) {
        try {
            $db = Database::getInstance([
                'host' => DB_HOST,
                'username' => DB_USERNAME,
                'password' => DB_PASSWORD,
                'database' => DB_NAME,
                'charset' => DB_CHARSET
            ]);
            
            // Testar conexão
            if (!$db->testConnection()) {
                throw new Exception("Falha na conexão com banco de dados");
            }
        } catch (Exception $e) {
            error_log("Erro de conexão com banco: " . $e->getMessage());
            throw new Exception("Sistema temporariamente indisponível. Execute install_database.php para configurar o banco.");
        }
    }
    return $db;
}

// Funções utilitárias
function isLoggedIn() {
    return isset($_SESSION['user']) && !empty($_SESSION['user']);
}

function getCurrentUser() {
    return $_SESSION['user'] ?? null;
}

function requireLogin() {
    if (!isLoggedIn()) {
        header('Location: login.html');
        exit;
    }
}

function getUserRole() {
    $user = getCurrentUser();
    return $user['role'] ?? 'guest';
}

function hasPermission($permission) {
    $role = getUserRole();
    
    $permissions = [
        'admin' => ['all'],
        'user' => ['play_games', 'view_stats'],
        'guest' => ['play_games']
    ];
    
    return in_array('all', $permissions[$role] ?? []) || 
           in_array($permission, $permissions[$role] ?? []);
}

function logActivity($action, $details = '') {
    $user = getCurrentUser();
    $db = getDatabase();
    
    if ($db) {
        $db->logActivity(
            $user['id'] ?? null,
            $action,
            $details,
            $_SERVER['REMOTE_ADDR'] ?? null,
            $_SERVER['HTTP_USER_AGENT'] ?? null
        );
    }
}

function sanitizeInput($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

function formatDate($timestamp) {
    return date('d/m/Y H:i:s', $timestamp);
}

function getGameStats($gameId) {
    $db = getDatabase();
    $user = getCurrentUser();
    
    if ($db && $user) {
        $stats = $db->getGameStats($user['id'], $gameId);
        if ($stats) {
            return [
                'games_played' => $stats['games_played'],
                'games_won' => $stats['games_won'],
                'best_score' => $stats['best_score'],
                'total_time' => $stats['total_time'],
                'last_played' => $stats['last_played']
            ];
        }
    }
    
    return [
        'games_played' => 0,
        'games_won' => 0,
        'best_score' => 0,
        'total_time' => 0,
        'last_played' => null
    ];
}

function saveGameStats($gameId, $stats) {
    $db = getDatabase();
    $user = getCurrentUser();
    
    if ($db && $user) {
        return $db->updateGameStats($user['id'], $gameId, $stats);
    }
    
    return false;
}

function authenticateUser($username, $password) {
    $db = getDatabase();
    if ($db) {
        return $db->authenticateUser($username, $password);
    }
    return false;
}

function createUserSession($userId, $sessionId, $ipAddress, $userAgent, $expiresAt) {
    $db = getDatabase();
    if ($db) {
        return $db->createSession($userId, $sessionId, $ipAddress, $userAgent, $expiresAt);
    }
    return false;
}

function validateUserSession($sessionId) {
    $db = getDatabase();
    if ($db) {
        return $db->validateSession($sessionId);
    }
    return false;
}

function removeUserSession($sessionId) {
    $db = getDatabase();
    if ($db) {
        return $db->removeSession($sessionId);
    }
    return false;
}

function logLoginAttempt($username, $success, $failureReason = null) {
    $db = getDatabase();
    if ($db) {
        $db->logLogin(
            $username,
            $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            $success,
            $failureReason
        );
    }
}

function getSystemSetting($key, $default = null) {
    $db = getDatabase();
    if ($db) {
        return $db->getSetting($key, $default);
    }
    return $default;
}

function setSystemSetting($key, $value) {
    $db = getDatabase();
    if ($db) {
        return $db->setSetting($key, $value);
    }
    return false;
}

function getSystemStats() {
    $db = getDatabase();
    if ($db) {
        return $db->getSystemStats();
    }
    return [
        'total_users' => 0,
        'total_games' => 0,
        'active_sessions' => 0,
        'games_today' => 0
    ];
}

function isMaintenanceMode() {
    $db = getDatabase();
    if ($db) {
        // Tentar buscar da tabela system_rules primeiro
        $maintenance = $db->selectOne("SELECT rule_value FROM system_rules WHERE rule_key = 'maintenance_mode'");
        if ($maintenance) {
            return $maintenance['rule_value'] == '1';
        }
        // Se não existir, buscar de system_settings
        $maintenance = $db->selectOne("SELECT setting_value FROM system_settings WHERE setting_key = 'maintenance_mode'");
        if ($maintenance) {
            return $maintenance['setting_value'] == '1';
        }
    }
    return false;
}

// Inicializar sessão se não estiver iniciada
if (session_status() === PHP_SESSION_NONE) {
    session_name(SESSION_NAME);
    session_start();
}

// Verificar timeout da sessão
if (isLoggedIn()) {
    $loginTime = $_SESSION['user']['login_time'] ?? 0;
    if (time() - $loginTime > SESSION_TIMEOUT) {
        session_destroy();
        header('Location: login.html?error=' . urlencode('Sessão expirada. Faça login novamente.'));
        exit;
    }
}

// Verificar modo de manutenção
// Permitir acesso apenas para páginas de login, API e admin
$maintenanceMode = isMaintenanceMode();
$currentPage = basename($_SERVER['PHP_SELF']);
$allowedPages = ['login.php', 'login.html', 'logout.php', 'index.php', 'profile.php'];
$isApi = strpos($_SERVER['PHP_SELF'], '/api/') !== false;

if ($maintenanceMode && !in_array($currentPage, $allowedPages) && !$isApi && !hasPermission('admin')) {
    // Redirecionar para página de manutenção ou mostrar mensagem
    header('Content-Type: text/html; charset=UTF-8');
    ?>
    <!DOCTYPE html>
    <html lang="pt-PT">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Modo de Manutenção - DigitalGames</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'MS Sans Serif', sans-serif;
                background: linear-gradient(135deg, #008080 0%, #004040 100%);
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                padding: 20px;
            }
            .maintenance-window {
                background: #c0c0c0;
                border: 3px solid;
                border-color: #ffffff #000000 #000000 #ffffff;
                box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.5);
                max-width: 500px;
                width: 100%;
            }
            .maintenance-titlebar {
                background: linear-gradient(90deg, #ff0000 0%, #ff8080 100%);
                color: white;
                padding: 8px 12px;
                font-size: 14px;
                font-weight: bold;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .maintenance-content {
                padding: 40px 30px;
                text-align: center;
            }
            .maintenance-icon {
                font-size: 64px;
                color: #ff0000;
                margin-bottom: 20px;
            }
            .maintenance-content h1 {
                color: #000080;
                font-size: 24px;
                margin-bottom: 15px;
            }
            .maintenance-content p {
                color: #000;
                font-size: 14px;
                line-height: 1.6;
                margin-bottom: 10px;
            }
            .btn {
                display: inline-block;
                margin-top: 20px;
                padding: 10px 30px;
                background: #c0c0c0;
                border: 2px solid;
                border-color: #ffffff #808080 #808080 #ffffff;
                color: #000;
                text-decoration: none;
                font-weight: bold;
                font-size: 14px;
                cursor: pointer;
            }
            .btn:hover {
                background: #e0e0e0;
            }
            .btn:active {
                border-color: #808080 #ffffff #ffffff #808080;
            }
        </style>
    </head>
    <body>
        <div class="maintenance-window">
            <div class="maintenance-titlebar">
                <i class="fas fa-tools"></i>
                <span>Modo de Manutenção</span>
            </div>
            <div class="maintenance-content">
                <i class="fas fa-wrench maintenance-icon"></i>
                <h1>Sistema em Manutenção</h1>
                <p>O sistema está temporariamente indisponível para manutenção programada.</p>
                <p>Nossa equipe está trabalhando para restaurar o acesso o mais rápido possível.</p>
                <p style="color: #808080; font-size: 12px; margin-top: 20px;">
                    <i class="fas fa-clock"></i> Por favor, tente novamente em breve.
                </p>
                <a href="index.php" class="btn">
                    <i class="fas fa-home"></i> Voltar para Home
                </a>
            </div>
        </div>
    </body>
    </html>
    <?php
    exit;
}
?>
