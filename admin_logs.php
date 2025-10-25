<?php
/**
 * Logs Administrativos - DigitalGames
 */

require_once 'config.php';
require_once 'includes.php';

// Verificar se usuário está logado
requireLogin();

// Verificar se é admin
if (!hasPermission('admin')) {
    header('Location: profile.php?error=' . urlencode('Acesso negado. Apenas administradores.'));
    exit;
}

$user = getCurrentUser();
$db = getDatabase();

// Obter logs - tentar admin_logs primeiro, senão login_logs
$logs = [];
try {
    $result = $db->select("
        SELECT 
            'admin_log' as log_type,
            created_at, 
            action_type as action, 
            details,
            ip_address as ip,
            NULL as username,
            NULL as success
        FROM admin_logs 
        ORDER BY created_at DESC 
        LIMIT 100
    ");
    $logs = is_array($result) ? $result : [];
} catch (Exception $e) {
    // Se admin_logs não existir, buscar de login_logs
    try {
        $result = $db->select("
            SELECT 
                'login_log' as log_type,
                created_at,
                IF(success = 1, 'SUCCESS', 'FAILED') as action,
                CONCAT('Login attempt - ', username) as details,
                ip_address as ip,
                username,
                success
            FROM login_logs 
            ORDER BY created_at DESC 
            LIMIT 100
        ");
        $logs = is_array($result) ? $result : [];
    } catch (Exception $e2) {
        $logs = [];
    }
}

includeHeader('Logs Administrativos - DigitalGames');
?>

<style>
    .admin-container {
        min-height: 100vh;
        background: linear-gradient(135deg, #008080 0%, #004040 100%);
        padding: 20px;
    }

    .admin-window {
        max-width: 1200px;
        margin: 0 auto;
        background: #c0c0c0;
        border: 3px solid;
        border-color: #ffffff #000000 #000000 #ffffff;
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.5);
    }

    .admin-titlebar {
        background: linear-gradient(90deg, #000080 0%, #0000ff 100%);
        color: white;
        padding: 10px 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .admin-titlebar .title {
        font-size: 16px;
        font-weight: bold;
    }

    .admin-titlebar .controls button {
        background: #c0c0c0;
        border: 2px solid;
        border-color: #ffffff #808080 #808080 #ffffff;
        padding: 5px 12px;
        cursor: pointer;
        margin-left: 5px;
        font-family: 'Press Start 2P';
        font-size: 10px;
    }

    .admin-titlebar .controls button:hover {
        background: #e0e0e0;
    }

    .admin-content {
        padding: 20px;
        max-height: calc(100vh - 150px);
        overflow-y: auto;
    }

    .table-container {
        overflow-x: auto;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        background: #ffffff;
        border: 2px solid #808080;
    }

    thead {
        background: #000080;
        color: white;
    }

    th, td {
        padding: 10px;
        text-align: left;
        border: 1px solid #808080;
        font-family: 'Press Start 2P';
        font-size: 10px;
    }

    .log-success { color: #008000; font-weight: bold; }
    .log-failed { color: #ff0000; font-weight: bold; }
    .log-admin { color: #000080; font-weight: bold; }
</style>

<div class="admin-container">
    <div class="admin-window">
        <div class="admin-titlebar">
            <div class="title">
                <i class="fas fa-history"></i> Logs do Sistema
            </div>
            <div class="controls">
                <button onclick="window.location.href='admin_users.php'">
                    <i class="fas fa-users"></i> Usuários
                </button>
                <button onclick="window.location.href='profile.php'">
                    <i class="fas fa-arrow-left"></i> Voltar
                </button>
                <button onclick="window.location.href='index.php'">
                    <i class="fas fa-home"></i> Início
                </button>
            </div>
        </div>

        <div class="admin-content">
            <h2 style="font-family: 'Press Start 2P'; font-size: 14px; margin-bottom: 15px; color: #000080;">
                <i class="fas fa-list"></i> Logs Recentes (<?php echo count($logs); ?>)
            </h2>

            <?php if (empty($logs)): ?>
                <div style="padding: 20px; text-align: center; background: #ffffcc; border: 2px solid #808080;">
                    <i class="fas fa-info-circle" style="font-size: 48px; color: #808080; margin-bottom: 10px;"></i>
                    <p style="font-family: 'Press Start 2P'; font-size: 12px; color: #000;">
                        Nenhum log encontrado no banco de dados.
                    </p>
                </div>
            <?php else: ?>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Data/Hora</th>
                                <th>Tipo</th>
                                <th>Ação</th>
                                <th>Detalhes</th>
                                <th>Usuário</th>
                                <th>IP</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($logs as $log): ?>
                                <tr>
                                    <td><?php echo date('d/m/Y H:i:s', strtotime($log['created_at'])); ?></td>
                                    <td>
                                        <span class="log-<?php echo $log['log_type'] === 'admin_log' ? 'admin' : ($log['success'] ? 'success' : 'failed'); ?>">
                                            <?php echo strtoupper($log['log_type']); ?>
                                        </span>
                                    </td>
                                    <td>
                                        <?php if (isset($log['success']) && !$log['success']): ?>
                                            <span class="log-failed"><?php echo htmlspecialchars($log['action']); ?></span>
                                        <?php else: ?>
                                            <span class="log-success"><?php echo htmlspecialchars($log['action']); ?></span>
                                        <?php endif; ?>
                                    </td>
                                    <td><?php echo htmlspecialchars($log['details'] ?? '-'); ?></td>
                                    <td><?php echo htmlspecialchars($log['username'] ?? '-'); ?></td>
                                    <td><?php echo htmlspecialchars($log['ip'] ?? '-'); ?></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<?php includeFooter(); ?>
