<template>
    <div class="top-page-wrap login-page">
        <div class="login-panel deep-panel">
            <div class="input-block">
                <input name="name" class="deep-input" type="text" placeholder="Username" v-model="name">
                <div class="err" v-if="webError.name">{{webError.name}}</div>
            </div>
            <div class="input-block">
                <input name="password" class="deep-input" type="password" placeholder="Password" v-model="password">
                <div class="err" v-if="webError.password">{{webError.password}}</div>
            </div>
            <div class="input-block">
                <input name="password2" v-if="mode==='register'" class="deep-input" type="password" placeholder="Password again (optional)" v-model="password2">
                <div class="err" v-if="webError.password2">{{webError.password2}}</div>
            </div>
            <div v-if="mode==='register'" @click="refreshAvatar()" class="avatar-preview" :style="{'background-image':'url('+avatar+')'}"></div>
            <label class="remember deep-select">
                    <input v-model="remember" name="remember" type="checkbox">
                    <span class="deep-checkbox"></span>
                    <span>Remember me</span>
                    </label>

            <header>
                <img v-if="mode==='login'" src="./assets/login_header.png" alt="">
                <img v-if="mode==='register'" src="./assets/register_header.png" alt="">
            </header>
            <button @click="send" class="accept deep-icon" data-icon="accept"></button>
            <button v-if="mode==='login'" class="go-register clickable" @click="setMode('register')">or Register</button>
            <button v-if="mode==='register'" class="go-register clickable" @click="setMode('login')">or Login</button>
        </div>
    </div>
</template>

<script>
    import $ from "jquery";
    import md5 from 'md5';
    import {
        registerCheck
    } from '../common/check';
    import Vue from 'vue';
    import socket from "./io";
    const config = require("../config.js");

    socket.on("sync", function({
        avatar,
        rooms,
        name,
    }) {

    });
    let autoLoginOnce = false;
    export default {
        name: 'app',
        mounted() {

        },
        data() {
            return {
                avatar: "",
                mode: "register",
                name: "",
                password: "",
                password2: "",
                serverError: {},
                webError: {},
                remember: true,
            }
        },
        computed: {},
        mounted() {
            this.refreshAvatar();
            if (!autoLoginOnce) {
                autoLoginOnce = true;
                const {
                    name,
                    password
                } = JSON.parse(localStorage.getItem("god-account")) || {};
                if (name) {
                    this.doLogin(name, password);
                }
            }
        },
        methods: {
            refreshAvatar() {
                $.post("//" + location.hostname + `:${config.serverPort}/avatar`, {}, (result) => {
                    this.avatar = result;
                });
            },
            setMode(mode) {
                this.mode = mode;
                this.webError = {};
            },
            doLogin(name, password) {
                socket.emit("login", {
                    name: name || this.name,
                    password: password || md5(this.password)
                }, (result) => {

                    if (!result.code) {
                        if (!name) {
                            localStorage.setItem("god-account", JSON.stringify({
                                name: this.name,
                                password: md5(this.password)
                            }));
                        }
                        this.onSuccess(result.data);
                    } else if (result.key) {
                        this.webError = {
                            [result.key]: result.msg
                        }
                    } else if (result.msg) {
                        alert(result.msg);
                    } else {
                        alert("error");
                    }
                });
            },
            onSuccess(data) {
                if (this.remember) {


                }
                data.rooms.forEach(function(room) {
                    room.messages.forEach(function(message) {
                        message.time = (new Date(message.time)).format("hh:mm")
                    });
                });
                this.$root.avatar = data.avatar;
                socket.context.logged = true;
                window.router.push({
                    name: 'Chat',
                    params: data
                });
                //                    window.router.push("chat");
            },
            send() {

                this.webError = {};

                const checkResult = registerCheck("web", this.name, md5(this.password), this.password2 && this.mode === "register" ? md5(this.password2) : '');

                if (checkResult) {
                    this.webError = {
                        [checkResult.key]: checkResult.message
                    };
                    return;
                }



                if (this.mode === "register") {
                    $.post("//" + location.hostname + `:${config.serverPort}/${this.mode}`, {
                        name: this.name,
                        password: md5(this.password),
                        avatar: this.avatar
                    }, (result) => {
                        if (!result.code) {
                            this.doLogin();
                        } else if (result.key) {
                            this.webError = {
                                [result.key]: result.msg
                            }
                        } else if (result.msg) {
                            alert(result.msg);
                        } else {
                            alert("error");
                        }

                    });
                } else {
                    this.doLogin();
                }





            }
        },
        components: {


        },
    }

</script>
