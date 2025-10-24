<?php
/**
 * Página de Erro 404 - Digital Detective Games
 * Página personalizada para erro 404
 */

require_once '../config.php';
require_once '../includes.php';

// Registrar atividade
logActivity('error_404', $_SERVER['REQUEST_URI'] ?? 'unknown');

renderErrorPage(
    'Página Não Encontrada',
    'A página que você está procurando não existe ou foi movida.',
    true
);
?>
