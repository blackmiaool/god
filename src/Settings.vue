<template>
    <div class="top-page-wrap settings-page">         
        <div class="login-panel deep-panel">
            <div class="input-block">
                <input name="name" class="deep-input" type="text" placeholder="Room name" v-model="roomName">
                <div class="err" v-if="webError.name">{{webError.name}}</div>
            </div>
            <header>
                <img src="./assets/room_header.png" alt="">
            </header>
            <button @click="send" class="accept deep-icon" data-icon="accept"></button>
        </div>
    </div>
</template>

<script>
    import $ from "jquery";
    import Vue from 'vue';
    import socket from "./io";
    const config = require("../config.js");


    export default {
        name: 'settings',
        mounted() {
            console.log(234234)
        },
        beforeRouteEnter(to, from, next) {
            console.log(123)
            next(vm => {
                if (!socket.context.logged) {

                    router.replace("/login")
                }
            });
        },
        data() {
            return {
                roomName: "",
                webError: {},
            }
        },
        computed: {},
        mounted() {},
        methods: {
            send() {

            },
        },
        components: {


        },
    }

</script>
