<?php
/**
 * API para Salvar Estatísticas - DigitalGames
 * Endpoint para salvar estatísticas dos jogos usando banco de dados
 */

// Habilitar exibição de erros para debug
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require_once '../config.php';

// Verificar se é POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit;
}

// Verificar se o usuário está logado
if (!isLoggedIn()) {
    error_log('API save_stats: Usuário não autenticado. Session data: ' . json_encode($_SESSION ?? []));
    http_response_code(401);
    echo json_encode(['error' => 'Usuário não autenticado', 'debug' => 'Sessão não iniciada ou usuário não logado']);
    exit;
}

// Obter dados JSON
$rawInput = file_get_contents('php://input');
error_log('API save_stats: Dados recebidos: ' . $rawInput);
$input = json_decode($rawInput, true);

if (!$input || !isset($input['game']) || !isset($input['stats'])) {
    error_log('API save_stats: Dados inválidos. Input: ' . print_r($input, true));
    http_response_code(400);
    echo json_encode(['error' => 'Dados inválidos', 'debug' => $input]);
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
error_log('API save_stats: Tentando salvar stats para jogo: ' . $gameId . ' Data: ' . json_encode($gameStats));
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
    error_log('API save_stats: Falha ao salvar estatísticas. Result: ' . var_export($result, true));
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao salvar estatísticas', 'debug' => 'saveGameStats retornou false']);
}
?>
