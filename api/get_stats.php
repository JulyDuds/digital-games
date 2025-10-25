<?php
/**
 * API para Obter Estatísticas - DigitalGames
 * Endpoint para obter estatísticas dos jogos do banco de dados
 */

require_once '../config.php';

// Verificar se é GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit;
}

// Verificar se o usuário está logado
if (!isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['error' => 'Usuário não autenticado']);
    exit;
}

// Obter game ID
$gameId = sanitizeInput($_GET['game'] ?? '');

if (empty($gameId)) {
    http_response_code(400);
    echo json_encode(['error' => 'ID do jogo não fornecido']);
    exit;
}

// Validar game ID
global $GAME_CONFIG;
if (!isset($GAME_CONFIG[$gameId])) {
    http_response_code(400);
    echo json_encode(['error' => 'Jogo não encontrado']);
    exit;
}

// Obter estatísticas
$stats = getGameStats($gameId);

// Resposta de sucesso
echo json_encode([
    'success' => true,
    'stats' => $stats
]);
?>

