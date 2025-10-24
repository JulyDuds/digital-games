<?php
/**
 * Diagnóstico do Sistema - Digital Detective Games
 * Script para verificar problemas e configurações
 */

echo "<!DOCTYPE html>
<html lang='pt-PT'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Diagnóstico - Digital Detective Games</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f0f0f0; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .success { color: #00aa00; font-weight: bold; }
        .error { color: #aa0000; font-weight: bold; }
        .warning { color: #aa6600; font-weight: bold; }
        .info { color: #0066aa; }
        h1 { color: #333; }
        h2 { color: #666; border-bottom: 1px solid #ccc; }
        .check { margin: 10px 0; padding: 10px; border-left: 4px solid #ccc; }
        .check.success { border-left-color: #00aa00; }
        .check.error { border-left-color: #aa0000; }
        .check.warning { border-left-color: #aa6600; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
<div class='container'>
    <h1>🔍 Diagnóstico do Sistema - Digital Detective Games</h1>";

// Verificações básicas
echo "<h2>📋 Verificações Básicas</h2>";

// PHP Version
$phpVersion = phpversion();
echo "<div class='check " . (version_compare($phpVersion, '7.4.0', '>=') ? 'success' : 'error') . "'>
    <strong>Versão do PHP:</strong> $phpVersion " . 
    (version_compare($phpVersion, '7.4.0', '>=') ? '✅' : '❌ (Mínimo: 7.4.0)') . "
</div>";

// Extensões PHP necessárias
$requiredExtensions = ['pdo', 'pdo_mysql', 'json', 'session'];
foreach ($requiredExtensions as $ext) {
    $loaded = extension_loaded($ext);
    echo "<div class='check " . ($loaded ? 'success' : 'error') . "'>
        <strong>Extensão $ext:</strong> " . ($loaded ? '✅ Carregada' : '❌ Não encontrada') . "
    </div>";
}

// Arquivos necessários
echo "<h2>📁 Arquivos do Sistema</h2>";

$requiredFiles = [
    'config.php' => 'Configurações principais',
    'includes.php' => 'Componentes reutilizáveis',
    'database/Database.php' => 'Classe de banco de dados',
    'login.html' => 'Página de login',
    'login.php' => 'Processamento de login',
    'index.php' => 'Página principal'
];

foreach ($requiredFiles as $file => $description) {
    $exists = file_exists($file);
    echo "<div class='check " . ($exists ? 'success' : 'error') . "'>
        <strong>$file:</strong> " . ($exists ? '✅ Existe' : '❌ Não encontrado') . " - $description
    </div>";
}

// Pastas necessárias
echo "<h2>📂 Pastas do Sistema</h2>";

$requiredDirs = [
    'database' => 'Arquivos de banco de dados',
    'logs' => 'Logs do sistema',
    'api' => 'APIs do sistema',
    'css' => 'Estilos CSS',
    'js' => 'Scripts JavaScript',
    'img' => 'Imagens e ícones'
];

foreach ($requiredDirs as $dir => $description) {
    $exists = is_dir($dir);
    $writable = $exists ? is_writable($dir) : false;
    $status = $exists ? ($writable ? '✅ Existe e gravável' : '⚠️ Existe mas não gravável') : '❌ Não existe';
    $class = $exists ? ($writable ? 'success' : 'warning') : 'error';
    
    echo "<div class='check $class'>
        <strong>$dir/:</strong> $status - $description
    </div>";
}

// Configurações do banco
echo "<h2>🗄️ Configuração do Banco de Dados</h2>";

try {
    if (file_exists('config.php')) {
        require_once 'config.php';
        
        echo "<div class='check success'>
            <strong>Arquivo config.php:</strong> ✅ Carregado com sucesso
        </div>";
        
        // Testar conexão com banco
        try {
            $db = getDatabase();
            if ($db && $db->testConnection()) {
                echo "<div class='check success'>
                    <strong>Conexão com banco:</strong> ✅ Conectado com sucesso
                </div>";
                
                // Verificar tabelas
                $tables = $db->select("SHOW TABLES");
                echo "<div class='check success'>
                    <strong>Tabelas no banco:</strong> ✅ " . count($tables) . " tabelas encontradas
                </div>";
                
                // Verificar usuários
                $users = $db->select("SELECT COUNT(*) as count FROM users");
                echo "<div class='check success'>
                    <strong>Usuários cadastrados:</strong> ✅ " . $users[0]['count'] . " usuários
                </div>";
                
            } else {
                echo "<div class='check error'>
                    <strong>Conexão com banco:</strong> ❌ Falha na conexão
                </div>";
            }
        } catch (Exception $e) {
            echo "<div class='check error'>
                <strong>Conexão com banco:</strong> ❌ Erro: " . htmlspecialchars($e->getMessage()) . "
            </div>";
        }
    } else {
        echo "<div class='check error'>
            <strong>Arquivo config.php:</strong> ❌ Não encontrado
        </div>";
    }
} catch (Exception $e) {
    echo "<div class='check error'>
        <strong>Erro ao carregar configurações:</strong> ❌ " . htmlspecialchars($e->getMessage()) . "
    </div>";
}

// Configurações do servidor
echo "<h2>🖥️ Configurações do Servidor</h2>";

echo "<div class='check info'>
    <strong>Servidor:</strong> " . ($_SERVER['SERVER_SOFTWARE'] ?? 'Desconhecido') . "
</div>";

echo "<div class='check info'>
    <strong>Document Root:</strong> " . ($_SERVER['DOCUMENT_ROOT'] ?? 'Desconhecido') . "
</div>";

echo "<div class='check info'>
    <strong>Script Path:</strong> " . ($_SERVER['SCRIPT_FILENAME'] ?? 'Desconhecido') . "
</div>";

// Permissões
echo "<h2>🔐 Permissões de Arquivos</h2>";

$importantFiles = ['.htaccess', 'config.php', 'index.php', 'login.php'];
foreach ($importantFiles as $file) {
    if (file_exists($file)) {
        $perms = fileperms($file);
        $readable = is_readable($file);
        $writable = is_writable($file);
        
        echo "<div class='check " . ($readable ? 'success' : 'error') . "'>
            <strong>$file:</strong> " . 
            ($readable ? '✅ Legível' : '❌ Não legível') . 
            ($writable ? ' e gravável' : ' mas não gravável') . "
        </div>";
    }
}

// Logs de erro
echo "<h2>📝 Logs de Erro</h2>";

$errorLog = ini_get('error_log');
if ($errorLog && file_exists($errorLog)) {
    $logSize = filesize($errorLog);
    echo "<div class='check info'>
        <strong>Log de erros PHP:</strong> $errorLog (" . number_format($logSize) . " bytes)
    </div>";
    
    if ($logSize > 0) {
        $lastErrors = file_get_contents($errorLog);
        $lines = explode("\n", $lastErrors);
        $recentLines = array_slice($lines, -5);
        
        echo "<div class='check warning'>
            <strong>Últimos erros:</strong>
            <pre>" . htmlspecialchars(implode("\n", $recentLines)) . "</pre>
        </div>";
    }
} else {
    echo "<div class='check warning'>
        <strong>Log de erros PHP:</strong> ⚠️ Não configurado ou não encontrado
    </div>";
}

// Recomendações
echo "<h2>💡 Recomendações</h2>";

echo "<div class='check info'>
    <strong>Se você está vendo erro 500:</strong>
    <ul>
        <li>Execute: <code>install_database.php</code> para configurar o banco</li>
        <li>Verifique se o MySQL está rodando no XAMPP</li>
        <li>Confirme as permissões das pastas</li>
        <li>Verifique o arquivo .htaccess</li>
    </ul>
</div>";

echo "<div class='check info'>
    <strong>Próximos passos:</strong>
    <ol>
        <li>Se tudo estiver verde ✅, acesse: <a href='login.html'>login.html</a></li>
        <li>Se houver erros ❌, corrija-os antes de continuar</li>
        <li>Execute <a href='install_database.php'>install_database.php</a> se necessário</li>
        <li>Execute <a href='test_database.php'>test_database.php</a> para testar o banco</li>
    </ol>
</div>";

echo "</div></body></html>";
?>
