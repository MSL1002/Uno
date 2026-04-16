import Card from "./Card.js";

export default class Deck {
  static build() {
    const colors = ["red", "green", "blue", "yellow"];
    const cards = [];

    colors.forEach((color) => {
      // One '0', two each of '1'-'9' and actions
      cards.push(new Card(color, "0"));
      ["1","2","3","4","5","6","7","8","9","skip","reverse","draw2"].forEach((v) => {
        cards.push(new Card(color, v));
        cards.push(new Card(color, v));
      });
    });

    // 4 wilds + 4 wild-draw-4
    for (let i = 0; i < 4; i++) {
      cards.push(new Card("wild", "wild"));
      cards.push(new Card("wild", "wild4"));
    }

    return cards;
  }

  static shuffle(cards) {
    const arr = [...cards];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}