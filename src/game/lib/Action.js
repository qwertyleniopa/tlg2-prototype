// TODO: At this rate it's probably better to have a uniform
// serialization/deserialization method for all objects/classes instead.
const actionTypes = [];

/**
 * @abstract
 */
export class Action {
    static color = "#000000";

    constructor(targetCoords) {
        this._targetCoords = targetCoords;
    }

    serialize() {
        return {
            type: toActionTypeId(this.type),
            data: JSON.stringify(this),
        };
    }

    static deserialize(rawAction) {
        const type = fromActionTypeId(rawAction.type);
        const action = new type();

        return Object.assign(action, JSON.parse(rawAction.data));
    }

    get type() {
        return this.constructor;
    }

    get targetCoords() {
        return this._targetCoords;
    }

    /**
     * @abstract
     */
    // eslint-disable-next-line no-unused-vars
    perform(game) {}
}

export function addActionType(actionType) {
    if (actionTypes.includes(actionType)) {
        throw new Error("Cannot add duplicate action type.");
    }

    actionTypes.push(actionType);
}

export function toActionTypeId(actionType) {
    const index = actionTypes.indexOf(actionType);

    if (index === -1) {
        throw new Error("Cannot get type ID of nonexistent action type.");
    }

    // Avoid id === 0 so that null checks will be easier.
    return index + 1;
}

export function fromActionTypeId(typeId) {
    if (!actionTypes[typeId - 1]) {
        throw new Error("Cannot resolve action type from invalid ID.");
    }

    return actionTypes[typeId - 1];
}
