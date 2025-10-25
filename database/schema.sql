-- Digital Detective Games - Banco de Dados MySQL
-- Script de criação do banco de dados para XAMPP

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS digital_detective_games 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Usar o banco de dados
USE digital_detective_games;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    role ENUM('admin', 'user', 'guest') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    login_count INT DEFAULT 0,
    INDEX idx_username (username),
    INDEX idx_role (role),
    INDEX idx_active (is_active)
);

-- Tabela de sessões
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_id VARCHAR(128) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL DEFAULT '1970-01-01 00:00:01',
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session_id (session_id),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);

-- Tabela de jogos
CREATE TABLE IF NOT EXISTS games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_game_key (game_key),
    INDEX idx_enabled (is_enabled)
);

-- Tabela de estatísticas dos jogos
CREATE TABLE IF NOT EXISTS game_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    games_played INT DEFAULT 0,
    games_won INT DEFAULT 0,
    best_score INT DEFAULT 0,
    total_time INT DEFAULT 0,
    last_played TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_game (user_id, game_id),
    INDEX idx_user_id (user_id),
    INDEX idx_game_id (game_id),
    INDEX idx_best_score (best_score)
);

-- Tabela de logs de login
CREATE TABLE IF NOT EXISTS login_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50),
    ip_address VARCHAR(45),
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_ip_address (ip_address),
    INDEX idx_success (success),
    INDEX idx_created_at (created_at)
);

-- Tabela de logs de atividade
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_key (setting_key)
);

-- Inserir jogos padrão
INSERT INTO games (game_key, name, description, is_enabled) VALUES
('tictactoe', 'Tic-Tac-Toe', 'Jogo da Velha contra IA', TRUE),
('minesweeper', 'Campo Minado', 'Encontre todas as minas', TRUE),
('jogodaforca', 'Jogo da Forca', 'Adivinhe a palavra secreta', TRUE),
('pong', 'Pong', 'Clássico jogo de tênis de mesa', TRUE),
('memory', 'Memory Game', 'Encontre todos os pares', TRUE),
('snake', 'Snake', 'Clássico jogo da cobrinha', TRUE),
('wordle', 'Wordle', 'Adivinhe a palavra em 6 tentativas', TRUE),
('solitaire', 'Paciência', 'Jogo de cartas clássico', TRUE);

-- Inserir usuários padrão (senhas são hash MD5 para exemplo - em produção usar password_hash)
INSERT INTO users (username, password, name, role, is_active) VALUES
('admin', MD5('admin123'), 'Administrador', 'admin', TRUE),
('user', MD5('user123'), 'Usuário Padrão', 'user', TRUE),
('guest', MD5('guest123'), 'Convidado', 'guest', TRUE);

-- Inserir configurações padrão do sistema
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('system_name', 'Digital Detective Games', 'Nome do sistema'),
('version', '1.0.0', 'Versão do sistema'),
('session_timeout', '3600', 'Timeout da sessão em segundos'),
('max_login_attempts', '5', 'Máximo de tentativas de login'),
('login_lockout_time', '900', 'Tempo de bloqueio após tentativas falhadas em segundos'),
('audio_enabled', '1', 'Efeitos sonoros habilitados'),
('maintenance_mode', '0', 'Modo de manutenção'),
('registration_enabled', '1', 'Registro de novos usuários habilitado');

-- Criar views úteis
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.username,
    u.name,
    u.role,
    u.last_login,
    u.login_count,
    COUNT(DISTINCT gs.game_id) as games_played_count,
    SUM(gs.games_played) as total_games_played,
    SUM(gs.games_won) as total_games_won,
    MAX(gs.best_score) as best_score_overall,
    SUM(gs.total_time) as total_play_time
FROM users u
LEFT JOIN game_stats gs ON u.id = gs.user_id
WHERE u.is_active = TRUE
GROUP BY u.id, u.username, u.name, u.role, u.last_login, u.login_count;

CREATE VIEW game_popularity AS
SELECT 
    g.game_key,
    g.name,
    g.description,
    COUNT(DISTINCT gs.user_id) as unique_players,
    SUM(gs.games_played) as total_games,
    SUM(gs.games_won) as total_wins,
    AVG(gs.games_won / NULLIF(gs.games_played, 0)) as win_rate,
    MAX(gs.best_score) as highest_score
FROM games g
LEFT JOIN game_stats gs ON g.id = gs.game_id
WHERE g.is_enabled = TRUE
GROUP BY g.id, g.game_key, g.name, g.description;

-- Criar stored procedures úteis
DELIMITER //

-- Procedure para limpar sessões expiradas
CREATE PROCEDURE CleanExpiredSessions()
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < NOW() OR is_active = FALSE;
END //

-- Procedure para registrar login
CREATE PROCEDURE LogLogin(
    IN p_username VARCHAR(50),
    IN p_ip_address VARCHAR(45),
    IN p_user_agent TEXT,
    IN p_success BOOLEAN,
    IN p_failure_reason VARCHAR(255)
)
BEGIN
    INSERT INTO login_logs (username, ip_address, user_agent, success, failure_reason)
    VALUES (p_username, p_ip_address, p_user_agent, p_success, p_failure_reason);
    
    IF p_success THEN
        UPDATE users 
        SET last_login = NOW(), login_count = login_count + 1
        WHERE username = p_username;
    END IF;
END //

-- Procedure para atualizar estatísticas do jogo
CREATE PROCEDURE UpdateGameStats(
    IN p_user_id INT,
    IN p_game_key VARCHAR(50),
    IN p_games_played INT,
    IN p_games_won INT,
    IN p_best_score INT,
    IN p_total_time INT
)
BEGIN
    DECLARE v_game_id INT;
    
    SELECT id INTO v_game_id FROM games WHERE game_key = p_game_key;
    
    INSERT INTO game_stats (user_id, game_id, games_played, games_won, best_score, total_time, last_played)
    VALUES (p_user_id, v_game_id, p_games_played, p_games_won, p_best_score, p_total_time, NOW())
    ON DUPLICATE KEY UPDATE
        games_played = games_played + p_games_played,
        games_won = games_won + p_games_won,
        best_score = GREATEST(best_score, p_best_score),
        total_time = total_time + p_total_time,
        last_played = NOW(),
        updated_at = NOW();
END //

DELIMITER ;

-- Criar eventos para limpeza automática
SET GLOBAL event_scheduler = ON;

CREATE EVENT IF NOT EXISTS clean_expired_sessions
ON SCHEDULE EVERY 1 HOUR
DO
  CALL CleanExpiredSessions();

CREATE EVENT IF NOT EXISTS clean_old_logs
ON SCHEDULE EVERY 1 DAY
DO
  DELETE FROM login_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
  DELETE FROM activity_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Criar índices adicionais para performance
CREATE INDEX idx_login_logs_date ON login_logs(created_at);
CREATE INDEX idx_activity_logs_date ON activity_logs(created_at);
CREATE INDEX idx_game_stats_last_played ON game_stats(last_played);

-- Mostrar informações do banco criado
SELECT 'Banco de dados Digital Detective Games criado com sucesso!' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_games FROM games;
SELECT COUNT(*) as total_settings FROM system_settings;
