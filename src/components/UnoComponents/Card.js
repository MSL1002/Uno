export default class Card {
  constructor(color, value) {
    this.id = `${color}-${value}-${Math.random().toString(36).slice(2, 7)}`;
    this.color = color; // 'red' | 'green' | 'blue' | 'yellow' | 'wild'
    this.value = value; // '0'-'9' | 'skip' | 'reverse' | 'draw2' | 'wild' | 'wild4'
  }

  get isWild() {
    return this.color === "wild";
  }

  get isAction() {
    return ["skip", "reverse", "draw2", "wild", "wild4"].includes(this.value);
  }

  get points() {
    if (["wild", "wild4"].includes(this.value)) return 50;
    if (["skip", "reverse", "draw2"].includes(this.value)) return 20;
    return parseInt(this.value, 10);
  }
  
  canPlayOn(topCard, activeColor) {
    const effectiveColor = activeColor || topCard.color;
    if (this.isWild) return true;
    if (this.color === effectiveColor) return true;
    if (this.value === topCard.value) return true;
    return false;
  }

  clone() {
    const c = new Card(this.color, this.value);
    c.id = this.id;
    return c;
  }
}
