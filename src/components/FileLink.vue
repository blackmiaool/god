<template>
    <div class="deep-frame clickable">        
        <div class="title">{{name}}</div>
        <a :href="data" target="_blank">Click to download</a>        
    </div>
</template>
<script>
    export default {
        name: "CodePreview",
        props: ["name", "data"],
    }

</script>
