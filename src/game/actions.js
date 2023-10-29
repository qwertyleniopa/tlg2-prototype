import { Action, addActionType } from "./lib/Action";

export class MoveAction extends Action {
    static color = "#00ffff";

    constructor(toCoords, fromCoords) {
        super(toCoords);

        this._fromCoords = fromCoords;
    }

    perform(game) {
        game._board.moveCard(this._fromCoords, this._targetCoords);
    }
}
addActionType(MoveAction);

export class AttackAction extends Action {
    static color = "#ff00ff";

    constructor(targetCoords, damage) {
        super(targetCoords);

        this._damage = damage;
    }

    perform(game) {
        const tile = game._board.getTile(this._targetCoords);

        if (!tile.hasCard) {
            throw new Error("Cannot attack nonexistent card.");
        }

        tile.card.hp -= this._damage;

        if (tile.card.hp <= 0) {
            game.removePlacedCard(tile.coords);
        }
    }
}
addActionType(AttackAction);

export class HealAction extends Action {
    static color = "#00ff00";

    constructor(targetCoords, healAmount) {
        super(targetCoords);

        this._healAmount = healAmount;
    }

    perform(game) {
        const tile = game._board.getTile(this._targetCoords);

        if (!tile.hasCard) {
            throw new Error("Cannot heal nonexistent card.");
        }

        tile.card.hp += this._healAmount;
    }
}
addActionType(HealAction);
