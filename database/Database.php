<?php
/**
 * Classe de Conexão com Banco de Dados - DigitalGames
 * Gerencia conexões MySQL e operações do banco
 */

class Database {
    private static $instance = null;
    private $connection;
    private $host;
    private $username;
    private $password;
    private $database;
    
    // Configurações padrão para XAMPP
    private $defaultConfig = [
        'host' => 'localhost',
        'username' => 'root',
        'password' => '',
        'database' => 'digital_games',
        'charset' => 'utf8mb4'
    ];
    
    private function __construct($config = []) {
        $config = array_merge($this->defaultConfig, $config);
        
        $this->host = $config['host'];
        $this->username = $config['username'];
        $this->password = $config['password'];
        $this->database = $config['database'];
        
        $this->connect();
    }
    
    public static function getInstance($config = []) {
        if (self::$instance === null) {
            self::$instance = new self($config);
        }
        return self::$instance;
    }
    
    private function connect() {
        try {
            $dsn = "mysql:host={$this->host};dbname={$this->database};charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
            ];
            
            $this->connection = new PDO($dsn, $this->username, $this->password, $options);
            
        } catch (PDOException $e) {
            error_log("Erro de conexão com banco de dados: " . $e->getMessage());
            throw new Exception("Erro de conexão com banco de dados");
        }
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    // Métodos para operações CRUD
    
    /**
     * Executa uma query SELECT
     */
    public function select($query, $params = []) {
        try {
            $stmt = $this->connection->prepare($query);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Erro na query SELECT: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Executa uma query SELECT e retorna apenas uma linha
     */
    public function selectOne($query, $params = []) {
        try {
            $stmt = $this->connection->prepare($query);
            $stmt->execute($params);
            return $stmt->fetch();
        } catch (PDOException $e) {
            error_log("Erro na query SELECT ONE: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Executa uma query INSERT
     */
    public function insert($query, $params = []) {
        try {
            $stmt = $this->connection->prepare($query);
            $stmt->execute($params);
            return $this->connection->lastInsertId();
        } catch (PDOException $e) {
            error_log("Erro na query INSERT: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Executa uma query UPDATE
     */
    public function update($query, $params = []) {
        try {
            $stmt = $this->connection->prepare($query);
            $stmt->execute($params);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            error_log("Erro na query UPDATE: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Executa uma query DELETE
     */
    public function delete($query, $params = []) {
        try {
            $stmt = $this->connection->prepare($query);
            $stmt->execute($params);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            error_log("Erro na query DELETE: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Executa uma stored procedure
     */
    public function callProcedure($procedureName, $params = []) {
        try {
            $placeholders = str_repeat('?,', count($params) - 1) . '?';
            $query = "CALL {$procedureName}({$placeholders})";
            $stmt = $this->connection->prepare($query);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Erro na stored procedure: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Inicia uma transação
     */
    public function beginTransaction() {
        return $this->connection->beginTransaction();
    }
    
    /**
     * Confirma uma transação
     */
    public function commit() {
        return $this->connection->commit();
    }
    
    /**
     * Desfaz uma transação
     */
    public function rollback() {
        return $this->connection->rollback();
    }
    
    /**
     * Verifica se está em uma transação
     */
    public function inTransaction() {
        return $this->connection->inTransaction();
    }
    
    /**
     * Testa a conexão com o banco
     */
    public function testConnection() {
        try {
            $result = $this->selectOne("SELECT 1 as test");
            return $result && $result['test'] == 1;
        } catch (Exception $e) {
            return false;
        }
    }
    
    /**
     * Obtém informações do banco
     */
    public function getDatabaseInfo() {
        try {
            $info = [];
            $info['version'] = $this->selectOne("SELECT VERSION() as version")['version'];
            $info['database'] = $this->selectOne("SELECT DATABASE() as database")['database'];
            $info['charset'] = $this->selectOne("SELECT @@character_set_database as charset")['charset'];
            return $info;
        } catch (Exception $e) {
            return false;
        }
    }
    
    /**
     * Fecha a conexão
     */
    public function close() {
        $this->connection = null;
        self::$instance = null;
    }
    
    // Métodos específicos para o sistema
    
    /**
     * Autentica um usuário
     */
    public function authenticateUser($username, $password) {
        $query = "SELECT id, username, password, name, role, is_active, last_login, login_count 
                  FROM users 
                  WHERE username = ? AND is_active = TRUE";
        
        $user = $this->selectOne($query, [$username]);
        
        if ($user && md5($password) === $user['password']) {
            return $user;
        }
        
        return false;
    }
    
    /**
     * Cria uma nova sessão
     */
    public function createSession($userId, $sessionId, $ipAddress, $userAgent, $expiresAt) {
        $query = "INSERT INTO user_sessions (user_id, session_id, ip_address, user_agent, expires_at) 
                  VALUES (?, ?, ?, ?, ?)";
        
        return $this->insert($query, [$userId, $sessionId, $ipAddress, $userAgent, $expiresAt]);
    }
    
    /**
     * Valida uma sessão
     */
    public function validateSession($sessionId) {
        $query = "SELECT s.*, u.username, u.name, u.role 
                  FROM user_sessions s 
                  JOIN users u ON s.user_id = u.id 
                  WHERE s.session_id = ? AND s.expires_at > NOW() AND s.is_active = TRUE";
        
        return $this->selectOne($query, [$sessionId]);
    }
    
    /**
     * Remove uma sessão
     */
    public function removeSession($sessionId) {
        $query = "UPDATE user_sessions SET is_active = FALSE WHERE session_id = ?";
        return $this->update($query, [$sessionId]);
    }
    
    /**
     * Obtém estatísticas de um jogo para um usuário
     */
    public function getGameStats($userId, $gameKey) {
        $query = "SELECT gs.*, g.name as game_name 
                  FROM game_stats gs 
                  JOIN games g ON gs.game_id = g.id 
                  WHERE gs.user_id = ? AND g.game_key = ?";
        
        return $this->selectOne($query, [$userId, $gameKey]);
    }
    
    /**
     * Atualiza estatísticas de um jogo
     */
    public function updateGameStats($userId, $gameKey, $stats) {
        return $this->callProcedure('UpdateGameStats', [
            $userId,
            $gameKey,
            $stats['games_played'] ?? 0,
            $stats['games_won'] ?? 0,
            $stats['best_score'] ?? 0,
            $stats['total_time'] ?? 0
        ]);
    }
    
    /**
     * Registra uma tentativa de login
     */
    public function logLogin($username, $ipAddress, $userAgent, $success, $failureReason = null) {
        return $this->callProcedure('LogLogin', [
            $username,
            $ipAddress,
            $userAgent,
            $success ? 1 : 0,
            $failureReason
        ]);
    }
    
    /**
     * Registra uma atividade
     */
    public function logActivity($userId, $action, $details = null, $ipAddress = null, $userAgent = null) {
        $query = "INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent) 
                  VALUES (?, ?, ?, ?, ?)";
        
        return $this->insert($query, [$userId, $action, $details, $ipAddress, $userAgent]);
    }
    
    /**
     * Obtém configuração do sistema
     */
    public function getSetting($key, $default = null) {
        $query = "SELECT setting_value FROM system_settings WHERE setting_key = ?";
        $result = $this->selectOne($query, [$key]);
        
        return $result ? $result['setting_value'] : $default;
    }
    
    /**
     * Define configuração do sistema
     */
    public function setSetting($key, $value) {
        $query = "INSERT INTO system_settings (setting_key, setting_value) 
                  VALUES (?, ?) 
                  ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)";
        
        return $this->insert($query, [$key, $value]);
    }
    
    /**
     * Limpa sessões expiradas
     */
    public function cleanExpiredSessions() {
        return $this->callProcedure('CleanExpiredSessions');
    }
    
    /**
     * Obtém estatísticas gerais do sistema
     */
    public function getSystemStats() {
        $stats = [];
        
        // Total de usuários
        $result = $this->selectOne("SELECT COUNT(*) as count FROM users WHERE is_active = TRUE");
        $stats['total_users'] = $result['count'];
        
        // Total de jogos
        $result = $this->selectOne("SELECT COUNT(*) as count FROM games WHERE is_enabled = TRUE");
        $stats['total_games'] = $result['count'];
        
        // Total de sessões ativas
        $result = $this->selectOne("SELECT COUNT(*) as count FROM user_sessions WHERE expires_at > NOW() AND is_active = TRUE");
        $stats['active_sessions'] = $result['count'];
        
        // Total de jogos jogados hoje
        $result = $this->selectOne("SELECT SUM(games_played) as count FROM game_stats WHERE DATE(last_played) = CURDATE()");
        $stats['games_today'] = $result['count'] ?? 0;
        
        return $stats;
    }
}
?>
