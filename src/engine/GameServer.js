import EventEmitter from "eventemitter3";

import { Connection } from "./Connection";
import { defaultConfig } from "../game/config";
import { buildGame } from "../game/lib/buildGame";
import { Game } from "../game/lib/Game";
import { Action } from "../game/lib/Action";

// TODO: This whole connection mechanism is designed badly (I think).

const commands = {
    getPlaceableCoords: {
        invokeSerialize(game, heldCardIndex) {
            return game.getPlaceableCoords(heldCardIndex);
        },
    },

    getPossibleActions: {
        invokeSerialize(game, coords) {
            return game.getPossibleActions(coords).map((a) => a.serialize());
        },

        resolveDeserialize(invokeResult) {
            return invokeResult.map((rawAction) =>
                Action.deserialize(rawAction),
            );
        },
    },

    placeHeldCard: {
        invokeSerialize(game, heldCardIndex, coords) {
            return game.placeCard(heldCardIndex, coords);
        },
    },

    performAction: {
        invokeSerialize(game, coords, actionIndex) {
            return game.performAction(coords, actionIndex);
        },
    },

    nextTurn: {
        invokeSerialize(game) {
            return game.nextTurn();
        },
    },
};

// TODO: This class probably has to be split between a "server" and a "client"
// or "server interface".
export class GameServer extends EventEmitter {
    constructor() {
        super();

        this._connection = new Connection();

        this._hostId = null;
        this._instance = null;

        this._connection.once("has_id", (id) => this.emit("has_id", id));
        this._connection.on("close", this._handleConnectionClose, this);
        this._connection.messages.on("host_init", this._handleHostInit, this);
        this._connection.messages.on("game_start", this._handleGameStart, this);
        this._connection.messages.on(
            "game_invoke_req",
            this._handleGameInvokeReq,
            this,
        );
        this._connection.messages.on(
            "game_update",
            this._handleGameUpdate,
            this,
        );
        this._connection.messages.on("game_end", this._handleGameEnd, this);
    }

    // "Server" Methods //

    _broadcast(name, data) {
        if (!this._hostId) {
            throw new Error("Cannot broadcast to nonexistent game players.");
        }

        for (const player of this._instance.players) {
            this._connection.send(player.id, name, data);
        }
    }

    _broadcastGameData(eventName) {
        if (!this._hostId) {
            throw new Error("Cannot broadcast to nonexistent game players.");
        }

        for (const player of this._instance.players) {
            this._connection.send(
                player.id,
                eventName,
                this._instance.serializeFor(player.id),
            );
        }
    }

    _hostGame(instance) {
        this._hostId = this._connection.id;
        this._instance = instance;

        this._instance.once("end", this._handleGameInstanceEndEvent, this);
    }

    // TODO: This won't run on forced disconnect. Seems to need an actual
    // pinging mechanism to detect and act on those. Likewise for other
    // disconnect events in the game.
    _handleConnectionClose() {
        if (!this._instance) {
            return;
        }

        for (const player of this._instance.players) {
            this._connection.send(player.id, "game_end", "disconnect");
        }

        this._instance = null;
    }

    _handleGameInvokeReq({ name, args }, senderId) {
        // TODO: These are never supposed to happen; respond to it more concretely.
        if (!this._hostId || senderId != this._instance?.currentPlayer.id) {
            return;
        }

        try {
            if (!Object.hasOwn(commands, name)) {
                throw new Error("Cannot invoke a nonexistent game command.");
            }

            const returnValue = commands[name].invokeSerialize(
                this._instance,
                ...args,
            );
            this._connection.send(senderId, "game_invoke_res", {
                returnValue,
                error: null,
            });

            // TODO: This will always get called even when no changes occur in the game instance.
            this._broadcastGameData("game_update");
        } catch (e) {
            this._connection.send(senderId, "game_invoke_res", {
                returnValue: null,
                error: e.message,
            });
        }
    }

    _handleGameInstanceEndEvent(winnerId) {
        // Last update before closing.
        this._broadcastGameData("game_update");

        for (const player of this._instance.players) {
            if (player.id === winnerId) {
                this._connection.send(player.id, "game_end", "win");
                continue;
            }

            this._connection.send(player.id, "game_end", "lose");
        }

        this._instance = null;
    }

    // "Client" Methods //

    get selfId() {
        return this._connection.id;
    }

    _handleHostInit(hostId) {
        this._hostId = hostId;
    }

    _handleGameStart(rawPlayerGameData) {
        this.emit("game_start", Game.deserializeForPlayer(rawPlayerGameData));
    }

    _handleGameUpdate(rawPlayerGameData) {
        this.emit("game_update", Game.deserializeForPlayer(rawPlayerGameData));
    }

    _handleGameEnd(status) {
        this.emit("game_end", status);

        this._hostId = null;
        this._instance = null;

        this._connection.close();
    }

    async start(peerId) {
        await this._connection.connect(peerId);

        this._hostGame(buildGame(defaultConfig, [this.selfId, peerId]));

        this._broadcast("host_init", this._hostId);
        this._broadcastGameData("game_start");
    }

    async invoke(name, ...args) {
        if (!this._hostId) {
            throw new Error(
                "Cannot invoke a game method when a game has not started.",
            );
        }

        return new Promise((resolve, reject) => {
            this._connection.messages.once(
                "game_invoke_res",
                ({ returnValue, error }) => {
                    if (error) {
                        reject(
                            new Error(
                                `An error occured in invoking a Game method: ${error}.`,
                            ),
                        );
                        return;
                    }

                    // At this point, commands[name] is guaranteed to exist.

                    if (
                        typeof commands[name].resolveDeserialize === "function"
                    ) {
                        resolve(commands[name].resolveDeserialize(returnValue));
                    } else {
                        resolve(returnValue);
                    }
                },
            );

            this._connection.send(this._hostId, "game_invoke_req", {
                name,
                args,
            });
        });
    }
}
