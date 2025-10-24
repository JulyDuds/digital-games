# 🎮 Digital Detective Games - Sistema Organizado

Sistema de jogos retro no estilo Windows 98 com autenticação PHP e banco de dados MySQL, organizado em estrutura de pastas profissional.

## 📁 Estrutura do Projeto

```
digital-games/
├── 📁 admin/                    # Ferramentas de administração
│   ├── 403.php                 # Página de erro 403
│   ├── 404.php                 # Página de erro 404
│   ├── 500.php                 # Página de erro 500
│   ├── diagnostico.php         # Diagnóstico do sistema
│   ├── install_database.php    # Instalador do banco
│   ├── install.php             # Instalador básico
│   └── test_database.php       # Teste do banco
│
├── 📁 api/                     # APIs do sistema
│   └── save_stats.php          # API para salvar estatísticas
│
├── 📁 assets/                  # Recursos estáticos
│   ├── 📁 css/                 # Estilos CSS
│   │   └── style.css           # Estilo principal Windows 98
│   ├── 📁 img/                 # Imagens e ícones
│   │   ├── DigitalDetective.svg
│   │   ├── favicon.svg
│   │   └── [ícones dos jogos]
│   └── 📁 js/                  # Scripts JavaScript
│       ├── config.js           # Configurações globais
│       ├── footer.js           # Scripts do rodapé
│       ├── windows.js           # Sistema de janelas
│       └── [scripts dos jogos]
│
├── 📁 database/                # Arquivos de banco de dados
│   ├── Database.php            # Classe de conexão
│   ├── schema.sql              # Schema original
│   └── schema_fixed.sql        # Schema corrigido
│
├── 📁 games/                   # Jogos e páginas HTML
│   ├── about.html              # Página sobre
│   ├── demo.html               # Página de demonstração
│   ├── jogodaforca.html        # Jogo da Forca
│   ├── memory.html             # Memory Game
│   ├── minesweeper.html        # Campo Minado
│   ├── pong.html               # Pong
│   ├── snake.html              # Snake
│   ├── solitaire.html          # Paciência
│   ├── tictactoe.html          # Tic-Tac-Toe
│   ├── tictactoe.php           # Tic-Tac-Toe PHP
│   └── wordle.html             # Wordle
│
├── 📁 logs/                    # Logs do sistema
│   └── login_attempts.log      # Log de tentativas de login
│
├── .htaccess                   # Configuração Apache
├── config.php                  # Configurações principais
├── includes.php                # Componentes reutilizáveis
├── index.html                  # Redirecionamento
├── index.php                   # Página principal
├── login.html                  # Página de login Windows 98
├── login.php                   # Processamento de login
├── logout.php                  # Logout do sistema
└── README.md                   # Este arquivo
```

## 🚀 Instalação e Configuração

### **1. Pré-requisitos**
- XAMPP instalado e funcionando
- PHP 7.4+ 
- MySQL rodando
- Apache ativo

### **2. Instalação do Banco de Dados**
```
http://localhost/digital-games/admin/install_database.php
```

### **3. Teste do Sistema**
```
http://localhost/digital-games/admin/test_database.php
```

### **4. Diagnóstico (se necessário)**
```
http://localhost/digital-games/admin/diagnostico.php
```

### **5. Acesso ao Sistema**
```
http://localhost/digital-games/login.html
```

## 👤 Credenciais Padrão

| Usuário | Senha | Função |
|---------|-------|--------|
| admin | admin123 | Administrador |
| user | user123 | Usuário |
| guest | guest123 | Convidado |

## 🎯 Funcionalidades

### **Sistema de Autenticação**
- ✅ Login seguro com validação
- ✅ Controle de sessão com timeout
- ✅ Logs de atividade e tentativas
- ✅ Diferentes níveis de acesso

### **Jogos Disponíveis**
- ✅ **Tic-Tac-Toe**: Jogo da velha contra IA
- ✅ **Campo Minado**: Encontre todas as minas
- ✅ **Jogo da Forca**: Adivinhe a palavra
- ✅ **Pong**: Clássico jogo de tênis
- ✅ **Memory Game**: Encontre os pares
- ✅ **Snake**: Cobrinha clássica
- ✅ **Wordle**: Adivinhe a palavra
- ✅ **Paciência**: Jogo de cartas

### **Sistema de Estatísticas**
- ✅ Contagem de jogos e vitórias
- ✅ Melhor pontuação por jogo
- ✅ Tempo total de jogo
- ✅ Histórico de atividades

## 🔧 Configuração Avançada

### **Personalização de Usuários**
Edite `config.php`:
```php
$users = [
    'novo_usuario' => [
        'password' => 'senha123',
        'role' => 'user',
        'name' => 'Nome do Usuário'
    ]
];
```

### **Configuração de Jogos**
```php
$GAME_CONFIG = [
    'meu_jogo' => [
        'title' => 'Meu Jogo',
        'url' => 'games/meu_jogo.php',
        'icon' => 'fa-gamepad',
        'width' => 800,
        'height' => 600,
        'description' => 'Descrição do jogo',
        'enabled' => true
    ]
];
```

## 🛡️ Segurança

- ✅ Validação de entrada em formulários
- ✅ Sanitização de dados
- ✅ Controle de sessão com timeout
- ✅ Logs de atividade
- ✅ Proteção de arquivos sensíveis
- ✅ Configurações de segurança Apache

## 📊 Monitoramento

### **Logs Disponíveis**
- `logs/login_attempts.log` - Tentativas de login
- `logs/activity.log` - Atividades dos usuários
- Banco de dados - Estatísticas e histórico

### **Ferramentas de Admin**
- `admin/diagnostico.php` - Diagnóstico completo
- `admin/test_database.php` - Teste do banco
- `admin/install_database.php` - Instalador

## 🎨 Personalização

### **Cores do Sistema**
```php
$COLORS = [
    'primary' => '#242424',
    'secondary' => '#808080',
    'accent' => '#FD0100',
    'light' => '#CBDCC1',
    'dark' => '#1a1a1a'
];
```

### **Efeitos Sonoros**
```php
$AUDIO_CONFIG = [
    'enabled' => true,
    'default_volume' => 0.5,
    'sounds' => [
        'click' => ['frequency' => 600, 'duration' => 0.1, 'gain' => 0.15],
        'win' => ['frequency' => 800, 'duration' => 0.4, 'gain' => 0.25]
    ]
];
```

## 🐛 Solução de Problemas

### **Erro 500**
1. Execute: `admin/diagnostico.php`
2. Verifique logs do Apache
3. Confirme configurações do banco

### **Problemas de Banco**
1. Execute: `admin/install_database.php`
2. Teste: `admin/test_database.php`
3. Verifique se MySQL está rodando

### **Problemas de Permissão**
```bash
# Windows
icacls logs /grant Everyone:F
icacls database /grant Everyone:F

# Linux/Mac
chmod 755 logs/ database/ api/
```

## 📞 Suporte

1. **Diagnóstico**: `admin/diagnostico.php`
2. **Teste do banco**: `admin/test_database.php`
3. **Reinstalação**: `admin/install_database.php`
4. **Logs**: Verificar `logs/` e Apache error.log

## 🎉 Conclusão

Sistema completamente funcional e organizado com:
- ✅ Estrutura de pastas profissional
- ✅ Sistema de autenticação robusto
- ✅ Banco de dados MySQL integrado
- ✅ Interface Windows 98 autêntica
- ✅ Ferramentas de administração
- ✅ Sistema de monitoramento

**Divirta-se com os jogos retro!** 🕹️