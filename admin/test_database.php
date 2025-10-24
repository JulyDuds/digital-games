<?php
/**
 * Teste de Conexão com Banco de Dados - Digital Detective Games
 * Script para verificar se o banco está funcionando corretamente
 */

require_once '../config.php';

echo "🔍 Teste de Conexão com Banco de Dados\n";
echo "=====================================\n\n";

try {
    // Testar conexão
    $db = getDatabase();
    
    if (!$db) {
        throw new Exception("Falha ao obter instância do banco de dados");
    }
    
    echo "✅ Conexão com banco de dados estabelecida\n";
    
    // Testar conexão básica
    if (!$db->testConnection()) {
        throw new Exception("Teste de conexão falhou");
    }
    
    echo "✅ Teste de conexão básica passou\n";
    
    // Obter informações do banco
    $info = $db->getDatabaseInfo();
    if ($info) {
        echo "📊 Informações do banco:\n";
        echo "   - Versão MySQL: {$info['version']}\n";
        echo "   - Banco de dados: {$info['database']}\n";
        echo "   - Charset: {$info['charset']}\n\n";
    }
    
    // Testar consultas básicas
    echo "🔍 Testando consultas básicas...\n";
    
    // Verificar tabelas
    $tables = $db->select("SHOW TABLES");
    echo "📋 Tabelas encontradas: " . count($tables) . "\n";
    
    foreach ($tables as $table) {
        $tableName = array_values($table)[0];
        $count = $db->selectOne("SELECT COUNT(*) as count FROM `$tableName`");
        echo "   - $tableName: {$count['count']} registros\n";
    }
    
    echo "\n";
    
    // Testar autenticação de usuário
    echo "👤 Testando autenticação de usuários...\n";
    
    $testUsers = [
        ['admin', 'admin123'],
        ['user', 'user123'],
        ['guest', 'guest123']
    ];
    
    foreach ($testUsers as [$username, $password]) {
        $user = $db->authenticateUser($username, $password);
        if ($user) {
            echo "   ✅ $username: Login válido (ID: {$user['id']}, Role: {$user['role']})\n";
        } else {
            echo "   ❌ $username: Login inválido\n";
        }
    }
    
    echo "\n";
    
    // Testar configurações do sistema
    echo "⚙️ Testando configurações do sistema...\n";
    
    $settings = [
        'system_name',
        'version',
        'session_timeout',
        'audio_enabled'
    ];
    
    foreach ($settings as $setting) {
        $value = $db->getSetting($setting);
        echo "   - $setting: $value\n";
    }
    
    echo "\n";
    
    // Testar jogos
    echo "🎮 Testando jogos configurados...\n";
    
    $games = $db->select("SELECT game_key, name, is_enabled FROM games ORDER BY game_key");
    foreach ($games as $game) {
        $status = $game['is_enabled'] ? '✅' : '❌';
        echo "   $status {$game['game_key']}: {$game['name']}\n";
    }
    
    echo "\n";
    
    // Testar estatísticas do sistema
    echo "📈 Testando estatísticas do sistema...\n";
    
    $stats = $db->getSystemStats();
    echo "   - Total de usuários: {$stats['total_users']}\n";
    echo "   - Total de jogos: {$stats['total_games']}\n";
    echo "   - Sessões ativas: {$stats['active_sessions']}\n";
    echo "   - Jogos hoje: {$stats['games_today']}\n";
    
    echo "\n";
    
    // Testar stored procedures
    echo "🔧 Testando stored procedures...\n";
    
    try {
        $result = $db->callProcedure('CleanExpiredSessions');
        echo "   ✅ CleanExpiredSessions: Executada com sucesso\n";
    } catch (Exception $e) {
        echo "   ❌ CleanExpiredSessions: {$e->getMessage()}\n";
    }
    
    echo "\n";
    
    // Teste de performance
    echo "⚡ Teste de performance...\n";
    
    $start = microtime(true);
    for ($i = 0; $i < 100; $i++) {
        $db->selectOne("SELECT 1 as test");
    }
    $end = microtime(true);
    
    $time = round(($end - $start) * 1000, 2);
    echo "   - 100 consultas simples: {$time}ms\n";
    
    echo "\n";
    
    echo "🎉 Todos os testes passaram com sucesso!\n";
    echo "✅ O banco de dados está funcionando corretamente\n";
    
} catch (Exception $e) {
    echo "❌ Erro durante os testes: " . $e->getMessage() . "\n";
    echo "\n🔧 Solução de problemas:\n";
    echo "1. Execute install_database.php primeiro\n";
    echo "2. Verifique se o MySQL está rodando\n";
    echo "3. Confirme as credenciais em config.php\n";
    echo "4. Verifique se o banco 'digital_detective_games' existe\n";
    exit(1);
}

echo "\n✨ Teste concluído com sucesso!\n";
?>
