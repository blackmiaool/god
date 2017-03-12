<template>
    <div class="room-panel deep-panel">
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
            <div class="deep-header"><img class="deep-text" src="../assets/header_text/room.png" alt=""></div>     
        </header>
        <button @click="send" class="accept deep-icon" data-icon="accept"></button>
    </div> 
</template>

<script>
    import $ from "jquery";
    import socket from "../io";

    export default {
        name: 'ConfigPanel',
        mounted() {

        },
        data() {
            return {
                roomName: "",
                roomAction: "create",
                webError: "",
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
        },
    }

</script>
