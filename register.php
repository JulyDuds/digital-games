<?php
/**
 * Sistema de Registro - Digital Detective Games
 * Processa registro de novos usuários
 */

require_once 'config.php';

// Verificar se o registro está habilitado
$registrationEnabled = getSystemSetting('registration_enabled', '1');
if ($registrationEnabled !== '1') {
    header('Location: register.html?error=' . urlencode('Registro de novos usuários está desabilitado'));
    exit;
}

// Processar formulário de registro
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
    
    // Validações básicas
    if (empty($username) || empty($name) || empty($password)) {
        header('Location: register.html?error=' . urlencode('Todos os campos obrigatórios devem ser preenchidos'));
        exit;
    }
    
    // Validar comprimento do nome de usuário
    if (strlen($username) < 3 || strlen($username) > 20) {
        header('Location: register.html?error=' . urlencode('Nome de usuário deve ter entre 3 e 20 caracteres'));
        exit;
    }
    
    // Validar formato do nome de usuário
    if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
        header('Location: register.html?error=' . urlencode('Nome de usuário deve conter apenas letras, números e underscore'));
        exit;
    }
    
    // Validar nome
    if (strlen($name) < 3 || strlen($name) > 100) {
        header('Location: register.html?error=' . urlencode('Nome deve ter entre 3 e 100 caracteres'));
        exit;
    }
    
    // Validar e-mail (se fornecido)
    if (!empty($email)) {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            header('Location: register.html?error=' . urlencode('E-mail inválido'));
            exit;
        }
        if (strlen($email) > 100) {
            header('Location: register.html?error=' . urlencode('E-mail muito longo'));
            exit;
        }
    }
    
    // Validar senha
    if (strlen($password) < 6) {
        header('Location: register.html?error=' . urlencode('Senha deve ter pelo menos 6 caracteres'));
        exit;
    }
    
    // Validar confirmação de senha
    if ($password !== $confirmPassword) {
        header('Location: register.html?error=' . urlencode('As senhas não coincidem'));
        exit;
    }
    
    try {
        $db = getDatabase();
        
        // Verificar se o nome de usuário já existe
        $existingUser = $db->selectOne(
            "SELECT id FROM users WHERE username = ?",
            [$username]
        );
        
        if ($existingUser) {
            header('Location: register.html?error=' . urlencode('Nome de usuário já está em uso'));
            exit;
        }
        
        // Verificar se o e-mail já existe (se fornecido)
        if (!empty($email)) {
            $existingEmail = $db->selectOne(
                "SELECT id FROM users WHERE email = ? AND email IS NOT NULL AND email != ''",
                [$email]
            );
            
            if ($existingEmail) {
                header('Location: register.html?error=' . urlencode('E-mail já está cadastrado'));
                exit;
            }
        }
        
        // Hash da senha (usando MD5 para compatibilidade com o sistema existente)
        // Nota: Em produção, use password_hash() com BCRYPT
        $passwordHash = md5($password);
        
        // Inserir novo usuário
        $userId = $db->insert(
            "INSERT INTO users (username, password, name, email, role, is_active, created_at) 
             VALUES (?, ?, ?, ?, 'user', TRUE, NOW())",
            [$username, $passwordHash, $name, $email ?: null]
        );
        
        if ($userId) {
            // Registrar atividade
            $db->logActivity(
                $userId,
                'user_registered',
                "Novo usuário registrado: {$username}",
                $ip,
                $userAgent
            );
            
            // Login automático após registro
            $user = $db->selectOne(
                "SELECT id, username, password, name, role, is_active 
                 FROM users WHERE id = ?",
                [$userId]
            );
            
            if ($user) {
                // Criar sessão
                $sessionId = session_id();
                $expiresAt = date('Y-m-d H:i:s', time() + SESSION_TIMEOUT);
                
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
                
                // Registrar login
                logLoginAttempt($username, true);
                logActivity('login', 'Login automático após registro');
                
                // Redirecionar para o sistema com mensagem de boas-vindas
                header('Location: index.php?welcome=1&registered=1');
                exit;
            }
        }
        
        // Se chegou aqui, algo deu errado
        header('Location: register.html?error=' . urlencode('Erro ao criar conta. Tente novamente.'));
        exit;
        
    } catch (Exception $e) {
        error_log("Erro no registro: " . $e->getMessage());
        header('Location: register.html?error=' . urlencode('Erro no sistema. Tente novamente mais tarde.'));
        exit;
    }
}

// Se não é POST, redirecionar para página de registro
header('Location: register.html');
exit;
?>

