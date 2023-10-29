import { writable } from "svelte/store";

import { GameServer } from "./engine/GameServer";

export const store = writable({
    gameServer: new GameServer(),
});
