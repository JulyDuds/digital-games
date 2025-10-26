# 🎮 DigitalGames

Sistema de jogos retro no estilo Windows 98 com autenticação PHP, MySQL e interface nostálgica. Desenvolvido para demonstrar habilidades em desenvolvimento web full-stack.

## 📁 Estrutura do Projeto

```
digital-games/
├── 📁 admin/                    # Ferramentas administrativas
│   ├── 403.php                 # Página de erro 403
│   ├── 404.php                 # Página de erro 404
│   ├── 500.php                 # Página de erro 500
│   ├── install_database.php   # Instalador do banco de dados
│   └── install.php             # Instalador básico
│
├── 📁 api/                     # APIs REST do sistema
│   ├── get_stats.php           # API para obter estatísticas
│   ├── save_stats.php          # API para salvar estatísticas
│   └── update_rule.php         # API para atualizar regras admin
│
├── 📁 assets/                  # Recursos estáticos
│   ├── 📁 css/
│   │   └── style.css          # Estilos principais Windows 98
│   ├── 📁 img/                # Ícones e imagens dos jogos
│   └── 📁 js/
│       ├── config.js          # Configurações globais JavaScript
│       ├── footer.js          # Scripts do rodapé
│       ├── windows.js          # Sistema de janelas
│       ├── tictactoe.js       # Jogo da Velha
│       ├── minesweeper.js     # Campo Minado
│       ├── jogodaforca.js     # Jogo da Forca
│       ├── snake.js           # Snake
│       ├── pong.js            # Pong
│       ├── memory.js          # Memory Game
│       ├── wordle.js          # Wordle
│       └── solitaire.js       # Paciência
│
├── 📁 database/                # Arquivos de banco de dados
│   ├── Database.php            # Classe de conexão PDO
│   ├── schema.sql             # Schema original
│   ├── schema_fixed.sql        # Schema corrigido
│   └── admin_features.sql      # Recursos administrativos
│
├── 📁 games/                   # Páginas dos jogos (HTML)
│   ├── tictactoe.html
│   ├── minesweeper.html
│   ├── jogodaforca.html
│   ├── pong.html
│   ├── snake.html
│   ├── memory.html
│   ├── wordle.html
│   └── solitaire.html
│
├── 📁 logs/                   # Logs do sistema
│   └── login_attempts.log
│
├── about.html                 # Página sobre o projeto
├── config.php                 # Configurações PHP principais
├── includes.php               # Componentes reutilizáveis
├── index.php                  # Página principal (dashboard)
├── index.html                 # Redirecionamento para index.php
├── login.html                 # Interface de login
├── login.php                  # Processamento de login
├── logout.php                 # Sistema de logout
├── profile.php                # Página de perfil do usuário
├── register.html              # Interface de registro
├── register.php               # Processamento de registro
├── admin_logs.php             # Visualização de logs (admin)
├── admin_users.php            # Gerenciamento de usuários (admin)
└── README.md                  # Este arquivo
```

## 🚀 Instalação e Configuração

### **1. Pré-requisitos**
- XAMPP instalado e funcionando
- PHP 7.4 ou superior
- MySQL/MariaDB rodando
- Apache ativo
- Navegador moderno (Chrome, Firefox, Edge)

### **2. Acesso ao Sistema**

Login:
```
http://localhost/digital-games/login.html
```

Página principal:
```
http://localhost/digital-games/index.php
```

## 👤 Credenciais Padrão

| Usuário | Senha | Função |
|---------|-------|--------|
| admin | admin123 | Administrador |
| user | user123 | Usuário comum |
| guest | guest123 | Convidado |

## 🎯 Funcionalidades

### **Sistema de Autenticação**
- ✅ Login seguro com validação PHP
- ✅ Sistema de registro de novos usuários
- ✅ Controle de sessão com timeout (1 hora)
- ✅ Logs de tentativas de login
- ✅ Diferentes níveis de acesso (admin, user, guest)
- ✅ Sistema de logout

### **Jogos Disponíveis** (8 jogos)

1. **Tic-Tac-Toe** (`tictactoe`)
   - Jogo da Velha contra IA inteligente
   - 3 níveis de dificuldade
   - Estatísticas de vitórias

2. **Campo Minado** (`minesweeper`)
   - Encontre todas as minas
   - Diferentes tamanhos de campo
   - Sistema de pontuação

3. **Jogo da Forca** (`jogodaforca`)
   - Adivinhe a palavra secreta
   - Banco de palavras com categorias
   - Sistema de dicas

4. **Pong** (`pong`)
   - Clássico jogo de tênis de mesa
   - Controle por teclado ou mouse
   - Sistema de pontuação

5. **Memory Game** (`memory`)
   - Encontre todos os pares
   - Múltiplos níveis de dificuldade
   - Sistema de tempo

6. **Snake** (`snake`)
   - Cobrinha clássica
   - Velocidade progressiva
   - Sistema de recordes

7. **Wordle** (`wordle`)
   - Adivinhe a palavra em 6 tentativas
   - Banco de palavras de 5 letras
   - Feedback visual

8. **Paciência** (`solitaire`)
   - Jogo de cartas clássico
   - Interface intuitiva
   - Estatísticas de vitórias

### **Sistema de Estatísticas**
- ✅ Contagem de jogos e vitórias por jogo
- ✅ Melhor pontuação por jogo
- ✅ Taxa de vitórias (win rate)
- ✅ Tempo total de jogo
- ✅ Histórico completo de atividades
- ✅ Página de perfil com estatísticas detalhadas
- ✅ Salvamento em banco de dados MySQL

### **Sistema de Janelas (Windows-like)**
- ✅ Janelas redimensionáveis e arrastáveis
- ✅ Efeitos visuais Windows 98
- ✅ Múltiplas janelas simultâneas
- ✅ Barra de tarefas funcional
- ✅ Minimizar/maximizar/fechar janelas

### **Recursos Administrativos**
- ✅ Painel de administração (`admin_users.php`)
- ✅ Visualização de logs (`admin_logs.php`)
- ✅ Gerenciamento de usuários
- ✅ Controle de permissões
- ✅ Atualização de regras via API (`update_rule.php`)

## 🔧 Configuração Avançada

### **Configuração de Banco de Dados**

Edite `config.php`:
```php
define('DB_HOST', 'localhost');
define('DB_USERNAME', 'root');
define('DB_PASSWORD', '');
define('DB_NAME', 'digital_games');
```

### **Configuração de Jogos**

Edite `config.php`:
```php
$GAME_CONFIG = [
    'meu_jogo' => [
        'title' => 'Meu Jogo',
        'url' => 'games/meu_jogo.html',
        'icon' => 'fa-gamepad',
        'width' => 800,
        'height' => 600,
        'description' => 'Descrição do jogo',
        'enabled' => true
    ]
];
```

### **Sistema de Autenticação API**

As APIs usam autenticação baseada em sessão:
- `api/save_stats.php` - Salva estatísticas de jogos
- `api/get_stats.php` - Obtém estatísticas de jogos
- `api/update_rule.php` - Atualiza regras (apenas admin)

## 🛡️ Segurança

- ✅ Validação de entrada em formulários
- ✅ Sanitização de dados com `sanitizeInput()`
- ✅ Prepared statements com PDO
- ✅ Controle de sessão com timeout
- ✅ Logs de tentativas de login
- ✅ Proteção de arquivos sensíveis
- ✅ Controle de acesso por níveis (admin/user/guest)
- ✅ Proteção CSRF implícita via sessões

## 📊 Estrutura do Banco de Dados

### **Tabelas Principais:**

1. **users** - Usuários do sistema
   - id, username, password, role, created_at

2. **games** - Lista de jogos disponíveis
   - id, game_key, name, description, is_enabled

3. **game_stats** - Estatísticas dos jogadores
   - id, user_id, game_id, games_played, games_won, best_score, total_time, last_played

4. **activity_logs** - Histórico de atividades
   - id, user_id, action_type, description, created_at

## 🎨 Personalização

### **Cores do Sistema**

Definidas em `assets/css/style.css`:
```css
--primary-color: #242424;
--secondary-color: #808080;
--accent-color: #FD0100;
--light-color: #CBDCC1;
--dark-color: #1a1a1a;
```

### **Configuração de Áudio**

Em `assets/js/config.js`:
```javascript
audio: {
    enabled: true,
    defaultVolume: 0.5,
    sounds: {
        move: { frequency: 400, duration: 0.1, gain: 0.1 },
        win: { frequency: 800, duration: 0.4, gain: 0.25 }
    }
}
```


## 📝 Notas de Desenvolvimento

### **Estrutura de Armazenamento**

- **LocalStorage**: Usado para estatísticas locais temporárias
- **MySQL**: Banco de dados principal para estatísticas persistentes
- **Sessões PHP**: Autenticação e controle de acesso

### **Fluxo de Dados**

1. Usuário joga → JavaScript atualiza estatísticas locais
2. JavaScript chama `DDGConfig.utils.saveGameStats()`
3. Função faz POST para `api/save_stats.php`
4. PHP valida sessão e salva no MySQL
5. Resposta retorna estatísticas atualizadas

### **Arquivos Principais**

- `config.php` - Configurações PHP e funções principais
- `assets/js/config.js` - Configurações JavaScript
- `database/Database.php` - Classe de conexão PDO
- `includes.php` - Funções auxiliares reutilizáveis

## 📞 Suporte e Desenvolvimento

### **Ferramentas de Debugging**

1. **Console do Navegador** (F12)
   - Ver erros JavaScript
   - Verificar logs de API
   - Debug de estatísticas

2. **Logs do Sistema**
   - `logs/login_attempts.log` - Tentativas de login
   - Apache error.log - Erros PHP e Apache

3. **Banco de Dados**
   - Visualizar dados: `phpMyAdmin` (http://localhost/phpmyadmin)
   - Testar conexão: `admin/test_database.php`

## 🎉 Conclusão

Sistema completamente funcional com:
- ✅ Interface Windows 98 nostálgica
- ✅ 8 jogos clássicos totalmente funcionais
- ✅ Sistema de estatísticas completo
- ✅ Autenticação e autorização robustos
- ✅ Banco de dados MySQL integrado
- ✅ APIs RESTful para comunicação
- ✅ Painel administrativo
- ✅ Sistema de logs e monitoramento
- ✅ Responsivo e acessível

**Desenvolvido com paixão pelos jogos retro! 🕹️**

---

## 📜 Licença

Este projeto foi desenvolvido como demonstração de habilidades em desenvolvimento web full-stack.

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se livre para:
- Reportar bugs
- Sugerir novos jogos
- Melhorar a documentação
- Propor novas funcionalidades

---

**Versão:** 1.0.0  
**Autor:** DigitalGames Team  
**Ano:** 2025
