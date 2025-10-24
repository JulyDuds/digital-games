<?php
/**
 * Sistema de Logout - Digital Detective Games
 * Processa logout de usuários
 */

require_once 'config.php';

// Registrar atividade de logout
if (isLoggedIn()) {
    $user = getCurrentUser();
    
    // Remover sessão do banco de dados
    if (isset($user['session_id'])) {
        removeUserSession($user['session_id']);
    }
    
    // Registrar atividade
    logActivity('logout', 'Usuário fez logout');
}

// Destruir sessão PHP
session_destroy();

// Redirecionar para login com mensagem
header('Location: login.html?success=' . urlencode('Logout realizado com sucesso!'));
exit;
?>
