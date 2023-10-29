import { Soldier } from "../cards";
import { Coord } from "./Coord";
import { CoordSet } from "./CoordSet";

export const Placeset = {
    combine(...placesets) {
        const result = new CoordSet();

        for (const coordArr of placesets) {
            result.addMultiple(coordArr);
        }

        return result.get();
    },

    homePlaceset(game) {
        const homeCoords = game.getHomeCoords(game.currentPlayer.id);
        return this.squarePlaceset(game, homeCoords, 1);
    },

    ownedPlaceset(game) {
        const result = new CoordSet();

        for (const tile of game._board.tiles) {
            if (
                tile.hasCard &&
                tile.card instanceof Soldier &&
                tile.card.owner === game.currentPlayerIndex
            ) {
                result.addMultiple(this.squarePlaceset(game, tile.coords, 1));
            }
        }

        return result.get();
    },

    squarePlaceset(game, center, halfLength) {
        const result = [];

        for (const coords of Coord.square(
            center,
            halfLength,
            game._board.size,
        )) {
            if (!game._board.getTile(coords).hasCard) {
                result.push(coords);
            }
        }

        return result;
    },
};
