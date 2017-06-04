<template>
    <div class="deep-frame clickable" @click="open">
        <span class="glyphicon glyphicon-lamp icon"></span>
        <div class="title">{{data.title||'No Title'}}</div>
        <div class="lang">{{data.lang}}</div>
        <span class="tip">Click to Read</span><span class="share" @click="share">Share</span>
    </div>
</template>
<script>
    import $ from 'jquery';
    import eventHub from "../eventHub";
    export default {
        name: "CodePreview",
        props: ["data"],
        methods: {
            share: function(e) {
                console.log('share', this.data.src);
                prompt("It's url", `http://blackmiaool.com/code-viewer/index.html?lang=jsx&url=${encodeURIComponent(this.data.src)}`);
                e.stopPropagation();
            },
            open: function() {
                function showCode(lang, code) {
                    eventHub.$emit("showCode", {
                        lang,
                        data: code
                    });
                }
                if (this.data.src) {
                    $.get(this.data.src, (code) => {
                        showCode(this.data.lang, code);
                    });
                } else {
                    showCode(this.data.lang, this.data.data);
                }

            }
        }
    }

</script>
