<template>
    <div class="top-page-wrap chat-page">       
        <div class="list-wrap">
            <header>已加入列表</header>
            <ul class="deep-scroll">
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
                    <i @click="toggleEmotion" class="glyphicon glyphicon-heart-empty clickable" data-tool="emotion"></i>
                    <i class="glyphicon glyphicon-picture clickable" data-tool="img">
                        <input @change="fileUpload" type="file" accept="image/png,image/gif,image/gif" style="position: absolute; width: 100%; height: 100%; left: 0px; top: 0px; opacity: 0; z-index: 8;">
                    </i>
                </div>
                <div class="input-wrap" @keypress="input" @keyup="input" contenteditable="" @keypress.enter.prevent="send" @paste="paste" ref="$input">
                </div>
                <div @click="send" class="send-wrap clickable">
                    <i class="glyphicon glyphicon-send" data-tool="img"></i>
                </div>
            </footer>
            <div v-if="showEmotion" class="emotion-wrap deep-frame">
                <div v-for="(emotion,index) in baiduEmotions" class="emotion" :style="{ background: 'url('+emotion.src+') no-repeat' }" @click="addEmotion(emotion.name)">
                    
                </div>
            </div>
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

    require(`assets/avatar.gif`);
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
                const targetRoom = this.rooms.filter(function(room) {
                    return room.name === name;
                })[0];
                if (targetRoom) {
                    targetRoom.members = members;
                }

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
                    avatar: avatar,
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
                if (!socket.context.logged) {

                    router.replace("/login")
                }
                const targetRoomName = vm.$route.params.room;
                if (targetRoomName) {
                    const haveRoom = vm.rooms.some((room) => {
                        if (room.name === targetRoomName) {
                            vm.currentRoom = room;
                            return true;
                        } else {
                            return false;
                        }
                    });
                    if (!haveRoom) {
                        socket.emit("get-room", {
                            name: targetRoomName
                        }, (result) => {
                            if (result.code) {
                                console.warn(result.msg)
                            } else {
                                vm.rooms.push(result.data);
                                vm.currentRoom = result.data;
                            }


                        });
                    }
                } else {
                    vm.setDefaultRoom();
                }
            });
        },
        mounted() {

            this.setDefaultRoom();

            this.baiduEmotions.forEach(function(name, i, a) {
                a[i] = {
                    name,
                    src: require(`assets/expressions/${name}.png`)
                }
            });
        },
        data() {
            return {
                currentRoom: {},
                rooms: [],
                showEmotion: false,
                baiduEmotions: [
                    '呵呵', '哈哈', '吐舌', '啊', '酷', '怒', '开心', '汗', '泪', '黑线',
                    '鄙视', '不高兴', '真棒', '钱', '疑问', '阴险', '吐', '咦', '委屈', '花心',
                    '呼', '笑眼', '冷', '太开心', '滑稽', '勉强', '狂汗', '乖', '睡觉', '惊哭',
                    '生气', '惊讶', '喷', '爱心', '心碎', '玫瑰', '礼物', '彩虹', '星星月亮', '太阳',
                    '钱币', '灯泡', '咖啡', '蛋糕', '音乐', 'haha', '胜利', '大拇指', '弱', 'ok',
                ],
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
                this.$refs.$input.innerHTML = "";
            },
            input($event) {
                this.inputText = this.$refs.$input.textContent;
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
            },
            addEmotion(name) {
                this.$refs.$input.innerHTML += `#(${name})`;
                this.inputText = this.$refs.$input.textContent;
                this.showEmotion = false;
            },
            toggleEmotion(e) {
                this.showEmotion = !this.showEmotion;
                e.stopPropagation();
                e.preventDefault();
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
