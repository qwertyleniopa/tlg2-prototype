const cardTypes = [];

/**
 * @abstract
 */
export class Card {
    static hp = 1;
    static sprite = "";

    constructor(params = {}) {
        this.hp = params.hp || this.type.hp;
    }

    serialize() {
        return {
            type: toCardTypeId(this.type),
            data: JSON.stringify(this),
        };
    }

    static deserialize(rawCard) {
        const type = fromCardTypeId(rawCard.type);
        const card = new type();

        return Object.assign(card, JSON.parse(rawCard.data));
    }

    /**
     * @returns {object}
     */
    get type() {
        return this.constructor;
    }

    // eslint-disable-next-line no-unused-vars
    static getPlaceableCoords(game) {
        return [];
    }

    static placeCard(game, coords) {
        game._board.getTile(coords).card = new this();
    }

    // eslint-disable-next-line no-unused-vars
    getPossibleActions(game, currPos) {
        return [];
    }
}

export function addCardType(cardType) {
    if (cardTypes.includes(cardType)) {
        throw new Error("Cannot add duplicate card type.");
    }

    cardTypes.push(cardType);
}

export function toCardTypeId(cardType) {
    const index = cardTypes.indexOf(cardType);

    if (index === -1) {
        throw new Error("Cannot get type ID of nonexistent card type.");
    }

    // Avoid id === 0 so that null checks will be easier.
    return index + 1;
}

export function fromCardTypeId(typeId) {
    if (!cardTypes[typeId - 1]) {
        throw new Error("Cannot resolve card type from invalid ID.");
    }

    return cardTypes[typeId - 1];
}
