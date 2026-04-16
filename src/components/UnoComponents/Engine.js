import  Player  from "./Player.js";
import  Deck  from "./Deck.js";

export default class UnoEngine {
  constructor(playerName, opponentCount) {
    this.players = [
      new Player(0, playerName, false),
      ...["Nova", "Rex", "Sage"].slice(0, opponentCount).map(
        (name, i) => new Player(i + 1, name, true)
      ),
    ];
    this.drawPile = [];
    this.discardPile = [];
    this.currentIndex = 0;
    this.direction = 1; // 1 = clockwise, -1 = counter-clockwise
    this.activeColor = null; // overrides wild card color
    this.phase = "playing"; // 'playing' | 'choosingColor' | 'gameOver'
    this.winner = null;
    this.pendingDraw = 0; // stacked draw2/wild4 draws
    this.log = [];

    this._deal();
  }

  _deal() {
    this.drawPile = Deck.shuffle(Deck.build());
    this.players.forEach((p) => {
      p.hand = this.drawPile.splice(0, 7);
    });

    // First card — skip wilds as starting card
    let first;
    do {
      first = this.drawPile.shift();
    } while (first.isWild);

    this.discardPile = [first];
    this.activeColor = first.color;
    this._applyStartCard(first);
    this._addLog(`First card: ${this._cardLabel(first)}`);
  }

  _applyStartCard(card) {
    if (card.value === "skip") {
      this.currentIndex = this._nextIndex();
      this._addLog(`${this.players[0].name} is skipped on first turn!`);
    } else if (card.value === "reverse") {
      this.direction *= -1;
    } else if (card.value === "draw2") {
      this.pendingDraw += 2;
    }
  }

  get currentPlayer() {
    return this.players[this.currentIndex];
  }

  get topCard() {
    return this.discardPile[this.discardPile.length - 1];
  }

  _nextIndex(from = this.currentIndex) {
    return (from + this.direction + this.players.length) % this.players.length;
  }

  _advanceTurn() {
    this.currentIndex = this._nextIndex();
  }

  _addLog(msg) {
    this.log = [msg, ...this.log].slice(0, 30);
  }

  _cardLabel(card) {
    return `${card.color || ""} ${card.value.toUpperCase()}`;
  }

  /* Replenish draw pile from discards (if needed) */
  _ensureDraw(n) {
    if (this.drawPile.length < n && this.discardPile.length > 1) {
      const top = this.discardPile.pop();
      this.drawPile = Deck.shuffle(this.discardPile);
      this.discardPile = [top];
    }
  }

  drawCards(player, n = 1) {
    this._ensureDraw(n);
    const drawn = this.drawPile.splice(0, Math.min(n, this.drawPile.length));
    player.draw(drawn);
    return drawn;
  }

  /* Human plays a card*/
  playCard(cardId) {
    if (this.phase !== "playing") return { ok: false, error: "Not your turn" };
    const player = this.currentPlayer;
    if (player.isAI) return { ok: false, error: "Not your turn" };

    const card = player.hand.find((c) => c.id === cardId);
    if (!card) return { ok: false, error: "Card not in hand" };
    if (!card.canPlayOn(this.topCard, this.activeColor))
      return { ok: false, error: "Can't play that card" };

    // If there's a pending draw stack, can only play matching draw card
    if (this.pendingDraw > 0 && card.value !== "draw2" && card.value !== "wild4")
      return { ok: false, error: `Must play a Draw card or draw ${this.pendingDraw}!` };

    player.play(cardId);
    this.discardPile.push(card);
    this._addLog(`${player.name} played ${this._cardLabel(card)}`);

    if (card.isWild) {
      this.activeColor = null;
      this.phase = "choosingColor";
      return { ok: true, needsColor: true };
    }

    this.activeColor = card.color;
    this._applyCardEffect(card, player);
    this._checkWin(player);
    return { ok: true };
  }

  /** Human selects a color after wild */
  chooseColor(color) {
    const card = this.topCard;
    this.activeColor = color;
    this.phase = "playing";
    const player = this.currentPlayer;
    
    this._addLog(`${player.name} chose ${color}`);
    
    // Apply wild card effects (like wild4's +4 draw)
    if (card.value === "wild4") {
      this.pendingDraw += 4;
    }
    
    this._checkWin(player);
    this._advanceTurn();
  }

  drawAndPass() {
    if (this.phase !== "playing" || this.currentPlayer.isAI) return;
    const player = this.currentPlayer;

    if (this.pendingDraw > 0) {
      this.drawCards(player, this.pendingDraw);
      this._addLog(`${player.name} drew ${this.pendingDraw} cards`);
      this.pendingDraw = 0;
    } else {
      const [drawn] = this.drawCards(player, 1);
      this._addLog(`${player.name} drew a card`);
      // If drawn card is playable, they may play it (handled by UI)
    }
    this._advanceTurn();
  }

  _applyCardEffect(card, player) {
    switch (card.value) {
      case "skip":
        this._addLog(`${this.players[this._nextIndex()].name} is skipped!`);
        this._advanceTurn(); // skip next
        this._advanceTurn();
        break;
      case "reverse":
        this.direction *= -1;
        this._addLog("Direction reversed!");
        if (this.players.length === 2) {
          // In 2-player, reverse acts as skip
          this._advanceTurn();
        } else {
          this._advanceTurn();
        }
        break;
      case "draw2":
        this.pendingDraw += 2;
        this._advanceTurn();
        // Next AI player will handle the pending draw
        break;
      case "wild4":
        this.pendingDraw += 4;
        this._advanceTurn();
        break;
      default:
        this._advanceTurn();
    }
  }

  _checkWin(player) {
    if (player.hand.length === 0) {
      this.phase = "gameOver";
      this.winner = player;
      this._addLog(`${player.name} wins!`);
    }
  }

  /* Run all consecutive AI turns, returning a list of action descriptions */
  runAITurns() {
    const actions = [];
    let safetyLimit = 20;

    while (
      this.phase === "playing" &&
      this.currentPlayer.isAI &&
      safetyLimit-- > 0
    ) {
      const ai = this.currentPlayer;
      let card = ai.chooseCard(this.topCard, this.activeColor);

      if (this.pendingDraw > 0 && card?.value !== "draw2" && card?.value !== "wild4") {
        // AI must draw the stacked amount
        this.drawCards(ai, this.pendingDraw);
        actions.push(`${ai.name} drew ${this.pendingDraw} cards`);
        this._addLog(`${ai.name} drew ${this.pendingDraw} cards`);
        this.pendingDraw = 0;
        this._advanceTurn();
        continue;
      }

      if (!card) {
        // Draw one card
        const [drawn] = this.drawCards(ai, 1);
        actions.push(`${ai.name} drew a card`);
        this._addLog(`${ai.name} drew a card`);

        // Play it if possible
        if (drawn && drawn.canPlayOn(this.topCard, this.activeColor)) {
          ai.play(drawn.id);
          this.discardPile.push(drawn);
          actions.push(`${ai.name} played ${this._cardLabel(drawn)}`);
          this._addLog(`${ai.name} played ${this._cardLabel(drawn)}`);

          if (drawn.isWild) {
            this.activeColor = null; // Reset before choosing new color
            const chosen = ai.chooseWildColor();
            this.activeColor = chosen;
            actions.push(`${ai.name} chose ${chosen}`);
            this._addLog(`${ai.name} chose ${chosen}`);
          } else {
            this.activeColor = drawn.color;
          }

          this._applyCardEffect(drawn, ai);
          this._checkWin(ai);
        } else {
          this._advanceTurn();
        }
      } else {
        ai.play(card.id);
        this.discardPile.push(card);
        actions.push(`${ai.name} played ${this._cardLabel(card)}`);
        this._addLog(`${ai.name} played ${this._cardLabel(card)}`);

        if (card.isWild) {
          this.activeColor = null; // Reset before choosing new color
          const chosen = ai.chooseWildColor();
          this.activeColor = chosen;
          actions.push(`${ai.name} chose ${chosen}`);
          this._addLog(`${ai.name} chose ${chosen}`);
        } else {
          this.activeColor = card.color;
        }

        this._applyCardEffect(card, ai);
        this._checkWin(ai);
      }
    }

    return actions;
  }

  /* Take a snapshot (for React state) */
  snapshot() {
    return {
      players: this.players.map((p) => ({
        id: p.id,
        name: p.name,
        isAI: p.isAI,
        handSize: p.hand.length,
        hand: p.hand.map((c) => ({ ...c })),
        hasUno: p.hasUno,
      })),
      topCard: { ...this.topCard },
      activeColor: this.activeColor,
      currentIndex: this.currentIndex,
      direction: this.direction,
      phase: this.phase,
      winner: this.winner ? { id: this.winner.id, name: this.winner.name } : null,
      drawPileSize: this.drawPile.length,
      pendingDraw: this.pendingDraw,
      log: [...this.log],
    };
  }
}