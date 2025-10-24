<?php
/**
 * Página de Erro 403 - Digital Detective Games
 * Página personalizada para erro 403 (Acesso Negado)
 */

require_once '../config.php';
require_once '../includes.php';

// Registrar atividade
logActivity('error_403', $_SERVER['REQUEST_URI'] ?? 'unknown');

renderErrorPage(
    'Acesso Negado',
    'Você não tem permissão para acessar este recurso.',
    true
);
?>
