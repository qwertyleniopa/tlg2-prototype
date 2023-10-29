import { Soldier, Cannon, Wall, Healer } from "./cards";

export const defaultConfig = {
    boardSize: [11, 11],
    initialDrawPile: [
        [Soldier, 15],
        [Cannon, 13],
        [Wall, 13],
        [Healer, 13],
    ],
    maxHeldCards: 5,
    movesPerTurn: 3,

    getHomeCoords(playerIndex) {
        const [width, height] = this.boardSize;

        return [
            [Math.floor(width / 2), height - 1],
            [Math.floor(width / 2), 0],
        ][playerIndex];
    },
};
