<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let selfId;
    let peerId;

    $: selfIdDisplay = selfId || '[loading...]';
    $: inputDisabled = !peerId || peerId.trim() === '';
</script>

<style>
    .connection_view {
        height: 100vh;

        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 1.75rem;
    }

    .section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
    }
</style>

<div class="connection_view">
    <div class="section">
        <h1>The Less Genius Game</h1>
        <small>(prototype)</small>
    </div>

    <!-- 
        TODO: Writing to clipboard requires an HTTPS connection which I'm too
        lazy to work on right now. We settle with just displaying the join link. 
    -->
    <div class="section">
        <p>Your ID is: <em>{selfIdDisplay}</em>.</p>
        <p>Join link: <em>{location.href}connect?id={selfId}</em>.</p>
        <p>Connect with another player or wait to be connected to.</p>
    </div>

    <div class="section">
        <input type="text" placeholder="Opponent ID" bind:value={peerId}>
        <button 
            disabled={inputDisabled} 
            on:click={() => dispatch('connect', peerId)}
        >
            Play!
        </button>
    </div>
</div>