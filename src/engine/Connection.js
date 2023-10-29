import EventEmitter from "eventemitter3";
import Peer from "peerjs";

/**
 * Assumes a two-way connection between two peers *only*.
 */
export class Connection extends EventEmitter {
    constructor() {
        super();

        this._self = new Peer();
        this._peer = null;
        this._messages = new EventEmitter();

        // @ts-ignore
        this._self.once("open", this._handleSelfOpen, this);
        // @ts-ignore
        this._self.on("connection", this._handleConnectionToSelf, this);
    }

    _handleSelfOpen() {
        this.emit("has_id", this.id);
    }

    _handleConnectionToSelf(conn) {
        this._peer = conn;

        // Handle data from connections made *to* self.
        conn.once("open", () => {
            conn.on("data", this._handleDataReceive, this);
        });
    }

    _handleDataReceive({ senderId, name, data }) {
        this._messages.emit(name, data, senderId);
    }

    get id() {
        return this._self.id;
    }

    get messages() {
        return this._messages;
    }

    async connect(peerId) {
        const conn = this._self.connect(peerId);

        return new Promise((resolve, reject) => {
            this._self.once("error", reject);

            conn.once("open", () => {
                this._peer = conn;

                // Handle data from connections made *from* self.
                // @ts-ignore
                this._peer.on("data", this._handleDataReceive, this);

                resolve(true);
            });
        });
    }

    close() {
        this.emit("close");
    }

    send(peerId, name, data) {
        // Allow sending to self to simplify GameServer implementation.
        if (peerId === this._self.id) {
            this._handleDataReceive({ senderId: peerId, name, data });
            return;
        }

        // TODO (kind of): Any other peer id is assumed to be sent to the single
        // peer connected to self. Accepting peerId also simplifies GameServer
        // implementation and makes this easier to extend to support more players.

        if (!this._peer) {
            throw new Error("Cannot send data to nonexistent peer.");
        }

        this._peer.send({ senderId: this.id, name, data });
    }
}
