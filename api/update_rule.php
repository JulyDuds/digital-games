<?php
/**
 * API para Atualizar Regras do Sistema - DigitalGames
 * Endpoint para atualizar regras administrativas
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

// Verificar se é admin
if (!hasPermission('admin')) {
    http_response_code(403);
    echo json_encode(['error' => 'Acesso negado. Apenas administradores podem atualizar regras.']);
    exit;
}

// Obter dados JSON
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['rule_key']) || !isset($input['rule_value'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Dados inválidos']);
    exit;
}

$ruleKey = sanitizeInput($input['rule_key']);
$ruleValue = sanitizeInput($input['rule_value']);

// Validar chave da regra
$validRules = [
    'maintenance_mode',
    'registration_enabled',
    'guest_play_enabled',
    'statistics_public',
    'session_timeout_minutes',
    'max_login_attempts',
    'password_min_length',
    'games_daily_limit',
    'leaderboard_enabled',
    'notifications_enabled',
    'email_verification',
    'two_factor_auth'
];

if (!in_array($ruleKey, $validRules)) {
    http_response_code(400);
    echo json_encode(['error' => 'Regra inválida']);
    exit;
}

$user = getCurrentUser();
$db = getDatabase();

try {
    // Verificar se a regra existe na tabela system_rules (se a tabela existir)
    $ruleExists = $db->selectOne(
        "SELECT id FROM system_rules WHERE rule_key = ?",
        [$ruleKey]
    );
    
    if ($ruleExists) {
        // Atualizar regra existente
        $db->update(
            "UPDATE system_rules SET rule_value = ?, updated_at = NOW() WHERE rule_key = ?",
            [$ruleValue, $ruleKey]
        );
        
        // Registrar no log administrativo
        if (method_exists($db, 'logActivity')) {
            $db->logActivity(
                $user['id'],
                'system_rule_update',
                "Regra '{$ruleKey}' atualizada para '{$ruleValue}'",
                $_SERVER['REMOTE_ADDR'] ?? null,
                $_SERVER['HTTP_USER_AGENT'] ?? null
            );
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Regra atualizada com sucesso',
            'rule_key' => $ruleKey,
            'rule_value' => $ruleValue
        ]);
    } else {
        // Se a tabela system_rules não existir ou a regra não existir,
        // salvar na tabela system_settings
        $db->update(
            "INSERT INTO system_settings (setting_key, setting_value, updated_at) 
             VALUES (?, ?, NOW()) 
             ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = NOW()",
            [$ruleKey, $ruleValue, $ruleValue]
        );
        
        echo json_encode([
            'success' => true,
            'message' => 'Configuração salva com sucesso',
            'rule_key' => $ruleKey,
            'rule_value' => $ruleValue
        ]);
    }
} catch (Exception $e) {
    error_log("Erro ao atualizar regra: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Erro ao atualizar regra',
        'details' => $e->getMessage()
    ]);
}
?>
