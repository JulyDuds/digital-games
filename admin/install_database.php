<?php
/**
 * Instalador do Banco de Dados - Digital Detective Games
 * Script para criar e configurar o banco de dados MySQL
 */

// Configurações do banco de dados
$dbConfig = [
    'host' => 'localhost',
    'username' => 'root',
    'password' => '',
    'database' => 'digital_detective_games'
];

echo "🚀 Instalador do Banco de Dados - Digital Detective Games\n";
echo "=======================================================\n\n";

try {
    // Conectar ao MySQL sem especificar banco
    $pdo = new PDO(
        "mysql:host={$dbConfig['host']};charset=utf8mb4",
        $dbConfig['username'],
        $dbConfig['password'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
    
    echo "✅ Conexão com MySQL estabelecida\n";
    
    // Ler arquivo SQL (usar versão corrigida)
    $sqlFile = __DIR__ . '/../database/schema_fixed.sql';
    if (!file_exists($sqlFile)) {
        // Tentar arquivo original se o corrigido não existir
        $sqlFile = __DIR__ . '/../database/schema.sql';
        if (!file_exists($sqlFile)) {
            throw new Exception("Arquivo schema.sql não encontrado em: " . __DIR__ . '/../database/');
        }
    }
    
    $sql = file_get_contents($sqlFile);
    if (!$sql) {
        throw new Exception("Erro ao ler arquivo schema.sql");
    }
    
    echo "✅ Arquivo schema.sql carregado\n";
    
    // Dividir SQL em comandos individuais
    $commands = array_filter(
        array_map('trim', explode(';', $sql)),
        function($cmd) {
            return !empty($cmd) && !preg_match('/^--/', $cmd);
        }
    );
    
    echo "📊 Executando " . count($commands) . " comandos SQL...\n\n";
    
    $successCount = 0;
    $errorCount = 0;
    
    foreach ($commands as $i => $command) {
        try {
            if (trim($command)) {
                $pdo->exec($command);
                $successCount++;
                
                // Mostrar progresso
                if (($i + 1) % 10 == 0) {
                    echo "⏳ Progresso: " . ($i + 1) . "/" . count($commands) . " comandos executados\n";
                }
            }
        } catch (PDOException $e) {
            $errorCount++;
            echo "❌ Erro no comando " . ($i + 1) . ": " . $e->getMessage() . "\n";
        }
    }
    
    echo "\n📈 Resultado da Instalação:\n";
    echo "✅ Comandos executados com sucesso: $successCount\n";
    echo "❌ Comandos com erro: $errorCount\n\n";
    
    if ($errorCount == 0) {
        echo "🎉 Banco de dados instalado com sucesso!\n\n";
        
        // Verificar instalação
        echo "🔍 Verificando instalação...\n";
        
        $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        echo "📋 Tabelas criadas: " . count($tables) . "\n";
        
        foreach ($tables as $table) {
            $count = $pdo->query("SELECT COUNT(*) FROM `$table`")->fetchColumn();
            echo "   - $table: $count registros\n";
        }
        
        echo "\n👤 Usuários padrão criados:\n";
        $users = $pdo->query("SELECT username, name, role FROM users")->fetchAll();
        foreach ($users as $user) {
            echo "   - {$user['username']} ({$user['name']}) - {$user['role']}\n";
        }
        
        echo "\n🎮 Jogos configurados:\n";
        $games = $pdo->query("SELECT game_key, name FROM games WHERE is_enabled = TRUE")->fetchAll();
        foreach ($games as $game) {
            echo "   - {$game['game_key']}: {$game['name']}\n";
        }
        
        echo "\n⚙️ Configurações do sistema:\n";
        $settings = $pdo->query("SELECT setting_key, setting_value FROM system_settings")->fetchAll();
        foreach ($settings as $setting) {
            echo "   - {$setting['setting_key']}: {$setting['setting_value']}\n";
        }
        
        echo "\n🚀 Próximos passos:\n";
        echo "1. Configure as permissões: chmod 755 logs/ data/ api/\n";
        echo "2. Acesse login.html no seu navegador\n";
        echo "3. Use as credenciais padrão:\n";
        echo "   - admin / admin123\n";
        echo "   - user / user123\n";
        echo "   - guest / guest123\n";
        echo "4. Teste o sistema de login e jogos\n\n";
        
        echo "📖 Consulte o README.md para mais informações\n";
        
    } else {
        echo "⚠️ Instalação concluída com erros. Verifique os logs acima.\n";
        echo "💡 Dica: Alguns erros podem ser normais se as tabelas já existirem.\n";
    }
    
} catch (Exception $e) {
    echo "❌ Erro fatal: " . $e->getMessage() . "\n";
    echo "\n🔧 Solução de problemas:\n";
    echo "1. Verifique se o MySQL está rodando no XAMPP\n";
    echo "2. Confirme as credenciais do banco de dados\n";
    echo "3. Verifique se o arquivo schema.sql existe\n";
    echo "4. Execute: php -v (para verificar versão do PHP)\n";
    exit(1);
}

echo "\n✨ Instalação finalizada!\n";
?>
