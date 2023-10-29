export class Player {
    constructor(id, heldCards = []) {
        this._id = id;
        this._heldCards = heldCards;
    }

    get id() {
        return this._id;
    }

    get heldCards() {
        return this._heldCards;
    }
}
