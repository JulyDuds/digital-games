/**
 * Solitaire (Paciência) - Digital Detective Games
 * Versão completa com tema vermelho e cinza
 */

class SolitaireGame {
    constructor() {
        // Naipes e valores
        this.suits = [
            { name: 'hearts', symbol: '♥', color: 'red' },
            { name: 'diamonds', symbol: '♦', color: 'red' },
            { name: 'clubs', symbol: '♣', color: 'black' },
            { name: 'spades', symbol: '♠', color: 'black' }
        ];

        this.values = [
            { name: 'A', rank: 1 },
            { name: '2', rank: 2 },
            { name: '3', rank: 3 },
            { name: '4', rank: 4 },
            { name: '5', rank: 5 },
            { name: '6', rank: 6 },
            { name: '7', rank: 7 },
            { name: '8', rank: 8 },
            { name: '9', rank: 9 },
            { name: '10', rank: 10 },
            { name: 'J', rank: 11 },
            { name: 'Q', rank: 12 },
            { name: 'K', rank: 13 }
        ];

        // Estado do jogo
        this.stock = [];
        this.waste = [];
        this.foundations = [[], [], [], []];
        this.tableau = [[], [], [], [], [], [], []];
        this.moves = 0;
        this.score = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.soundEnabled = true;
        this.gameActive = false;
        this.draggedCards = [];
        this.dragSource = null;
        this.selectedCard = null;
        this.autoCompleteInterval = null;

        // Sistema de histórico para desfazer
        this.moveHistory = [];
        this.maxHistorySize = 100;

        // Estatísticas
        this.stats = {
            wins: 0,
            games: 0
        };

        // Elementos DOM
        this.initializeDOMElements();
        this.init();
    }

    initializeDOMElements() {
        this.stockPile = document.getElementById('stock');
        this.wastePile = document.getElementById('waste');
        this.tableauArea = document.getElementById('tableau');
        this.movesDisplay = document.getElementById('moves');
        this.timerDisplay = document.getElementById('timer');
        this.scoreDisplay = document.getElementById('score');
        this.statusDisplay = document.getElementById('game-status');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.hintBtn = document.getElementById('hint-btn');
        this.soundBtn = document.getElementById('sound-btn');
        this.undoBtn = document.getElementById('undo-btn');
        this.autoCompleteBtn = document.getElementById('auto-complete-btn');
        this.winsDisplay = document.getElementById('wins');
        this.gamesDisplay = document.getElementById('games');
    }

    init() {
        // Carregar estatísticas
        this.loadStats();

        // Event listeners
        this.newGameBtn.addEventListener('click', () => this.newGame());
        this.hintBtn.addEventListener('click', () => this.showHint());
        this.soundBtn.addEventListener('click', () => this.toggleSound());
        this.undoBtn.addEventListener('click', () => this.undoMove());
        this.autoCompleteBtn.addEventListener('click', () => this.startAutoComplete());
        this.stockPile.addEventListener('click', () => this.drawFromStock());

        // Iniciar jogo
        this.newGame();
    }

    createDeck() {
        const deck = [];
        
        this.suits.forEach(suit => {
            this.values.forEach(value => {
                deck.push({
                    suit: suit.name,
                    suitSymbol: suit.symbol,
                    value: value.name,
                    rank: value.rank,
                    color: suit.color,
                    faceUp: false,
                    id: Math.random().toString(36).substr(2, 9)
                });
            });
        });

        // Embaralhar usando Fisher-Yates
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        return deck;
    }

    newGame() {
        // Parar auto-completar se estiver ativo
        this.stopAutoComplete();

        // Reset estado
        const deck = this.createDeck();
        this.stock = [];
        this.waste = [];
        this.foundations = [[], [], [], []];
        this.tableau = [[], [], [], [], [], [], []];
        this.moves = 0;
        this.score = 0;
        this.timer = 0;
        this.gameActive = true;
        this.draggedCards = [];
        this.dragSource = null;
        this.selectedCard = null;
        this.moveHistory = [];

        // Distribuir cartas para tableau (7 colunas)
        let deckIndex = 0;
        for (let col = 0; col < 7; col++) {
            this.tableau[col] = [];
            for (let row = 0; row <= col; row++) {
                const card = deck[deckIndex++];
                // Última carta de cada coluna virada para cima
                card.faceUp = (row === col);
                this.tableau[col].push(card);
            }
        }

        // Resto vai para stock
        this.stock = deck.slice(deckIndex);

        // Configurar DOM
        this.setupTableau();
        this.setupFoundations();

        // Salvar estado inicial
        this.saveGameState("Início do jogo");

        // Iniciar timer
        this.startTimer();

        this.render();
        this.updateDisplay();
        this.stats.games++;
        this.saveStats();
    }

    setupTableau() {
        this.tableauArea.innerHTML = '';
        for (let i = 0; i < 7; i++) {
            const pile = document.createElement('div');
            pile.className = 'card-pile tableau-pile';
            pile.dataset.column = i;
            pile.style.minHeight = '400px';
            pile.style.position = 'relative';
            
            // Eventos de drag and drop
            pile.addEventListener('dragover', (e) => this.handleDragOver(e));
            pile.addEventListener('drop', (e) => this.handleDrop(e, 'tableau', i));
            
            this.tableauArea.appendChild(pile);
        }
    }

    setupFoundations() {
        for (let i = 0; i < 4; i++) {
            const foundation = document.getElementById(`foundation-${i}`);
            foundation.innerHTML = '';
            
            foundation.addEventListener('dragover', (e) => this.handleDragOver(e));
            foundation.addEventListener('drop', (e) => this.handleDrop(e, 'foundation', i));
        }
    }

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            if (this.gameActive) {
                this.timer++;
                const minutes = Math.floor(this.timer / 60).toString().padStart(2, '0');
                const seconds = (this.timer % 60).toString().padStart(2, '0');
                this.timerDisplay.textContent = `${minutes}:${seconds}`;
            }
        }, 1000);
    }

    // SISTEMA DE HISTÓRICO - DESFAZER
    saveGameState(description) {
        if (this.moveHistory.length >= this.maxHistorySize) {
            this.moveHistory.shift();
        }

        const gameState = {
            stock: JSON.parse(JSON.stringify(this.stock)),
            waste: JSON.parse(JSON.stringify(this.waste)),
            foundations: JSON.parse(JSON.stringify(this.foundations)),
            tableau: JSON.parse(JSON.stringify(this.tableau)),
            moves: this.moves,
            score: this.score,
            description: description,
            timestamp: Date.now()
        };

        this.moveHistory.push(gameState);
        this.updateUndoButton();
    }

    undoMove() {
        if (this.moveHistory.length === 0 || !this.gameActive) {
            this.playSound('error');
            return;
        }

        // Remove estado atual
        const currentState = this.moveHistory.pop();
        
        if (this.moveHistory.length === 0) {
            this.statusDisplay.textContent = 'Não há movimentos para desfazer.';
            this.playSound('error');
            this.updateUndoButton();
            return;
        }

        // Restaura estado anterior
        const previousState = this.moveHistory[this.moveHistory.length - 1];
        this.restoreGameState(previousState);

        this.statusDisplay.textContent = `Movimento desfeito: ${currentState.description}`;
        this.playSound('undo');
        
        setTimeout(() => {
            if (this.gameActive) this.statusDisplay.textContent = 'Continue jogando!';
        }, 3000);
    }

    restoreGameState(state) {
        this.stock = state.stock;
        this.waste = state.waste;
        this.foundations = state.foundations;
        this.tableau = state.tableau;
        this.moves = state.moves;
        this.score = state.score;

        this.render();
        this.updateDisplay();
        this.updateUndoButton();
    }

    updateUndoButton() {
        if (this.moveHistory.length <= 1) {
            this.undoBtn.disabled = true;
            this.undoBtn.style.opacity = '0.6';
            this.undoBtn.title = 'Nenhum movimento para desfazer';
        } else {
            this.undoBtn.disabled = false;
            this.undoBtn.style.opacity = '1';
            this.undoBtn.title = `Desfazer (${this.moveHistory.length - 1} disponíveis)`;
        }
    }

    // MECÂNICAS PRINCIPAIS DO JOGO
    drawFromStock() {
        if (!this.gameActive) return;

        this.saveGameState("Virar carta do monte");

        if (this.stock.length > 0) {
            // Virar uma carta do stock para waste
            const card = this.stock.pop();
            card.faceUp = true;
            this.waste.push(card);
            this.moves++;
            this.score += 5;
            this.playSound('card');
        } else if (this.waste.length > 0) {
            // Reciclar waste para stock
            while (this.waste.length > 0) {
                const card = this.waste.pop();
                card.faceUp = false;
                this.stock.push(card);
            }
            this.moves++;
            this.playSound('card');
        }

        this.render();
        this.updateDisplay();
    }

    // DRAG AND DROP
    setupCardDragEvents(cardElement, card, sourceType, sourceIndex, cardIndex) {
        if (!card.faceUp) {
            cardElement.draggable = false;
            return;
        }

        cardElement.draggable = true;
        
        cardElement.addEventListener('dragstart', (e) => {
            this.handleDragStart(e, card, sourceType, sourceIndex, cardIndex);
        });

        cardElement.addEventListener('dragend', (e) => {
            this.handleDragEnd(e);
        });
    }

    handleDragStart(e, card, sourceType, sourceIndex, cardIndex) {
        this.draggedCards = this.getDraggableCards(sourceType, sourceIndex, cardIndex);
        this.dragSource = { type: sourceType, index: sourceIndex, cardIndex: cardIndex };
        
        e.dataTransfer.setData('text/plain', card.id);
        e.dataTransfer.effectAllowed = 'move';
        
        // Efeito visual durante o arrasto
        cardElement.style.opacity = '0.6';
        this.draggedCards.forEach(draggedCard => {
            const element = document.querySelector(`[data-card-id="${draggedCard.id}"]`);
            if (element) element.style.opacity = '0.6';
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    handleDragEnd(e) {
        // Restaurar opacidade normal
        document.querySelectorAll('.card').forEach(el => {
            el.style.opacity = '1';
        });
        this.draggedCards = [];
        this.dragSource = null;
    }

    handleDrop(e, targetType, targetIndex) {
        e.preventDefault();
        
        if (!this.draggedCards.length || !this.dragSource) return;

        const isValidMove = this.validateMove(targetType, targetIndex);
        
        if (isValidMove) {
            this.saveGameState(this.getMoveDescription(targetType, targetIndex));
            this.executeMove(targetType, targetIndex);
            this.checkWin();
        } else {
            this.statusDisplay.textContent = 'Movimento inválido!';
            this.playSound('error');
            setTimeout(() => {
                if (this.gameActive) this.statusDisplay.textContent = 'Continue jogando!';
            }, 2000);
        }

        this.render();
        this.updateDisplay();
    }

    getDraggableCards(sourceType, sourceIndex, cardIndex) {
        switch (sourceType) {
            case 'waste':
                return this.waste.length > 0 ? [this.waste[this.waste.length - 1]] : [];
            
            case 'foundation':
                const foundation = this.foundations[sourceIndex];
                return foundation.length > 0 ? [foundation[foundation.length - 1]] : [];
            
            case 'tableau':
                const column = this.tableau[sourceIndex];
                const draggableCards = [];
                
                // Pode arrastar a carta e todas as cartas viradas para cima abaixo dela
                for (let i = cardIndex; i < column.length; i++) {
                    if (column[i].faceUp) {
                        draggableCards.push(column[i]);
                    } else {
                        break;
                    }
                }
                return draggableCards;
            
            default:
                return [];
        }
    }

    validateMove(targetType, targetIndex) {
        if (!this.draggedCards.length) return false;

        const cardToMove = this.draggedCards[0];

        if (targetType === 'tableau') {
            return this.isValidTableauMove(cardToMove, this.tableau[targetIndex]);
        } else if (targetType === 'foundation') {
            // Só pode mover uma carta por vez para fundação
            if (this.draggedCards.length === 1) {
                return this.isValidFoundationMove(cardToMove, this.foundations[targetIndex]);
            }
        }

        return false;
    }

    isValidTableauMove(card, targetPile) {
        if (targetPile.length === 0) {
            // Só Reis podem ser colocados em pilhas vazias
            return card.rank === 13; // K
        } else {
            const topCard = targetPile[targetPile.length - 1];
            // Deve ser de cor diferente e rank imediatamente menor
            return (card.color !== topCard.color) && (card.rank === topCard.rank - 1);
        }
    }

    isValidFoundationMove(card, foundation) {
        if (foundation.length === 0) {
            // Só Áses podem iniciar fundações
            return card.rank === 1; // A
        } else {
            const topCard = foundation[foundation.length - 1];
            // Deve ser do mesmo naipe e rank imediatamente maior
            return (card.suit === topCard.suit) && (card.rank === topCard.rank + 1);
        }
    }

    getMoveDescription(targetType, targetIndex) {
        const card = this.draggedCards[0];
        const count = this.draggedCards.length;

        if (targetType === 'tableau') {
            return `Mover ${count > 1 ? 'sequência' : card.value + card.suitSymbol} para coluna ${targetIndex + 1}`;
        } else {
            return `Mover ${card.value}${card.suitSymbol} para fundação`;
        }
    }

    executeMove(targetType, targetIndex) {
        const { type: sourceType, index: sourceIndex, cardIndex } = this.dragSource;
        
        // Remover cartas da origem
        const removedCards = this.removeCardsFromSource(sourceType, sourceIndex, cardIndex);
        
        // Adicionar ao destino
        if (targetType === 'tableau') {
            this.tableau[targetIndex].push(...removedCards);
        } else if (targetType === 'foundation') {
            this.foundations[targetIndex].push(...removedCards);
        }

        // Virar última carta na origem se necessário
        this.flipTopCardIfNeeded(sourceType, sourceIndex);

        this.moves++;
        this.score += targetType === 'foundation' ? 15 : 10;
        this.playSound('move');
        
        this.statusDisplay.textContent = 'Movimento realizado!';
    }

    removeCardsFromSource(sourceType, sourceIndex, cardIndex) {
        switch (sourceType) {
            case 'waste':
                return this.waste.splice(-1);
            
            case 'foundation':
                return this.foundations[sourceIndex].splice(-1);
            
            case 'tableau':
                return this.tableau[sourceIndex].splice(cardIndex);
            
            default:
                return [];
        }
    }

    flipTopCardIfNeeded(sourceType, sourceIndex) {
        if (sourceType === 'tableau') {
            const column = this.tableau[sourceIndex];
            if (column.length > 0 && !column[column.length - 1].faceUp) {
                column[column.length - 1].faceUp = true;
                this.score += 5;
            }
        }
    }

    // FUNÇÃO DE AUTO-COMPLETAR
    canAutoComplete() {
        // Verificar se não há cartas bloqueadas (todas estão viradas para cima)
        for (let col = 0; col < 7; col++) {
            for (let card of this.tableau[col]) {
                if (!card.faceUp) {
                    return false;
                }
            }
        }

        // Verificar se stock e waste estão vazios
        if (this.stock.length > 0 || this.waste.length > 0) {
            return false;
        }

        // Verificar se ainda há cartas no tableau
        let hasCardsInTableau = false;
        for (let col = 0; col < 7; col++) {
            if (this.tableau[col].length > 0) {
                hasCardsInTableau = true;
                break;
            }
        }

        return hasCardsInTableau;
    }

    startAutoComplete() {
        if (!this.canAutoComplete()) {
            this.statusDisplay.textContent = 'Não é possível auto-completar o jogo. Ainda há cartas bloqueadas.';
            this.playSound('error');
            return;
        }

        if (!confirm('Deseja auto-completar o jogo? O jogo moverá automaticamente todas as cartas para as fundações.')) {
            return;
        }

        this.saveGameState("Início do auto-completar");
        this.gameActive = false;
        this.autoCompleteBtn.disabled = true;
        this.statusDisplay.textContent = 'Auto-completando...';

        this.autoCompleteMoves = 0;
        this.autoCompleteInterval = setInterval(() => {
            if (!this.performAutoCompleteMove()) {
                this.stopAutoComplete();
                this.checkWin();
            }
        }, 500); // Movimento a cada 500ms para melhor visualização
    }

    stopAutoComplete() {
        if (this.autoCompleteInterval) {
            clearInterval(this.autoCompleteInterval);
            this.autoCompleteInterval = null;
        }
        this.gameActive = true;
        this.autoCompleteBtn.disabled = false;
    }

    performAutoCompleteMove() {
        // Tentar mover cartas para as fundações
        let moved = false;

        // 1. Verificar cartas do tableau que podem ir para as fundações
        for (let col = 0; col < 7; col++) {
            const column = this.tableau[col];
            if (column.length === 0) continue;

            const topCard = column[column.length - 1];
            
            // Verificar se esta carta pode ir para alguma fundação
            for (let foundIndex = 0; foundIndex < 4; foundIndex++) {
                if (this.isValidFoundationMove(topCard, this.foundations[foundIndex])) {
                    // Mover a carta
                    const card = column.pop();
                    this.foundations[foundIndex].push(card);
                    
                    this.moves++;
                    this.autoCompleteMoves++;
                    this.score += 15;
                    
                    this.render();
                    this.updateDisplay();
                    this.playSound('move');
                    
                    this.statusDisplay.textContent = `Auto-completando... ${this.autoCompleteMoves} movimentos`;
                    
                    moved = true;
                    break;
                }
            }
            
            if (moved) break;
        }

        // Se não moveu nenhuma carta, verificar se o jogo está completo
        if (!moved) {
            const allComplete = this.foundations.every(foundation => 
                foundation.length === 13 && foundation[foundation.length - 1].rank === 13
            );
            
            if (allComplete) {
                this.statusDisplay.textContent = 'Jogo auto-completado com sucesso!';
            } else {
                this.statusDisplay.textContent = 'Não foi possível completar o jogo automaticamente.';
            }
        }

        return moved;
    }

    // RENDERIZAÇÃO
    render() {
        this.renderStock();
        this.renderWaste();
        this.renderFoundations();
        this.renderTableau();
        this.updateAutoCompleteButton();
    }

    updateAutoCompleteButton() {
        if (this.canAutoComplete()) {
            this.autoCompleteBtn.style.display = 'block';
            this.autoCompleteBtn.title = 'Auto-completar o jogo (todas as cartas estão visíveis)';
        } else {
            this.autoCompleteBtn.style.display = 'none';
        }
    }

    renderStock() {
        if (this.stock.length > 0) {
            this.stockPile.innerHTML = '<div style="padding: 30px; text-align: center; color: white; font-size: 2rem;">🂠</div>';
            this.stockPile.style.background = 'linear-gradient(135deg, #800000 0%, #b30000 100%)';
        } else {
            this.stockPile.innerHTML = '<div style="padding: 30px; text-align: center; color: #ff9999; font-size: 1.5rem;">↻</div>';
            this.stockPile.style.background = '#600000';
        }
    }

    renderWaste() {
        this.wastePile.innerHTML = '';
        if (this.waste.length > 0) {
            const topCard = this.waste[this.waste.length - 1];
            const cardEl = this.createCardElement(topCard, 'waste', 0, 0);
            this.wastePile.appendChild(cardEl);
            this.wastePile.classList.remove('empty');
            this.setupCardDragEvents(cardEl, topCard, 'waste', 0, 0);
        } else {
            this.wastePile.classList.add('empty');
        }
    }

    renderFoundations() {
        for (let i = 0; i < 4; i++) {
            const foundationElement = document.getElementById(`foundation-${i}`);
            foundationElement.innerHTML = '';
            
            if (this.foundations[i].length > 0) {
                const topCard = this.foundations[i][this.foundations[i].length - 1];
                const cardEl = this.createCardElement(topCard, 'foundation', i, 0);
                foundationElement.appendChild(cardEl);
                foundationElement.classList.remove('empty');
                this.setupCardDragEvents(cardEl, topCard, 'foundation', i, 0);
            } else {
                // Mostrar símbolo do naipe
                const symbolDiv = document.createElement('div');
                symbolDiv.className = 'suit-symbol';
                symbolDiv.style.padding = '30px';
                symbolDiv.style.textAlign = 'center';
                symbolDiv.style.fontSize = '2rem';
                symbolDiv.textContent = this.suits[i].symbol;
                foundationElement.appendChild(symbolDiv);
                foundationElement.classList.add('empty');
            }
        }
    }

    renderTableau() {
        for (let col = 0; col < 7; col++) {
            const pile = this.tableauArea.children[col];
            if (!pile) continue;
            
            pile.innerHTML = '';
            
            if (this.tableau[col].length === 0) {
                pile.classList.add('empty');
            } else {
                pile.classList.remove('empty');
                this.tableau[col].forEach((card, index) => {
                    const cardEl = this.createCardElement(card, 'tableau', col, index);
                    cardEl.style.position = 'absolute';
                    cardEl.style.top = `${index * 25}px`;
                    cardEl.style.left = '0';
                    pile.appendChild(cardEl);
                    
                    if (card.faceUp) {
                        this.setupCardDragEvents(cardEl, card, 'tableau', col, index);
                    }
                });
            }
        }
    }

    createCardElement(card, pileType, pileIndex, cardIndex) {
        const cardEl = document.createElement('div');
        cardEl.className = `card ${card.color}`;
        cardEl.dataset.cardId = card.id;
        
        if (!card.faceUp) {
            cardEl.classList.add('face-down');
            cardEl.innerHTML = '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem;">🂠</div>';
        } else {
            cardEl.innerHTML = `
                <div class="card-value">${card.value}${card.suitSymbol}</div>
                <div class="card-suit">${card.suitSymbol}</div>
                <div class="card-value" style="transform: rotate(180deg); align-self: flex-end;">${card.value}${card.suitSymbol}</div>
            `;
        }

        return cardEl;
    }

    // FUNCIONALIDADES EXTRAS
    showHint() {
        if (!this.gameActive) return;

        const hint = this.findPossibleMove();
        
        if (hint) {
            this.statusDisplay.textContent = `💡 Dica: ${hint}`;
        } else {
            this.statusDisplay.textContent = '💡 Nenhuma dica disponível. Tente virar mais cartas!';
        }
        
        this.playSound('hint');
        
        setTimeout(() => {
            if (this.gameActive) this.statusDisplay.textContent = 'Continue jogando!';
        }, 5000);
    }

    findPossibleMove() {
        // Verificar movimentos possíveis em ordem de prioridade

        // 1. Waste para fundação
        if (this.waste.length > 0) {
            const wasteCard = this.waste[this.waste.length - 1];
            for (let i = 0; i < 4; i++) {
                if (this.isValidFoundationMove(wasteCard, this.foundations[i])) {
                    return `Mova ${wasteCard.value}${wasteCard.suitSymbol} do descarte para a fundação`;
                }
            }
        }

        // 2. Waste para tableau
        if (this.waste.length > 0) {
            const wasteCard = this.waste[this.waste.length - 1];
            for (let i = 0; i < 7; i++) {
                if (this.isValidTableauMove(wasteCard, this.tableau[i])) {
                    return `Mova ${wasteCard.value}${wasteCard.suitSymbol} do descarte para a coluna ${i + 1}`;
                }
            }
        }

        // 3. Tableau para fundação
        for (let col = 0; col < 7; col++) {
            const pile = this.tableau[col];
            if (pile.length > 0) {
                const topCard = pile[pile.length - 1];
                if (!topCard.faceUp) continue;
                
                for (let i = 0; i < 4; i++) {
                    if (this.isValidFoundationMove(topCard, this.foundations[i])) {
                        return `Mova ${topCard.value}${topCard.suitSymbol} da coluna ${col + 1} para a fundação`;
                    }
                }
            }
        }

        // 4. Tableau para tableau
        for (let fromCol = 0; fromCol < 7; fromCol++) {
            const fromPile = this.tableau[fromCol];
            if (fromPile.length === 0) continue;
            
            // Encontrar primeira carta virada para cima
            for (let fromIndex = 0; fromIndex < fromPile.length; fromIndex++) {
                if (fromPile[fromIndex].faceUp) {
                    const cardToMove = fromPile[fromIndex];
                    const draggableCards = this.getDraggableCards('tableau', fromCol, fromIndex);
                    
                    for (let toCol = 0; toCol < 7; toCol++) {
                        if (fromCol === toCol) continue;
                        
                        if (this.isValidTableauMove(cardToMove, this.tableau[toCol])) {
                            return `Mova ${draggableCards.length > 1 ? 'a sequência' : cardToMove.value + cardToMove.suitSymbol} da coluna ${fromCol + 1} para a coluna ${toCol + 1}`;
                        }
                    }
                    break;
                }
            }
        }

        return null;
    }

    checkWin() {
        // Verificar se todas as fundações estão completas (13 cartas cada)
        const allComplete = this.foundations.every(foundation => 
            foundation.length === 13 && foundation[foundation.length - 1].rank === 13
        );
        
        if (allComplete) {
            this.gameActive = false;
            clearInterval(this.timerInterval);
            this.stats.wins++;
            this.score += 500; // Bônus por vencer
            this.statusDisplay.textContent = '🎉 Parabéns! Você venceu!';
            this.playSound('win');
            this.saveStats();
            this.updateDisplay();
        }
    }

    updateDisplay() {
        this.movesDisplay.textContent = this.moves;
        this.scoreDisplay.textContent = this.score;
        this.winsDisplay.textContent = this.stats.wins;
        this.gamesDisplay.textContent = this.stats.games;
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const icon = this.soundBtn.querySelector('i');
        
        if (this.soundEnabled) {
            icon.className = 'fas fa-volume-up';
            this.playSound('toggle');
        } else {
            icon.className = 'fas fa-volume-mute';
        }
    }

    playSound(type) {
        if (!this.soundEnabled) return;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        try {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            switch(type) {
                case 'card':
                case 'move':
                    oscillator.frequency.value = 400;
                    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.1);
                    break;
                case 'hint':
                    oscillator.frequency.value = 600;
                    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.3);
                    break;
                case 'undo':
                    oscillator.frequency.value = 200;
                    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.2);
                    break;
                case 'error':
                    oscillator.frequency.value = 150;
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.5);
                    break;
                case 'toggle':
                    oscillator.frequency.value = 500;
                    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.1);
                    break;
                case 'win':
                    // Fanfarra de vitória
                    const times = [0, 0.1, 0.2, 0.3, 0.4];
                    const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];
                    
                    times.forEach((time, index) => {
                        setTimeout(() => {
                            const osc = audioContext.createOscillator();
                            const gain = audioContext.createGain();
                            
                            osc.connect(gain);
                            gain.connect(audioContext.destination);
                            
                            osc.frequency.value = freqs[index];
                            gain.gain.setValueAtTime(0.3, audioContext.currentTime);
                            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                            
                            osc.start(audioContext.currentTime);
                            osc.stop(audioContext.currentTime + 0.3);
                        }, time * 1000);
                    });
                    break;
            }
        } catch (error) {
            console.log('Erro ao reproduzir som:', error);
        }
    }

    saveStats() {
        localStorage.setItem('solitaire-stats', JSON.stringify(this.stats));
    }

    loadStats() {
        const saved = localStorage.getItem('solitaire-stats');
        if (saved) {
            this.stats = JSON.parse(saved);
        }
    }
}

// Inicializar o jogo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new SolitaireGame();
});