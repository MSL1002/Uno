import Card from "./Card";

export default class Player {
  constructor(id, name, isAI = false) {
    this.id = id;
    this.name = name;
    this.isAI = isAI;
    this.hand = [];
  }

  draw(cards) {
    this.hand.push(...cards);
  }

  play(cardId) {
    const idx = this.hand.findIndex((c) => c.id === cardId);
    if (idx === -1) return null;
    const [card] = this.hand.splice(idx, 1);
    return card;
  }

  /** Simple AI: prefer action cards, then color matches, then value matches */
  chooseCard(topCard, activeColor) {
    const playable = this.hand.filter((c) => c.canPlayOn(topCard, activeColor));
    if (playable.length === 0) return null;

    // Prioritise: wild4 > draw2 > skip > reverse > numbered > wild
    const priority = (c) => {
      if (c.value === "wild4") return 6;
      if (c.value === "draw2") return 5;
      if (c.value === "skip") return 4;
      if (c.value === "reverse") return 3;
      if (!c.isWild) return 2;
      return 1;
    };

    playable.sort((a, b) => priority(b) - priority(a));
    return playable[0];
  }

  /** AI picks a color (most frequent in hand) */
  chooseWildColor() {
    const counts = { red: 0, green: 0, blue: 0, yellow: 0 };
    this.hand.forEach((c) => {
      if (!c.isWild) counts[c.color]++;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] || "red";
  }

  get hasUno() {
    return this.hand.length === 1;
  }
}