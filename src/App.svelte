<script>
    import ConnectionState from './states/ConnectionState.svelte';
    
    export let currentStateInfo = {
        state: ConnectionState,
        props: {}
    };
</script>

<!-- 
    svelte:component claims that phantom props are getting passed into the next
    component for some reason. Potentially a debug build error...
 -->
<svelte:component 
    this={currentStateInfo.state} 
    {...currentStateInfo.props}  
    on:change={({ detail: nextStateInfo }) => currentStateInfo = nextStateInfo}
/>