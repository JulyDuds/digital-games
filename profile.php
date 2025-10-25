<?php
/**
 * Página de Perfil - Digital Detective Games
 * Exibe estatísticas e informações do usuário
 */

require_once 'config.php';
require_once 'includes.php';

// Verificar se usuário está logado
requireLogin();

$user = getCurrentUser();
$db = getDatabase();

// Obter estatísticas de todos os jogos
$userStats = $db->select(
    "SELECT 
        g.game_key,
        g.name as game_name,
        gs.games_played,
        gs.games_won,
        gs.best_score,
        gs.total_time,
        gs.last_played,
        CASE 
            WHEN gs.games_played > 0 THEN ROUND((gs.games_won / gs.games_played) * 100, 1)
            ELSE 0 
        END as win_rate
    FROM games g
    LEFT JOIN game_stats gs ON g.id = gs.game_id AND gs.user_id = ?
    WHERE g.is_enabled = TRUE
    ORDER BY gs.games_played DESC, g.name ASC",
    [$user['id']]
);

// Calcular estatísticas gerais
$totalGamesPlayed = 0;
$totalGamesWon = 0;
$totalPlayTime = 0;
$gamesWithStats = 0;

foreach ($userStats as $stat) {
    if ($stat['games_played'] > 0) {
        $totalGamesPlayed += $stat['games_played'];
        $totalGamesWon += $stat['games_won'];
        $totalPlayTime += $stat['total_time'];
        $gamesWithStats++;
    }
}

$overallWinRate = $totalGamesPlayed > 0 ? round(($totalGamesWon / $totalGamesPlayed) * 100, 1) : 0;

// Formatar tempo total
function formatTime($seconds) {
    if ($seconds < 60) {
        return $seconds . 's';
    } elseif ($seconds < 3600) {
        return floor($seconds / 60) . 'min ' . ($seconds % 60) . 's';
    } else {
        $hours = floor($seconds / 3600);
        $minutes = floor(($seconds % 3600) / 60);
        return $hours . 'h ' . $minutes . 'min';
    }
}

// Obter informações do usuário do banco
$userInfo = $db->selectOne(
    "SELECT 
        username,
        name,
        email,
        role,
        created_at,
        last_login,
        login_count
    FROM users
    WHERE id = ?",
    [$user['id']]
);

includeHeader('Perfil de ' . $user['name']);
?>

<style>
    /* Estilos para a página de perfil */
    .profile-container {
        min-height: 100vh;
        background: linear-gradient(135deg, #008080 0%, #004040 100%);
        padding: 20px;
        overflow-y: auto;
    }

    .profile-window {
        max-width: 1000px;
        margin: 0 auto;
        background: #c0c0c0;
        border: 2px solid;
        border-color: #ffffff #808080 #808080 #ffffff;
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.5);
    }

    .profile-titlebar {
        background: linear-gradient(90deg, #000080 0%, #0000ff 100%);
        color: white;
        padding: 8px 12px;
        font-size: 12px;
        font-weight: bold;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .profile-titlebar .title {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .profile-titlebar .controls button {
        background: #c0c0c0;
        border: 1px solid #808080;
        color: #000;
        padding: 2px 8px;
        font-size: 10px;
        cursor: pointer;
        margin-left: 5px;
    }

    .profile-titlebar .controls button:hover {
        background: #e0e0e0;
    }

    .profile-content {
        padding: 20px;
    }

    .profile-header {
        background: #ffffff;
        border: 2px solid;
        border-color: #808080 #ffffff #ffffff #808080;
        padding: 20px;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 20px;
    }

    .profile-avatar {
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, #000080, #0000ff);
        border: 2px solid #808080;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 48px;
        color: white;
        flex-shrink: 0;
    }

    .profile-info {
        flex: 1;
    }

    .profile-info h1 {
        margin: 0 0 5px 0;
        color: #000080;
        font-size: 24px;
    }

    .profile-info p {
        margin: 3px 0;
        font-size: 12px;
        color: #000;
    }

    .profile-badge {
        display: inline-block;
        background: #000080;
        color: white;
        padding: 2px 8px;
        font-size: 10px;
        font-weight: bold;
        margin-left: 10px;
        border: 1px solid #808080;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-bottom: 20px;
    }

    .stat-card {
        background: #ffffff;
        border: 2px solid;
        border-color: #808080 #ffffff #ffffff #808080;
        padding: 15px;
        text-align: center;
    }

    .stat-card .stat-value {
        font-size: 32px;
        font-weight: bold;
        color: #000080;
        margin: 10px 0;
    }

    .stat-card .stat-label {
        font-size: 12px;
        color: #000;
        font-weight: bold;
    }

    .stat-card .stat-icon {
        font-size: 24px;
        color: #808080;
    }

    .games-section {
        background: #ffffff;
        border: 2px solid;
        border-color: #808080 #ffffff #ffffff #808080;
        padding: 20px;
    }

    .games-section h2 {
        margin: 0 0 15px 0;
        color: #000080;
        font-size: 18px;
        border-bottom: 2px solid #808080;
        padding-bottom: 8px;
    }

    .game-stat-item {
        background: #c0c0c0;
        border: 2px solid;
        border-color: #ffffff #808080 #808080 #ffffff;
        padding: 15px;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 15px;
    }

    .game-stat-item.no-plays {
        opacity: 0.6;
    }

    .game-stat-icon {
        width: 48px;
        height: 48px;
        background: #000080;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        border: 2px solid #808080;
        flex-shrink: 0;
    }

    .game-stat-info {
        flex: 1;
    }

    .game-stat-info h3 {
        margin: 0 0 5px 0;
        color: #000080;
        font-size: 14px;
    }

    .game-stat-details {
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
        font-size: 11px;
    }

    .game-stat-details span {
        display: flex;
        align-items: center;
        gap: 5px;
    }

    .game-stat-details .label {
        color: #808080;
        font-weight: bold;
    }

    .game-stat-details .value {
        color: #000;
    }

    .profile-actions {
        margin-top: 20px;
        display: flex;
        gap: 10px;
        justify-content: center;
    }

    .btn {
        padding: 8px 20px;
        border: 2px solid;
        border-color: #ffffff #808080 #808080 #ffffff;
        background: #c0c0c0;
        font-size: 12px;
        font-weight: bold;
        cursor: pointer;
        font-family: 'MS Sans Serif', sans-serif;
        text-decoration: none;
        color: #000;
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }

    .btn:hover {
        background: #e0e0e0;
    }

    .btn:active {
        border-color: #808080 #ffffff #ffffff #808080;
    }

    .btn-primary {
        background: #000080;
        color: white;
        border-color: #000080;
    }

    .btn-primary:hover {
        background: #0000ff;
    }

    .win-rate-bar {
        height: 8px;
        background: #808080;
        border: 1px solid #000;
        margin-top: 5px;
        position: relative;
        overflow: hidden;
    }

    .win-rate-fill {
        height: 100%;
        background: linear-gradient(90deg, #00ff00, #00aa00);
        transition: width 0.5s;
    }

    .no-stats-message {
        text-align: center;
        padding: 40px;
        color: #808080;
        font-style: italic;
    }

    @media (max-width: 768px) {
        .profile-header {
            flex-direction: column;
            text-align: center;
        }

        .stats-grid {
            grid-template-columns: repeat(2, 1fr);
        }

        .game-stat-item {
            flex-direction: column;
            text-align: center;
        }
    }
</style>

<div class="profile-container">
    <div class="profile-window">
        <div class="profile-titlebar">
            <div class="title">
                <i class="fas fa-user-circle"></i>
                <span>Perfil do Usuário - <?php echo htmlspecialchars($user['name']); ?></span>
            </div>
            <div class="controls">
                <button onclick="window.location.href='index.php'">
                    <i class="fas fa-home"></i> Início
                </button>
                <button onclick="window.close()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>

        <div class="profile-content">
            <!-- Cabeçalho do Perfil -->
            <div class="profile-header">
                <div class="profile-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="profile-info">
                    <h1>
                        <?php echo htmlspecialchars($userInfo['name']); ?>
                        <span class="profile-badge"><?php echo strtoupper($userInfo['role']); ?></span>
                    </h1>
                    <p><i class="fas fa-user"></i> <strong>Usuário:</strong> <?php echo htmlspecialchars($userInfo['username']); ?></p>
                    <?php if (!empty($userInfo['email'])): ?>
                        <p><i class="fas fa-envelope"></i> <strong>E-mail:</strong> <?php echo htmlspecialchars($userInfo['email']); ?></p>
                    <?php endif; ?>
                    <p><i class="fas fa-calendar"></i> <strong>Membro desde:</strong> <?php echo date('d/m/Y', strtotime($userInfo['created_at'])); ?></p>
                    <p><i class="fas fa-sign-in-alt"></i> <strong>Último login:</strong> <?php echo $userInfo['last_login'] ? date('d/m/Y H:i', strtotime($userInfo['last_login'])) : 'Nunca'; ?></p>
                    <p><i class="fas fa-hashtag"></i> <strong>Total de logins:</strong> <?php echo $userInfo['login_count']; ?></p>
                </div>
            </div>

            <!-- Estatísticas Gerais -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-gamepad"></i></div>
                    <div class="stat-value"><?php echo $totalGamesPlayed; ?></div>
                    <div class="stat-label">Partidas Jogadas</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-trophy"></i></div>
                    <div class="stat-value"><?php echo $totalGamesWon; ?></div>
                    <div class="stat-label">Vitórias</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-percentage"></i></div>
                    <div class="stat-value"><?php echo $overallWinRate; ?>%</div>
                    <div class="stat-label">Taxa de Vitória</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-clock"></i></div>
                    <div class="stat-value"><?php echo formatTime($totalPlayTime); ?></div>
                    <div class="stat-label">Tempo Total</div>
                </div>
            </div>

            <!-- Estatísticas por Jogo -->
            <div class="games-section">
                <h2><i class="fas fa-chart-bar"></i> Estatísticas por Jogo</h2>
                
                <?php if ($gamesWithStats > 0): ?>
                    <?php foreach ($userStats as $stat): ?>
                        <?php 
                        $hasPlayed = $stat['games_played'] > 0;
                        $gameClass = $hasPlayed ? '' : 'no-plays';
                        ?>
                        <div class="game-stat-item <?php echo $gameClass; ?>">
                            <div class="game-stat-icon">
                                <i class="fas fa-gamepad"></i>
                            </div>
                            <div class="game-stat-info">
                                <h3><?php echo htmlspecialchars($stat['game_name']); ?></h3>
                                
                                <?php if ($hasPlayed): ?>
                                    <div class="game-stat-details">
                                        <span>
                                            <span class="label">Jogadas:</span>
                                            <span class="value"><?php echo $stat['games_played']; ?></span>
                                        </span>
                                        <span>
                                            <span class="label">Vitórias:</span>
                                            <span class="value"><?php echo $stat['games_won']; ?></span>
                                        </span>
                                        <span>
                                            <span class="label">Taxa:</span>
                                            <span class="value"><?php echo $stat['win_rate']; ?>%</span>
                                        </span>
                                        <span>
                                            <span class="label">Melhor Score:</span>
                                            <span class="value"><?php echo $stat['best_score']; ?></span>
                                        </span>
                                        <span>
                                            <span class="label">Tempo:</span>
                                            <span class="value"><?php echo formatTime($stat['total_time']); ?></span>
                                        </span>
                                        <span>
                                            <span class="label">Último jogo:</span>
                                            <span class="value"><?php echo date('d/m/Y H:i', strtotime($stat['last_played'])); ?></span>
                                        </span>
                                    </div>
                                    <div class="win-rate-bar">
                                        <div class="win-rate-fill" style="width: <?php echo $stat['win_rate']; ?>%"></div>
                                    </div>
                                <?php else: ?>
                                    <div class="game-stat-details">
                                        <span style="color: #808080; font-style: italic;">
                                            <i class="fas fa-info-circle"></i> Ainda não jogado
                                        </span>
                                    </div>
                                <?php endif; ?>
                            </div>
                        </div>
                    <?php endforeach; ?>
                <?php else: ?>
                    <div class="no-stats-message">
                        <i class="fas fa-gamepad" style="font-size: 48px; margin-bottom: 15px;"></i>
                        <p>Você ainda não jogou nenhum jogo.</p>
                        <p>Comece a jogar para ver suas estatísticas aqui!</p>
                    </div>
                <?php endif; ?>
            </div>

            <!-- Ações -->
            <div class="profile-actions">
                <a href="index.php" class="btn btn-primary">
                    <i class="fas fa-home"></i> Voltar ao Início
                </a>
                <a href="logout.php" class="btn">
                    <i class="fas fa-sign-out-alt"></i> Sair
                </a>
            </div>
        </div>
    </div>
</div>

<script>
    // Efeitos sonoros
    function playSound(frequency, duration, gain = 0.1) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            gainNode.gain.setValueAtTime(gain, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (e) {
            // Silenciosamente ignorar erros de áudio
        }
    }

    // Adicionar efeitos sonoros aos botões
    document.addEventListener('DOMContentLoaded', function() {
        const buttons = document.querySelectorAll('.btn, button');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => playSound(600, 0.1, 0.15));
        });
    });

    // Som de entrada
    playSound(800, 0.2, 0.2);
</script>

<?php includeFooter(); ?>

