<template>
    <div class="chat-page">
        <div class="left-tabs-wrap">
            <div class="middle">
                <img src="../assets/deep_ui/btn_rect_orange6.png" class="bg-image">
            </div>
            <img src="../assets/deep_ui/btn_rect_orange5.png" class="bg-image top">


            <img src="../assets/deep_ui/btn_rect_orange4.png" class="bg-image bottom">
            <div class="avatar deep-avatar">
                <img src="../assets/avatar.gif" alt="">
            </div>
            <div class="tabs">
                <div data-tab-name="groups" class="clickable"></div>
                <div data-tab-name="search" class="clickable"></div>
                <div data-tab-name="other" class="clickable"></div>
            </div>
            <div class="tools">
                <div data-tool-name="logging"></div>
                <div data-tool-name="search"></div>
                <div data-tool-name="other"></div>
            </div>
        </div>
       
    </div>
</template>

<script>

    export default {
        name: 'leftTabs',       
        data() {
            return {
                
            }
        },
        methods: {

        },
        components: {

        },
        directives: {

        }
    }

</script>
