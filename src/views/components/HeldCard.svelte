<script>
    export let type;
    export let selected;

    $: spriteUrl = `url(${type.sprite})`;
</script>

<style>
    .held_card {
        height: 100%;
        aspect-ratio: 1;

        background-color: white;
        background-image: var(--sprite);
        background-size: 60%;
        background-repeat: no-repeat;
        background-position: center;
        border: 7px solid black;
    }

    .held_card.selected {
        background-color: #ffff99;
    }
</style>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div 
    class="held_card selectable" 
    class:selected 
    style="--sprite: {spriteUrl}"
    on:click
></div>