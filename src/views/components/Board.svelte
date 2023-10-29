<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    import { Coord } from '../../game/util/Coord';
    import Tile from './Tile.svelte';
    
    export let board;
    export let placeableCoords;
    export let possibleActions;
    export let orientation;

    $: getOrderedTiles = function*() {
        if (orientation === 0) {
            for (let y = 0; y < board.height; y++) {
                for (let x = 0; x < board.width; x++) {
                    yield board.getTile([x, y]);
                }
            }
        } else {
            for (let y = board.height - 1; y >= 0; y--) {
                for (let x = board.width - 1; x >= 0; x--) {
                    yield board.getTile([x, y]);
                }
            }
        }
    };

    function getCheckered(coords) {
        const [x, y] = coords;

        if (y % 2 === 0) {
            return x % 2 === 0; 
        } else {
            return x % 2 === 1;
        }
    }

    $: getPlacablility = (coords) => {
        return placeableCoords.some((c) => Coord.equals(c, coords));
    };

    $: getAction = (coords) => {
        return possibleActions.find((a) => Coord.equals(a.targetCoords, coords));
    };
</script>

<style>
    .board {
        justify-self: center;
        
        width: max(300px, 75vmin);
        height: max(300px, 75vmin);

        display: grid;
        grid-template-columns: repeat(var(--width), 1fr);
        grid-template-rows: repeat(var(--height), 1fr);

        border: 7px solid black;
    }
</style>

<div class="board" style="--width: {board.width}; --height: {board.height}">
    {#each getOrderedTiles() as tile}
        <Tile
            {tile}
            checkered={getCheckered(tile.coords)}
            placeable={getPlacablility(tile.coords)}
            action={getAction(tile.coords)}
            on:click={() => dispatch('tile_click', tile)}
        />
    {/each}
</div>