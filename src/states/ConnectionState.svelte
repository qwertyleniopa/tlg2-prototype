<script>
    import { createEventDispatcher, onDestroy, onMount } from "svelte";
    const dispatch = createEventDispatcher();

    import { PeerError } from "peerjs";

    import { store } from "../store";
    import GameState from "./GameState.svelte";
    import ConnectionView from "../views/ConnectionView.svelte";

    let selfId = null;

    onMount(() => {
        if ($store.gameServer.selfId) {
            selfId = $store.gameServer.selfId;
        } else {
            $store.gameServer.once("has_id", handleHasId);
        }

        $store.gameServer.on("game_start", handleGameStart);
    });

    onDestroy(() => {
        $store.gameServer.off("game_start", handleGameStart);
    });

    function handleHasId(id) {
        selfId = id;

        if (location.pathname === "/connect") {
            const params = new URLSearchParams(location.search);
            const peerId = params.get("id");

            // TODO: Switch url to one w/o pathname if id is invalid
            if (peerId) {
                // TODO: Uneeded layering lol
                handleConnect({ detail: peerId });
            }
        }
    }

    async function handleConnect({ detail: peerId }) {
        try {
            await $store.gameServer.start(peerId);
        } catch (e) {
            if (e instanceof PeerError) {
                alert(
                    "Connection failed! Please check if opponent ID is valid.",
                );
                return;
            }

            throw e;
        }
    }

    function handleGameStart(playerGameData) {
        dispatch("change", { state: GameState, props: { playerGameData } });
    }
</script>

<ConnectionView {selfId} on:connect={handleConnect} />
