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

            <header  > 
              <div class="deep-header">
                   <img v-if="mode==='login'" class="deep-text" src="./assets/header_text/login.png" alt="">
                   <img v-if="mode==='register'" class="deep-text" src="./assets/header_text/register.png" alt="">
              </div>           
              
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
    import eventHub from './eventHub';

    const href = window.location.href;
    let firstPage = href.match(/\/#\/(\w+)/);
    if (firstPage) {
        firstPage = firstPage[1];
    }

    let cacheLoginInfo;
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

            const {
                name,
                password
            } = JSON.parse(localStorage.getItem("god-account")) || {};

            socket.on("connect", () => {
                if (cacheLoginInfo) {
                    this.doLogin(cacheLoginInfo.name, cacheLoginInfo.password);
                } else if (name) {
                    this.doLogin(name, password);
                }
            });
            socket.on("disconnect", () => {
                this.$root.connected = false;
            });

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
                        if (!name) { //login with input info
                            cacheLoginInfo = {
                                name: this.name,
                                password: md5(this.password)
                            };
                            if (this.remember) {
                                localStorage.setItem("god-account", JSON.stringify({
                                    name: this.name,
                                    password: md5(this.password)
                                }));
                            }
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
                this.$root.avatar = data.avatar;
                this.$root.connected = true;
                socket.context.logged = true;
                if (firstPage === 'settings') {
                    window.router.push({
                        name: 'Settings',
                        params: {}
                    });
                } else {
                    window.router.push({
                        name: 'Chat',
                        params: data
                    });
                }

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
