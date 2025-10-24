<?php
/**
 * Página de Erro 500 - Digital Detective Games
 * Página personalizada para erro 500 (Erro Interno do Servidor)
 */

require_once '../config.php';
require_once '../includes.php';

// Registrar atividade
logActivity('error_500', $_SERVER['REQUEST_URI'] ?? 'unknown');

renderErrorPage(
    'Erro Interno do Servidor',
    'Ocorreu um erro interno no servidor. Tente novamente mais tarde.',
    true
);
?>
