import shuffleArray from "shuffle-array";

export class Deck {
    constructor(cards = []) {
        this._cards = cards;
    }

    get count() {
        return this._cards.length;
    }

    add(cardType) {
        this._cards.push(cardType);
    }

    draw() {
        return this._cards.pop();
    }

    shuffle() {
        shuffleArray(this._cards);
    }
}
