import { Tile } from "./Tile";

export class Board {
    constructor(size) {
        this._size = size;
        this._tiles = [];

        for (let row = 0; row < this.height; row++) {
            const rowArray = [];

            for (let col = 0; col < this.width; col++) {
                rowArray.push(new Tile([col, row]));
            }

            this._tiles.push(rowArray);
        }
    }

    get size() {
        return this._size;
    }

    get width() {
        return this._size[0];
    }

    get height() {
        return this._size[1];
    }

    serialize() {
        return {
            size: this._size,
            tiles: this._tiles.map((row) =>
                row.map((tile) => tile.serialize()),
            ),
        };
    }

    static deserialize(rawBoard) {
        const board = new Board(rawBoard.size);
        board._tiles = rawBoard.tiles.map((row) =>
            row.map((rawTile) => Tile.deserialize(rawTile)),
        );

        return board;
    }

    get tiles() {
        return this._tiles.flatMap((row) => row);
    }

    getTile([col, row]) {
        if (!this._tiles[row] || !this._tiles[row][col]) {
            throw new Error("Invalid board coordinates.");
        }

        return this._tiles[row][col];
    }

    moveCard(fromCoords, toCoords) {
        const fromTile = this.getTile(fromCoords);

        if (!fromTile.hasCard) {
            throw new Error("Cannot move a nonexistent card.");
        }

        const toTile = this.getTile(toCoords);

        if (toTile.hasCard) {
            throw new Error("Cannot move card over another card.");
        }

        toTile.card = fromTile.card;
        fromTile.card = null;
    }
}
