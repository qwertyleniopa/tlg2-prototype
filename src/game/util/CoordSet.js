export class CoordSet {
    constructor() {
        this._coordMap = new Map();
    }

    get() {
        return Array.from(this._coordMap.values());
    }

    add(coords) {
        this._coordMap.set(coords.toString(), coords);
    }

    addMultiple(coordArr) {
        for (const coords of coordArr) {
            this.add(coords);
        }
    }
}
