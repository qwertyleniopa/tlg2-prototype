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

        const peerId = new URLSearchParams(location.search).get("id");

        if (peerId) {
            // TODO: Switch url to one w/o peerId if id is invalid
            // TODO: Uneeded layering lol
            handleConnect({ detail: peerId });
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
        } finally {
            // Reset url (without refreshing!) to prevent accidental connections.
            if (new URLSearchParams(location.search).get("id")) {
                history.replaceState(
                    {},
                    document.title,
                    `${location.origin}${location.pathname}`,
                );
            }
        }
    }

    function handleGameStart(playerGameData) {
        dispatch("change", { state: GameState, props: { playerGameData } });
    }
</script>

<ConnectionView {selfId} on:connect={handleConnect} />
