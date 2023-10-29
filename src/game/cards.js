import { AttackAction, HealAction, MoveAction } from "./actions";
import { Card, addCardType } from "./lib/Card";
import { Coord } from "./util/Coord";
import { Placeset } from "./util/Placeset";

// @ts-ignore
import soliderSprite from "../assets/soldier.png";
// @ts-ignore
import cannonSprite from "../assets/cannon.png";
// @ts-ignore
import wallSprite from "../assets/wall.png";
// @ts-ignore
import healerSprite from "../assets/healer.png";

// TODO: Consider composing movesets for action getters to reduce repetition.

export class Soldier extends Card {
    static hp = 1;
    static sprite = soliderSprite;

    constructor(params = {}) {
        super(params.hp);

        this._owner = params.owner;
    }

    get owner() {
        return this._owner;
    }

    static getPlaceableCoords(game) {
        return Placeset.homePlaceset(game);
    }

    static placeCard(game, coords) {
        game._board.getTile(coords).card = new this({
            owner: game.currentPlayerIndex,
        });
    }

    getPossibleActions(game, currPos) {
        const result = [];

        for (const coords of Coord.square(currPos, 1, game._board.size)) {
            if (!game._board.getTile(coords).hasCard) {
                result.push(new MoveAction(coords, currPos));
            }
        }

        return result;
    }
}
addCardType(Soldier);

export class Cannon extends Card {
    static hp = 1;
    static sprite = cannonSprite;

    static getPlaceableCoords(game) {
        return Placeset.combine(
            Placeset.homePlaceset(game),
            Placeset.ownedPlaceset(game),
        );
    }

    getPossibleActions(game, currPos) {
        const result = [];

        let hasOperatingSoldier = false;

        for (const coords of Coord.square(currPos, 1, game._board.size)) {
            const tile = game._board.getTile(coords);

            if (tile.hasCard) {
                if (tile.card?.owner === game.currentPlayerIndex) {
                    hasOperatingSoldier = true;
                }
            } else {
                result.push(new MoveAction(coords, currPos));
            }
        }

        if (!hasOperatingSoldier) {
            return [];
        }

        for (const coords of Coord.circle(currPos, 2, game._board.size)) {
            if (!game._board.getTile(coords).hasCard) {
                continue;
            }

            for (const lineOfSight of Coord.line(
                currPos,
                coords,
                game._board.size,
            )) {
                const tile = game._board.getTile(lineOfSight);

                if (
                    Coord.equals(lineOfSight, currPos) ||
                    !tile.hasCard ||
                    tile.card?.owner === game.currentPlayerIndex
                ) {
                    continue;
                }

                result.push(new AttackAction(lineOfSight, 1));

                if (tile.card instanceof Wall) {
                    break;
                }
            }
        }

        return result;
    }
}
addCardType(Cannon);

export class Wall extends Card {
    static hp = 2;
    static sprite = wallSprite;

    static getPlaceableCoords(game) {
        return Placeset.combine(
            Placeset.homePlaceset(game),
            Placeset.ownedPlaceset(game),
        );
    }
}
addCardType(Wall);

export class Healer extends Card {
    static hp = 1;
    static sprite = healerSprite;

    static getPlaceableCoords(game) {
        return Placeset.combine(
            Placeset.homePlaceset(game),
            Placeset.ownedPlaceset(game),
        );
    }

    getPossibleActions(game, currPos) {
        const result = [];

        let hasOperatingSoldier = false;

        for (const coords of Coord.square(currPos, 1, game._board.size)) {
            const tile = game._board.getTile(coords);

            if (Coord.equals(coords, currPos)) {
                continue;
            }

            if (tile.hasCard) {
                if (tile.card?.owner === game.currentPlayerIndex) {
                    hasOperatingSoldier = true;
                }

                result.push(new HealAction(coords, 1));
            } else {
                result.push(new MoveAction(coords, currPos));
            }
        }

        if (!hasOperatingSoldier) {
            return [];
        }

        return result;
    }
}
addCardType(Healer);
