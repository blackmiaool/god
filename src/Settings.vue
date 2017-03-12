<template>
    <div class="top-page-wrap settings-page">
        <div class="setting-tab-header-wrap">   
            <div v-for="(tab,$index) in tabs" v-on:click="selectTab($index)">
              <SettingTabHeader  :tab="tab"  :active="currentTab===$index"/>
            </div>           
        </div>
        <div class="room-panel deep-panel" :class="{top:currentTab>0}">
            <div class="input-block">
               <div class="descr">{{roomAction==='create'?'Create':'Join'}} a Room</div>
                <input name="name" class="deep-input" type="text" placeholder="Room name" v-model="roomName">
                <div class="err" v-if="webError">{{webError}}</div>
            </div>
            <label class="select-room-action deep-select">
                    <input v-model="roomAction" name="room" type="radio" value="create">
                    <span class="deep-checkbox"></span>
                    <span>Create</span>
            </label>
            <label class="select-room-action deep-select">
                    <input v-model="roomAction" name="room" type="radio" value="join">
                    <span class="deep-checkbox"></span>
                    <span>Join&nbsp;&nbsp;&nbsp;&nbsp;</span>
            </label>
            <header>
                <div class="deep-header"><img class="deep-text" src="./assets/header_text/room.png" alt=""></div>                
            </header>
            <button @click="send" class="accept deep-icon" data-icon="accept"></button>
        </div>
        <div class="config-panel deep-panel"  :class="{top:currentTab>1,bottom:currentTab<1}">            
            <label class="check-notification-action deep-select">
                <input v-model="showNotification" name="notification" type="checkbox">
                <span class="deep-checkbox"></span>
                <span>Show Notification</span>
            </label>            
            <header>
                <div class="deep-header"><img class="deep-text" src="./assets/header_text/config.png" alt=""></div> 
            </header>            
        </div>
    </div>
</template>

<script>
    import $ from "jquery";
    import Vue from 'vue';
    import socket from "./io";
    import SettingTabHeader from './components/SettingTabHeader';

    const config = require("../config.js");

    export default {
        name: 'settings',
        mounted() {

        },
        beforeRouteEnter(to, from, next) {
            next(vm => {
                if (!socket.context.logged) {
                    router.replace("/login")
                }
            });
        },
        data() {
            return {
                roomName: "",
                roomAction: "create",
                webError: "",
                tabs: ["ROOM", "CONFIG"],
                currentTab: 0,
                showNotification: false
            }
        },
        computed: {},
        mounted() {},
        methods: {
            send() {
                socket.emit(`${this.roomAction}-room`, {
                    name: this.roomName
                }, (result) => {
                    if (result.code) {
                        this.webError = result.msg
                    } else {
                        router.push({
                            name: 'Chat',
                            params: {
                                room: this.roomName
                            }
                        });
                    }
                });
            },
            selectTab(tab) {
                console.log('this.currentTab = tab;', tab);
                this.currentTab = tab;
            }
        },
        components: {
            SettingTabHeader

        },
    }

</script>
