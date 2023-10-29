import { Card } from "./Card";

export class Tile {
    constructor(coords) {
        this._coords = coords;
        this.card = null;
    }

    serialize() {
        return {
            coords: this._coords,
            card: this.card ? this.card.serialize() : null,
        };
    }

    static deserialize(rawTile) {
        const tile = new Tile(rawTile.coords);
        tile.card = rawTile.card ? Card.deserialize(rawTile.card) : null;

        return tile;
    }

    get coords() {
        return this._coords;
    }

    get hasCard() {
        return !!this.card;
    }
}
