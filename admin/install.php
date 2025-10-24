<?php
/**
 * Instalador - Digital Detective Games
 * Script de instalação e configuração inicial
 */

// Verificar se já foi instalado
if (file_exists('data/installed.lock')) {
    die('Sistema já foi instalado. Para reinstalar, delete o arquivo data/installed.lock');
}

// Criar diretórios necessários
$directories = ['logs', 'data', 'api'];

foreach ($directories as $dir) {
    if (!file_exists($dir)) {
        if (!mkdir($dir, 0755, true)) {
            die("Erro ao criar diretório: $dir");
        }
    }
}

// Criar arquivo de configuração inicial
$config = [
    'installed' => true,
    'install_date' => date('Y-m-d H:i:s'),
    'version' => '1.0.0',
    'admin_created' => false
];

file_put_contents('data/install_config.json', json_encode($config, JSON_PRETTY_PRINT));

// Criar arquivo de lock
file_put_contents('data/installed.lock', date('Y-m-d H:i:s'));

echo "✅ Instalação concluída com sucesso!\n";
echo "📁 Diretórios criados: " . implode(', ', $directories) . "\n";
echo "🔧 Arquivo de configuração criado\n";
echo "🔒 Arquivo de lock criado\n";
echo "\n";
echo "🚀 Próximos passos:\n";
echo "1. Configure as permissões: chmod 755 logs/ data/ api/\n";
echo "2. Acesse login.html no seu navegador\n";
echo "3. Use as credenciais padrão:\n";
echo "   - admin / admin123\n";
echo "   - user / user123\n";
echo "   - guest / guest123\n";
echo "\n";
echo "📖 Consulte o README.md para mais informações\n";
?>
