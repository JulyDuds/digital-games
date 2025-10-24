<?php
/**
 * Configurações Globais - Digital Detective Games
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
define('SYSTEM_NAME', 'Digital Detective Games');
define('VERSION', '1.0.0');
define('AUTHOR', 'Digital Detective Team');
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
        'url' => 'tictactoe.php',
        'icon' => 'fa-times',
        'width' => 700,
        'height' => 750,
        'description' => 'Jogo da Velha contra IA',
        'enabled' => true
    ],
    'minesweeper' => [
        'title' => 'Campo Minado',
        'url' => 'minesweeper.php',
        'icon' => 'fa-bomb',
        'width' => 700,
        'height' => 750,
        'description' => 'Encontre todas as minas',
        'enabled' => true
    ],
    'jogodaforca' => [
        'title' => 'Jogo da Forca',
        'url' => 'jogodaforca.php',
        'icon' => 'fa-user-secret',
        'width' => 800,
        'height' => 700,
        'description' => 'Adivinhe a palavra secreta',
        'enabled' => true
    ],
    'pong' => [
        'title' => 'Pong',
        'url' => 'pong.php',
        'icon' => 'fa-table-tennis',
        'width' => 700,
        'height' => 600,
        'description' => 'Clássico jogo de tênis de mesa',
        'enabled' => true
    ],
    'memory' => [
        'title' => 'Memory Game',
        'url' => 'memory.php',
        'icon' => 'fa-brain',
        'width' => 700,
        'height' => 700,
        'description' => 'Encontre todos os pares',
        'enabled' => true
    ],
    'snake' => [
        'title' => 'Snake',
        'url' => 'snake.php',
        'icon' => 'fa-gamepad',
        'width' => 600,
        'height' => 600,
        'description' => 'Clássico jogo da cobrinha',
        'enabled' => true
    ],
    'wordle' => [
        'title' => 'Wordle',
        'url' => 'wordle.php',
        'icon' => 'fa-font',
        'width' => 500,
        'height' => 600,
        'description' => 'Adivinhe a palavra em 6 tentativas',
        'enabled' => true
    ],
    'solitaire' => [
        'title' => 'Paciência',
        'url' => 'solitaire.php',
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
        $db->updateGameStats($user['id'], $gameId, $stats);
    }
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
?>
