<?php
/**
 * Administração de Usuários - DigitalGames
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

// Processar ações
$action = $_GET['action'] ?? '';
$message = '';
$error = '';

if ($action === 'toggle_role' && isset($_GET['user_id']) && isset($_GET['role'])) {
    $targetUserId = (int)$_GET['user_id'];
    $newRole = $_GET['role'];
    
    if ($targetUserId != $user['id']) {
        try {
            $db->update("UPDATE users SET role = ? WHERE id = ?", [$newRole, $targetUserId]);
            $message = "Role do usuário atualizado com sucesso!";
        } catch (Exception $e) {
            $error = "Erro ao atualizar role: " . $e->getMessage();
        }
    }
}

if ($action === 'toggle_status' && isset($_GET['user_id'])) {
    $targetUserId = (int)$_GET['user_id'];
    
    if ($targetUserId != $user['id']) {
        try {
            $currentStatus = $db->selectOne("SELECT is_active FROM users WHERE id = ?", [$targetUserId]);
            $newStatus = $currentStatus['is_active'] ? 0 : 1;
            
            $db->update("UPDATE users SET is_active = ? WHERE id = ?", [$newStatus, $targetUserId]);
            $message = "Status do usuário atualizado com sucesso!";
        } catch (Exception $e) {
            $error = "Erro ao atualizar status: " . $e->getMessage();
        }
    }
}

// Obter todos os usuários
$users = $db->select("SELECT id, username, name, email, role, is_active, created_at, last_login, login_count FROM users ORDER BY created_at DESC");

includeHeader('Gerenciar Usuários - DigitalGames');
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

    .alert {
        padding: 12px;
        margin-bottom: 15px;
        border: 2px solid;
        font-family: 'Press Start 2P';
        font-size: 10px;
    }

    .alert-success {
        background: #d4edda;
        border-color: #c3e6cb;
        color: #155724;
    }

    .alert-danger {
        background: #f8d7da;
        border-color: #f5c6cb;
        color: #721c24;
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

    td select, td button {
        font-family: 'Press Start 2P';
        font-size: 8px;
    }

    td button {
        padding: 5px 10px;
        background: #c0c0c0;
        border: 2px solid;
        border-color: #ffffff #808080 #808080 #ffffff;
        cursor: pointer;
    }

    td button:hover {
        background: #e0e0e0;
    }

    .role-admin { color: #ff0000; font-weight: bold; }
    .role-user { color: #008000; }
    .role-guest { color: #808080; }
</style>

<div class="admin-container">
    <div class="admin-window">
        <div class="admin-titlebar">
            <div class="title">
                <i class="fas fa-users"></i> Gerenciar Usuários
            </div>
            <div class="controls">
                <button onclick="window.location.href='profile.php'">
                    <i class="fas fa-arrow-left"></i> Voltar
                </button>
                <button onclick="window.location.href='index.php'">
                    <i class="fas fa-home"></i> Início
                </button>
            </div>
        </div>

        <div class="admin-content">
            <?php if ($message): ?>
                <div class="alert alert-success">
                    <i class="fas fa-check-circle"></i> <?php echo htmlspecialchars($message); ?>
                </div>
            <?php endif; ?>

            <?php if ($error): ?>
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle"></i> <?php echo htmlspecialchars($error); ?>
                </div>
            <?php endif; ?>

            <h2 style="font-family: 'Press Start 2P'; font-size: 14px; margin-bottom: 15px; color: #000080;">
                <i class="fas fa-list"></i> Lista de Usuários (<?php echo count($users); ?>)
            </h2>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Usuário</th>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Criado em</th>
                            <th>Último Login</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($users as $u): ?>
                            <tr>
                                <td><?php echo $u['id']; ?></td>
                                <td><?php echo htmlspecialchars($u['username']); ?></td>
                                <td><?php echo htmlspecialchars($u['name']); ?></td>
                                <td><?php echo htmlspecialchars($u['email'] ?? '-'); ?></td>
                                <td>
                                    <select onchange="updateRole(<?php echo $u['id']; ?>, this.value)"
                                            class="role-<?php echo $u['role']; ?>">
                                        <option value="admin" <?php echo $u['role'] === 'admin' ? 'selected' : ''; ?>>Admin</option>
                                        <option value="user" <?php echo $u['role'] === 'user' ? 'selected' : ''; ?>>User</option>
                                        <option value="guest" <?php echo $u['role'] === 'guest' ? 'selected' : ''; ?>>Guest</option>
                                    </select>
                                </td>
                                <td>
                                    <?php echo $u['is_active'] ? '<span style="color: green;">Ativo</span>' : '<span style="color: red;">Inativo</span>'; ?>
                                </td>
                                <td><?php echo date('d/m/Y', strtotime($u['created_at'])); ?></td>
                                <td><?php echo $u['last_login'] ? date('d/m/Y H:i', strtotime($u['last_login'])) : 'Nunca'; ?></td>
                                <td>
                                    <?php if ($u['id'] != $user['id']): ?>
                                        <button onclick="toggleStatus(<?php echo $u['id']; ?>)"
                                                style="<?php echo $u['is_active'] ? 'background: #ffcccc;' : 'background: #ccffcc;'; ?>">
                                            <i class="fas fa-<?php echo $u['is_active'] ? 'ban' : 'check'; ?>"></i>
                                            <?php echo $u['is_active'] ? 'Desativar' : 'Ativar'; ?>
                                        </button>
                                    <?php else: ?>
                                        <span style="color: #808080;">Você</span>
                                    <?php endif; ?>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<script>
    function updateRole(userId, newRole) {
        if (confirm('Deseja realmente alterar a role deste usuário?')) {
            window.location.href = 'admin_users.php?action=toggle_role&user_id=' + userId + '&role=' + newRole;
        }
    }

    function toggleStatus(userId) {
        if (confirm('Deseja realmente alterar o status deste usuário?')) {
            window.location.href = 'admin_users.php?action=toggle_status&user_id=' + userId;
        }
    }
</script>

<?php includeFooter(); ?>
