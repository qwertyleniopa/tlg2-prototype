import EventEmitter from "eventemitter3";

import { Board } from "./Board";
import { fromCardTypeId, toCardTypeId } from "./Card";
import { Deck } from "./Deck";

export class Game extends EventEmitter {
    constructor(config, drawPile, players, board) {
        super();

        this._config = config;

        this._board = board;

        this._drawPile = drawPile;
        this._discardPile = new Deck();

        // First player is at index 0, second at index 1, ...
        this._players = players;
        this._currentPlayerIndex = 0;
        this._movesLeft = this._config.movesPerTurn;
    }

    serializeFor(playerId) {
        const playerIndex = this._players.findIndex((p) => p.id === playerId);

        if (playerIndex === -1) {
            throw new Error("Cannot serialize for nonexistent player.");
        }

        const player = this._players[playerIndex];

        return {
            currentPlayerIndex: this._currentPlayerIndex,
            board: this._board.serialize(),
            drawPileCount: this._drawPile.count,
            discardPileCount: this._discardPile.count,
            heldCards: player.heldCards.map((cardType) =>
                toCardTypeId(cardType),
            ),
            movesLeft: this._movesLeft,
            playerIndex,
        };
    }

    static deserializeForPlayer(rawPlayerGameData) {
        return {
            ...rawPlayerGameData,
            board: Board.deserialize(rawPlayerGameData.board),
            heldCards: rawPlayerGameData.heldCards.map((cardTypeId) =>
                fromCardTypeId(cardTypeId),
            ),
        };
    }

    get currentPlayerIndex() {
        return this._currentPlayerIndex;
    }

    get currentPlayer() {
        return this._players[this._currentPlayerIndex];
    }

    get players() {
        return this._players;
    }

    getHomeCoords(playerId) {
        const playerIndex = this._players.findIndex((p) => p.id === playerId);

        if (playerIndex >= this.players.length) {
            throw new Error("Cannot get home coords of nonexistent player.");
        }

        return this._config.getHomeCoords(playerIndex);
    }

    getPlaceableCoords(heldCardIndex) {
        if (!this.currentPlayer.heldCards[heldCardIndex]) {
            throw new Error("Cannot retrieve nonexistent held card.");
        }

        const heldCardType = this.currentPlayer.heldCards[heldCardIndex];
        return heldCardType.getPlaceableCoords(this);
    }

    getPossibleActions(coords) {
        const tile = this._board.getTile(coords);

        if (
            !tile.hasCard ||
            (tile.card.owner && tile.card.owner !== this.currentPlayerIndex)
        ) {
            return [];
        }

        return tile.card.getPossibleActions(this, tile.coords);
    }

    checkWinCondition() {
        for (const tile of this._board.tiles) {
            // Opponent's cards are still on the board.
            if (
                tile.hasCard &&
                "owner" in tile.card &&
                tile.card.owner !== this.currentPlayerIndex
            ) {
                return;
            }
        }

        this.emit("end", this.currentPlayer.id);
    }

    drawNextCard() {
        const nextCardType = this._drawPile.draw();

        if (this._drawPile.count === 0) {
            this._drawPile = this._discardPile;
            this._drawPile.shuffle();

            this._discardPile = new Deck();
        }

        return nextCardType;
    }

    nextTurn() {
        this._currentPlayerIndex =
            (this._currentPlayerIndex + 1) % this._players.length;
        this._movesLeft = this._config.movesPerTurn;

        const drawCount =
            this._config.maxHeldCards - this.currentPlayer.heldCards.length;
        const newHeldCards = [...Array(drawCount)].map(() =>
            this.drawNextCard(),
        );
        this.currentPlayer.heldCards.push(...newHeldCards);
    }

    performAction(coords, actionIndex) {
        const possibleActions = this.getPossibleActions(coords);

        if (!possibleActions[actionIndex]) {
            return;
        }

        possibleActions[actionIndex].perform(this);

        this.updateMovesLeft();
    }

    placeCard(heldCardIndex, coords) {
        if (!this.currentPlayer.heldCards[heldCardIndex]) {
            throw new Error("Cannot place nonexistent held card.");
        }

        if (this._movesLeft === 0) {
            return;
        }

        const heldCardType = this.currentPlayer.heldCards.splice(
            heldCardIndex,
            1,
        )[0];
        heldCardType.placeCard(this, coords);

        this.updateMovesLeft();
    }

    removePlacedCard(coords) {
        const tile = this._board.getTile(coords);

        if (!tile.hasCard) {
            throw new Error("Cannot remove nonexistent placed card.");
        }

        this._discardPile.add(tile.card.type);
        tile.card = null;

        this.checkWinCondition();
    }

    updateMovesLeft() {
        this._movesLeft -= 1;

        if (this._movesLeft === 0) {
            this.nextTurn();
        }
    }
}
