import shuffleArray from "shuffle-array";

import { Board } from "./Board";
import { Deck } from "./Deck";
import { Game } from "./Game";
import { Player } from "./Player";
import { Soldier } from "../cards";

export function buildGame(config, playerIds) {
    const drawPile = new Deck(
        config.initialDrawPile.flatMap(([cardType, count]) => {
            // Consider the initial soldiers placed on the board.
            const countLeft =
                cardType === Soldier ? count - playerIds.length : count;
            return [...Array(countLeft)].map(() => cardType);
        }),
    );
    drawPile.shuffle();

    const players = playerIds.map((id) => {
        if (drawPile.count < config.initialCardsCount) {
            throw new Error("Insufficient cards in draw pile.");
        }

        return new Player(
            id,
            [...Array(config.maxHeldCards)].map(() => drawPile.draw()),
        );
    });
    shuffleArray(players);

    const board = new Board(config.boardSize);
    board.getTile(config.getHomeCoords(0)).card = new Soldier({ owner: 0 });
    board.getTile(config.getHomeCoords(1)).card = new Soldier({ owner: 1 });

    return new Game(config, drawPile, players, board);
}
