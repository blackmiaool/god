<template>
    <div class="chat-page">
        <LeftTabs/>
        <div class="list-wrap">
            <header>已加入列表</header>
            <ul>
                <li v-for="room in rooms" class="clickable" @click="currentRoom=room" :class="{selected:currentRoom===room}">
                    <span class="avatar deep-avatar">
                       <div class="avatar-img" :style="{'background-image':'url('+room.avatar+')'}"></div>
                    </span>
                    <span class="name">{{room.name}}</span>
                </li>
            </ul>
        </div>
        <div class="main-area-wrap">
            <main class="deep-panel">
                <div class="messages-wrap deep-scroll" v-sticky-scroll>
                    <Message v-for="msg in currentRoom.messages" :avatar="msg.avatar" :name="msg.name" :time="msg.time" :content="msg.content" type="msg.type">

                    </Message>
                </div>
            </main>
            <header class="">
                <span class="name">{{currentRoom.name}}</span>
            </header>
            <footer>
                <img src="./assets/deep_ui/little_box1.png" class="bg-img left">
                <img src="./assets/deep_ui/little_box2.png" class="bg-img right">
                <div class="bg-img middle">
                    <img src="./assets/deep_ui/little_box3.png" class="bg-img">
                </div>
                <div class="tools-wrap">
                    <i class="glyphicon glyphicon-heart-empty" data-tool="emotion"></i>
                    <i class="glyphicon glyphicon-picture" data-tool="img"></i>
                </div>
                <div class="input-wrap" @keypress="input" @keyup="input" contenteditable="" @keypress.enter.prevent="send">
                </div>
                <div @click="send" class="send-wrap clickable">
                    <i class="glyphicon glyphicon-send" data-tool="img"></i>
                </div>
            </footer>
        </div>
        <div class="right-info-wrap">
            <div class="bulletin">
                <header>Bulletin</header>
                <main>Bulletin Content</main>
            </div>
            <div class="member-list-wrap">
                <header>
                    Members
                </header>
                <ul>
                    <li>
                        <span class="avatar">
                        
                            <img  src="./assets/avatar.gif" alt="">
                        </span>
                        <span class="state glyphicon glyphicon-phone"></span>
                        <span class="name">blackmiaool</span>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
    import Message from './components/Message';
    import MessageSection from './components/MessageSection';

    import StickScroll from './directives/stick-scroll';
    import LeftTabs from './components/LeftTabs';
    //    import Vue from 'vue';
    //    Vue.directive('contenteditable-model', {
    //        twoWay: true,
    //        bind: function(el) {
    //            el.handler = function() {
    //                this.set(el.innerHTML)
    //            }.bind(this)
    //            el.addEventListener('keyup', el.handler)
    //        },
    //        update: function(newValue, oldValue) {
    //            this.el.innerHTML = newValue || ''
    //        },
    //        unbind: function(el) {
    //            el.removeEventListener('keyup', el.handler)
    //        }
    //    })

    const socket = window.io(':9012');

    export default {
        name: 'app',
        mounted() {
            socket.on('cr-message', (data) => {
                console.log(this);
                if (data.name === "robot10") {
                    let fakeData;
                    try {
                        fakeData = JSON.parse(data.content);
                    } catch (e) {

                    }

                    if (typeof fakeData === "object" && fakeData) {
                        fakeData.room = data.room;
                        fakeData.source = data.source;
                        data = fakeData;
                    }
                }
                console.log(data);
                const targetRoom = this.rooms.filter(function(room) {
                    return room.name === data.room;
                })[0];
                if (targetRoom) {
                    targetRoom.messages.push({
                        name: data.name,
                        time: (new Date()).format("hh:mm"),
                        content: data.content,
                        avatar: data.avatar,
                        source: data.source,
                    });
                }
            });
            this.currentRoom = this.rooms[0];
        },
        data() {
            return {
                currentRoom: {},
                rooms: [{
                    name: "god",
                    avatar: require("assets/avatar.gif"),
                    messages: [{
                        name: "blackmiaool",
                        time: "16:36",
                        content: "<h1></h1>234#(乖) 年后可#(乖) 年后可以以这个为DEMO",
                        type: "text",
                        avatar: require("assets/avatar.gif"),
                    }],
                }, {
                    name: "MDZZ",
                    avatar: require("assets/lolo.jpg"),
                    messages: [{
                        name: "blackmiaool",
                        time: "16:36",
                        content: "WTF-MDZZ",
                        type: "text",
                        avatar: require("assets/avatar.gif"),
                    }],
                }, {
                    name: "fiora",
                    avatar: require("assets/fiora.jpeg"),
                    messages: [{
                        name: "blackmiaool",
                        time: "16:36",
                        content: "WTF-fiora",
                        type: "text",
                        avatar: require("assets/avatar.gif"),
                    }],
                }],
            }
        },
        methods: {
            send() {
                console.log(this.inputText);

                socket.emit("god-message", {
                    content: this.inputText,
                    room: this.currentRoom.name,
                });
                this.currentRoom.messages.push({
                    name: "blackmiaool",
                    time: (new Date()).format("hh:mm"),
                    content: this.inputText,
                    avatar: "/static/img/avatar.gif",
                });
                this.$input.innerHTML = "";
            },
            input($event) {
                if (!this.$input) {
                    this.$input = $event.target;
                }
                this.inputText = this.$input.textContent;
            }
        },
        components: {
            Message,LeftTabs

        },
        directives: {
            StickScroll
        }
    }

</script>
