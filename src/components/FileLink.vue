<template>
    <div class="deep-frame">        
        <a class="clickable" :href="data" target="_blank">{{name}}</a>
        <div class="title">Click to download</div>         
    </div>
</template>
<script>
    export default {
        name: "CodePreview",
        props: ["name", "data"],
        methods: {

        }
    }

</script>
