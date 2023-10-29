<script>
    import { createEventDispatcher, onDestroy, onMount } from 'svelte';
    const dispatch = createEventDispatcher();
    
    import ConnectionState from './ConnectionState.svelte';
    import { store } from '../store';
    import GameView from '../views/GameView.svelte';

    export let playerGameData;

    let placeableCoords = [];
    let possibleActions = [];
    let selectedHeldCardIndex = null;

    let view;

    onMount(() => {
        $store.gameServer.on('game_update', handleGameUpdate);
        $store.gameServer.once('game_end', handleGameEnd);
    });

    onDestroy(() => {
        $store.gameServer.off('game_update', handleGameUpdate);
    });

    function handleGameUpdate(nextPlayerGameData) {
        playerGameData = nextPlayerGameData;
    }

    async function handleGameEnd(status) {
        switch (status) {
            case 'win':
                await view.showBanner('You Win!', 3500);
                break;

            case 'lose':
                await view.showBanner('You Lose!', 3500);
                break;

            case 'disconnect':
                await view.showBanner('A disconnection occurred...', 3500);
                break;
        }

        dispatch('change', { state: ConnectionState });
    }

    function handleDeselect() {
        placeableCoords = [];
        possibleActions = [];   
        selectedHeldCardIndex = null;
    }

    async function handleHeldCardSelect({ detail: cardIndex }) {
        selectedHeldCardIndex = cardIndex;
        placeableCoords = await $store.gameServer.invoke('getPlaceableCoords', cardIndex);
    }

    async function handleHeldCardPlace({ detail: [cardIndex, coords] }) {
        await $store.gameServer.invoke('placeHeldCard', cardIndex, coords);
        handleDeselect();
    }

    async function handlePlacedCardSelect({ detail: coords }) {
        possibleActions = await $store.gameServer.invoke('getPossibleActions', coords);
    }

    async function handleActionSelect({ detail: [actionIndex, coords] }) {
        await $store.gameServer.invoke('performAction', coords, actionIndex);
        handleDeselect();
    }

    async function handleNextTurnBtnClick() {
        await $store.gameServer.invoke('nextTurn');
        handleDeselect();
    }
</script>

<GameView
    {playerGameData}
    {placeableCoords}
    {possibleActions}
    {selectedHeldCardIndex}

    bind:this={view}
    on:held_card_select={handleHeldCardSelect}
    on:held_card_place={handleHeldCardPlace}
    on:placed_card_select={handlePlacedCardSelect}
    on:action_select={handleActionSelect}
    on:deselect={handleDeselect}
    on:next_turn_btn_click={handleNextTurnBtnClick}
/>