<template>
    <div class="left-tabs-wrap">
        <div class="middle">
            <img src="../assets/deep_ui/btn_rect_orange6.png" class="bg-image">
        </div>
        <img src="../assets/deep_ui/btn_rect_orange5.png" class="bg-image top">


        <img src="../assets/deep_ui/btn_rect_orange4.png" class="bg-image bottom">
        <div class="avatar deep-avatar">
            <img v-if="avatar" :src="avatar" alt="" :class="{active:connected}">
        </div>
        <div class="tabs">
            <router-link to="/chat" data-tab-name="groups" class="clickable"></router-link>
            <router-link to="/settings" data-tab-name="settings" class="clickable"></router-link>
<!--                <div data-tab-name="search" class="clickable"></div>-->
<!--                <div data-tab-name="other" class="clickable"></div>-->
            <router-link to="/login" data-tab-name="login" class="clickable"></router-link>
        </div>
        <div class="tools">
            <div data-tool-name="logging"></div>
            <div data-tool-name="search"></div>
            <div data-tool-name="other"></div>
        </div>
    </div> 
</template>

<script>
    export default {
        name: 'leftTabs',
        props: {
            avatar: String,
            connected: Boolean
        },
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
