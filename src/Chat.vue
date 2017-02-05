<template>
    <div class="chat-page">       
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
        <div class="main-area-wrap image-drop-zone" @drop="drop" @dragenter="dragEnter" @dragleave="dragLeave" @dragexit="dragExit" @dragover="dragOver" @click="dragClear" :ref="'room'+currentRoom.name">
            <main class="deep-panel">
                <div class="messages-wrap deep-scroll" v-sticky-scroll>
                    <Message v-for="msg in currentRoom.messages" :avatar="msg.avatar" :name="msg.name" :time="msg.time" :content="msg.content" :type="msg.type">

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
                    <i class="glyphicon glyphicon-heart-empty clickable" data-tool="emotion"></i>
                    <i class="glyphicon glyphicon-picture clickable" data-tool="img">
                        <input @change="fileUpload" type="file" accept="image/png,image/gif,image/gif" style="position: absolute; width: 100%; height: 100%; left: 0px; top: 0px; opacity: 0; z-index: 8;">
                    </i>
                </div>
                <div class="input-wrap" @keypress="input" @keyup="input" contenteditable="" @keypress.enter.prevent="send" @paste="paste">
                </div>
                <div @click="send" class="send-wrap clickable">
                    <i class="glyphicon glyphicon-send" data-tool="img"></i>
                </div>
            </footer>
        </div>
        <div class="right-info-wrap">
            <div class="bulletin">
                <header>Bulletin</header>
                <main>{{currentRoom.bulletin}}</main>
            </div>
            <div class="member-list-wrap">
                <header>
                    Members
                </header>
                <ul>
                    <li v-for="member in currentRoom.members">
                        <span class="avatar">
                        
                            <img  :src="member.avatar" alt="">
                        </span>
                        <span class="state glyphicon glyphicon-phone"></span>
                        <span class="name">{{member.name}}</span>
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
    const loadImage = require("blueimp-load-image");
    import $ from "jquery";
    import socket from "./io";


    $(document.body).on("mouseover", function() {
        $(".image-drop-zone").removeClass("dragging")
    });
    export default {
        name: 'Chat',
        created() {
            socket.on('sync-members', ({
                name,
                members
            }) => {
                this.rooms.filter(function(room) {
                    return room.name === name;
                })[0].members = members;
            });
            socket.on('message', ({
                room: roomName,
                type,
                content,
                name,
                avatar,
                time,
            }) => {
                const targetRoom = this.rooms.filter(function(room) {
                    return room.name === roomName;
                })[0];
                if (!targetRoom) {
                    return;
                }
                targetRoom.messages.push({
                    name,
                    time: (new Date(time)).format("hh:mm"),
                    content,
                    avatar: avatar || '/static/img/avatar.gif',
                    type
                });
            });
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
        },
        beforeRouteEnter(to, from, next) {

            next(vm => {

                vm.setDefaultRoom();
            });
        },
        mounted() {
            if (!socket.context.logged) {

                router.replace("/login")
            }
            this.setDefaultRoom();


        },
        data() {
            return {
                currentRoom: {},
                rooms: [],
            }
        },
        methods: {
            setDefaultRoom() {

                if (this.$route.params.rooms) {
                    this.rooms = this.$route.params.rooms;
                }


                if (!this.rooms || this.rooms.length === 0) {
                    return;
                }

                this.currentRoom = this.rooms[0];
            },
            send() {
                console.log(this.inputText);
                const content = this.inputText;
                if (!content) {
                    return;
                }
                if (socket.context.logged) {
                    socket.send({
                        room: this.currentRoom.name,
                        type: "text",
                        content,
                    });
                } else {
                    alert("Connection is broken");
                }
                //                socket.emit("god-message", {
                //                    content: this.inputText,
                //                    room: this.currentRoom.name,
                //                });
                //                this.currentRoom.messages.push({
                //                    name: "blackmiaool",
                //                    time: (new Date()).format("hh:mm"),
                //                    content: this.inputText,
                //                    avatar: "/static/img/avatar.gif",
                //                });
                this.$input.innerHTML = "";
            },
            input($event) {
                if (!this.$input) {
                    this.$input = $event.target;
                }
                this.inputText = this.$input.textContent;
            },
            paste(e) {
                console.log(e);
                const items = (e.clipboardData || e.originalEvent.clipboardData).items;
                const types = (e.clipboardData || e.originalEvent.clipboardData).types;

                console.log(items, types, items.length, items[0])
                const roomName = this.currentRoom && this.currentRoom.name;
                if (!roomName) {
                    return;
                }
                if (types.indexOf('Files') > -1) {
                    for (let index = 0; index < items.length; index++) {
                        const item = items[index];
                        if (item.kind === 'file' && item.type.match(/^image/)) {
                            const reader = new FileReader();
                            const instance = this;
                            reader.onloadend = function() {
                                //                                const img = new Image();
                                //                                img.src = this.result;
                                socket.send({
                                    room: roomName,
                                    type: "image",
                                    content: this.result
                                });
                                //                                console.log(img)
                            };
                            reader.readAsDataURL(item.getAsFile());
                        }
                    }
                    e.preventDefault();
                }
            },
            fileUpload(e) {
                const roomName = this.currentRoom && this.currentRoom.name;
                console.log("e2", e);
                loadImage(
                    e.target.files[0],
                    function(canvas) {
                        socket.send({
                            room: roomName,
                            type: "image",
                            content: canvas.toDataURL()
                        });
                    }, {
                        orientation: true,
                        maxWidth: 200,
                        maxHeight: 200
                    } // Options
                );

            },
            drop(e) {
                this.$refs['room' + this.currentRoom.name].classList.remove("dragging");
                const roomName = this.currentRoom && this.currentRoom.name;
                e.stopPropagation();
                e.preventDefault();
                console.log(e.dataTransfer)
                    //                var imageUrl = e.dataTransfer.getData('Text'); // alert(imageUrl);

                var items = e.dataTransfer.items;
                for (let index = 0; index < items.length; index++) {
                    const item = items[index];
                    if (item.kind === 'file' && item.type.match(/^image/)) {
                        const reader = new FileReader();
                        const instance = this;
                        reader.onloadend = function() {
                            //                                const img = new Image();
                            //                                img.src = this.result;
                            socket.send({
                                room: roomName,
                                type: "image",
                                content: this.result
                            });
                            //                                console.log(img)
                        };
                        reader.readAsDataURL(item.getAsFile());
                    }
                }
            },
            dragClear(e) {
                console.log(this.$refs)
                this.$refs['room' + this.currentRoom.name].classList.remove("dragging");
            },
            dragEnter(e) {
                this.$refs['room' + this.currentRoom.name].classList.add("dragging");
                e.stopPropagation();
                e.preventDefault();
            },
            dragExit(e) {
                e.stopPropagation();
                e.preventDefault();
            },
            dragLeave(e) {
                e.stopPropagation();
                e.preventDefault();
            },
            dragOver(e) {
                e.stopPropagation();
                e.preventDefault();
                //               e.stopPropagation(); // e.preventDefault();
            }
        },
        components: {
            Message,


        },
        directives: {
            StickScroll
        }
    }

</script>
