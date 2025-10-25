<?php
/**
 * Sistema de Login - DigitalGames
 * Processa autenticação de usuários no estilo Windows 98
 */

require_once 'config.php';

// Processar formulário de login
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
    
    // Validações básicas
    if (empty($username) || empty($password)) {
        logLoginAttempt($username, false, 'Nome de usuário e senha são obrigatórios');
        header('Location: login.html?error=' . urlencode('Nome de usuário e senha são obrigatórios'));
        exit;
    }
    
    if (strlen($username) < 3) {
        logLoginAttempt($username, false, 'Nome de usuário deve ter pelo menos 3 caracteres');
        header('Location: login.html?error=' . urlencode('Nome de usuário deve ter pelo menos 3 caracteres'));
        exit;
    }
    
    if (strlen($password) < 4) {
        logLoginAttempt($username, false, 'Senha deve ter pelo menos 4 caracteres');
        header('Location: login.html?error=' . urlencode('Senha deve ter pelo menos 4 caracteres'));
        exit;
    }
    
    // Validar credenciais usando banco de dados
    $user = authenticateUser($username, $password);
    
    if ($user) {
        // Login bem-sucedido
        $sessionId = session_id();
        $expiresAt = date('Y-m-d H:i:s', time() + SESSION_TIMEOUT);
        
        // Criar sessão no banco
        createUserSession($user['id'], $sessionId, $ip, $userAgent, $expiresAt);
        
        // Configurar sessão PHP
        $_SESSION['user'] = [
            'id' => $user['id'],
            'username' => $user['username'],
            'name' => $user['name'],
            'role' => $user['role'],
            'login_time' => time(),
            'ip' => $ip,
            'session_id' => $sessionId
        ];
        
        logLoginAttempt($username, true);
        
        // Registrar atividade
        logActivity('login', 'Login realizado com sucesso');
        
        // Redirecionar para o sistema principal
        header('Location: index.php?welcome=1');
        exit;
    } else {
        // Login falhou
        logLoginAttempt($username, false, 'Nome de usuário ou senha incorretos');
        header('Location: login.html?error=' . urlencode('Nome de usuário ou senha incorretos'));
        exit;
    }
}

// Se não é POST, redirecionar para login
header('Location: login.html');
exit;
?>
