<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    import Board from "./components/Board.svelte";
    import HeldCard from "./components/HeldCard.svelte";
    import { Coord } from "../game/util/Coord";

    export let playerGameData;
    export let placeableCoords;
    export let possibleActions;
    export let selectedHeldCardIndex = null;

    let bannerMessage = "";
    let selectedCardCoords = null;

    $: hasCurrentTurn =
        playerGameData.currentPlayerIndex == playerGameData.playerIndex;

    export async function showBanner(message, msTime) {
        bannerMessage = message;

        return new Promise((resolve) => {
            setTimeout(() => {
                bannerMessage = "";
                resolve();
            }, msTime);
        });
    }

    function handleBodyClick({ target }) {
        if (
            target.classList.contains("selectable") ||
            (selectedHeldCardIndex === null && !selectedCardCoords)
        ) {
            return;
        }

        dispatch("deselect");
    }

    // TODO: Emitting 'deselect' event as a selection reset right before selecting
    // something causes a flicker due to a quick unassignment then reassignment of
    // values.

    function handleHeldCardClick(heldCardIndex) {
        dispatch("deselect");
        dispatch("held_card_select", heldCardIndex);
    }

    function handleTileClick({ detail: tile }) {
        dispatch("deselect");

        const actionIndex = possibleActions.findIndex((a) =>
            Coord.equals(a.targetCoords, tile.coords),
        );

        if (actionIndex !== -1) {
            dispatch("action_select", [actionIndex, selectedCardCoords]);
        } else if (tile.hasCard) {
            selectedCardCoords = tile.coords;
            dispatch("placed_card_select", tile.coords);
        } else if (selectedHeldCardIndex !== null) {
            if (!placeableCoords.some((c) => Coord.equals(c, tile.coords))) {
                return;
            }

            dispatch("held_card_place", [selectedHeldCardIndex, tile.coords]);
        }
    }

    function handleNextTurnBtnClick() {
        dispatch("next_turn_btn_click");
    }
</script>

<svelte:body on:click={handleBodyClick} />

<div class="game_view" class:disabled={bannerMessage}>
    {#if bannerMessage}
        <h2 class="banner">{bannerMessage}</h2>
    {/if}

    <div class="game_field">
        <Board
            board={playerGameData.board}
            {placeableCoords}
            {possibleActions}
            orientation={playerGameData.playerIndex}
            on:tile_click={handleTileClick}
        />

        <div class="game_stats">
            <div>
                <p>Moves Left: {playerGameData.movesLeft}</p>
            </div>

            <div>
                <p>Cards in Draw Pile: {playerGameData.drawPileCount}</p>
                <p>Cards in Discard Pile: {playerGameData.discardPileCount}</p>
            </div>
        </div>
    </div>

    <div class="player_bar" class:disabled={!hasCurrentTurn}>
        <div class="held_cards">
            {#each playerGameData.heldCards as cardType, i}
                <HeldCard
                    type={cardType}
                    selected={selectedHeldCardIndex === i}
                    on:click={() => handleHeldCardClick(i)}
                />
            {/each}
        </div>

        <button class="next_turn_btn" on:click={handleNextTurnBtnClick}>
            Next Turn
        </button>
    </div>
</div>

<style>
    /* NOTE/TODO: This thing has horrible responsive styling. */

    .game_view {
        height: 100vh;

        display: grid;
        grid-template-rows: 1fr auto;
        justify-content: center;
        align-items: center;
    }

    .game_view.disabled {
        pointer-events: none;
    }

    .banner {
        position: absolute;
        z-index: 100;

        width: 100%;
        padding: 2em;

        color: white;
        text-align: center;

        background-color: rgb(0 0 0 / 0.7);
    }

    .game_field {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: min(2vw, 50px);
    }

    .game_stats {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .player_bar {
        position: relative;

        width: min(1000px, 100vw);
        height: 140px;
        padding: 15px;

        display: grid;
        grid-template-columns: 1fr auto;
        gap: 15px;

        background-color: white;
        border: 7px solid black;
        border-bottom: unset;
    }

    .player_bar.disabled::before {
        content: "";

        position: absolute;
        inset: 0;

        background: rgb(0 0 0 / 0.35);
    }

    .held_cards {
        overflow: auto;

        display: flex;
        align-items: center;
        gap: 20px;
    }

    .next_turn_btn {
        align-self: center;

        aspect-ratio: 1;
        padding: 10px;

        background-color: #dbdbdb;
        border: 7px solid black;
    }
</style>
