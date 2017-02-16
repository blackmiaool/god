<template>
    <div class="deep-frame clickable" @click="open">
        <span class="glyphicon glyphicon-lamp icon"></span>
        <div class="title">{{data.title||'No Title'}}</div>
        <div class="lang">{{data.lang}}</div>
        <div class="tip">Click to Read</div>
    </div>
</template>
<script>
    import eventHub from "../eventHub";
    export default {
        name: "CodePreview",
        props: ["data"],
        methods: {
            open: function() {
                console.log(234234)
                eventHub.$emit("showCode", this.data);
            }
        }
    }

</script>
