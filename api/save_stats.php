<?php
/**
 * API para Salvar Estatísticas - Digital Detective Games
 * Endpoint para salvar estatísticas dos jogos usando banco de dados
 */

require_once '../config.php';

// Verificar se é POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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

// Obter dados JSON
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['game']) || !isset($input['stats'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Dados inválidos']);
    exit;
}

$gameId = sanitizeInput($input['game']);
$stats = $input['stats'];

// Validar game ID
global $GAME_CONFIG;
if (!isset($GAME_CONFIG[$gameId])) {
    http_response_code(400);
    echo json_encode(['error' => 'Jogo não encontrado']);
    exit;
}

// Preparar dados para salvar
$gameStats = [
    'games_played' => 1, // Incrementar em 1
    'games_won' => ($stats['won'] ?? false) ? 1 : 0,
    'best_score' => $stats['score'] ?? 0,
    'total_time' => $stats['time'] ?? 0
];

// Salvar estatísticas usando banco de dados
$result = saveGameStats($gameId, $gameStats);

if ($result) {
    // Registrar atividade
    logActivity('game_completed', "Jogo: {$gameId}, Score: " . ($stats['score'] ?? 0));
    
    // Obter estatísticas atualizadas
    $updatedStats = getGameStats($gameId);
    
    // Resposta de sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Estatísticas salvas com sucesso',
        'stats' => $updatedStats
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao salvar estatísticas']);
}
?>
