<script>
    import tinycolor from 'tinycolor2';
    
    export let tile;
    export let checkered;
    export let placeable;
    export let action;

    $: spriteUrl = (tile.hasCard) ? `url(${tile.card.type.sprite})` : '';

    $: getActionStyle = () => {
        if (!action) {
            return '';
        }

        const color = action.type.color;
        const bgColor = tinycolor(color).brighten(80).toHexString();
    
        return `--action-color: ${color}; --action-color-bg: ${bgColor}`;
    }
</script>

<style>
    .tile {
        position: relative;

        background-color: #ffffff;
        background-image: var(--sprite);
        background-size: 57%;
        background-repeat: no-repeat;
        background-position: center;
    }

    .tile.checkered {
        background-color: #d0d0d0;
    }

    .tile.actionable {
        border: 4px solid var(--action-color);
        background-color: var(--action-color-bg);
    }

    .tile.placeable {
        background-color: #a5ffa2;
    }

    .stat {
        position: absolute;
        bottom: 0;
    }

    .stat.hp {
        left: 0;   
    }

    .stat.owner {
        right: 0;
    }
</style>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div 
    class="tile"
    class:selectable={tile.hasCard}
    class:checkered
    class:placeable 
    class:actionable={!!action}
    style="--sprite: {spriteUrl}; {getActionStyle()}" 
    on:click
>
    {#if tile.hasCard}
        <p class="hp stat">{tile.card.hp}</p>

        {#if 'owner' in tile.card}
            <p class="owner stat">{tile.card.owner}</p>
        {/if}
    {/if}
</div>