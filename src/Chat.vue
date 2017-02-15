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
        <Room :roomName="currentRoom.name" :messages="currentRoom.messages" :send="send" :toggleInputCode="toggleInputCode"></Room>
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
        <div v-if="showEmotion" class="emotion-wrap deep-frame">
            <div v-for="(emotion,index) in baiduEmotions" class="emotion" :style="{ background: 'url('+emotion.src+') no-repeat' }" @click="addEmotion(emotion.name)">
            </div>
        </div>
        <div v-show="showCode" class="code-wrap deep-frame">
            <textarea ref="code-area"></textarea>
            <div class="tool-bar">
                <select v-model="codeLang">
                    <option>javascript</option>
                    <option>css</option>
                    <option>html</option>
                </select>
                <button @click="sendCode()" class="send-code deep-btn green">Send</button>
            </div>
        </div>
    </div>
</template>

<script>
    import $ from "jquery";
    import socket from "./io";
    import Room from './components/Room';

    const CodeMirror = require('./codemirror/lib/codemirror.js');
    require('./codemirror/mode/javascript/javascript.js');
    require('./codemirror/mode/css/css.js');
    require('./codemirror/mode/htmlmixed/htmlmixed.js');

    require('./codemirror/lib/codemirror.css');
    require('./codemirror/theme/monokai.css');

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
                showCode: false,
                codeLang: "javascript",
                editor: false,
                baiduEmotions: [
                    '呵呵', '哈哈', '吐舌', '啊', '酷', '怒', '开心', '汗', '泪', '黑线',
                    '鄙视', '不高兴', '真棒', '钱', '疑问', '阴险', '吐', '咦', '委屈', '花心',
                    '呼', '笑眼', '冷', '太开心', '滑稽', '勉强', '狂汗', '乖', '睡觉', '惊哭',
                    '生气', '惊讶', '喷', '爱心', '心碎', '玫瑰', '礼物', '彩虹', '星星月亮', '太阳',
                    '钱币', '灯泡', '咖啡', '蛋糕', '音乐', 'haha', '胜利', '大拇指', '弱', 'ok',
                ],
            }
        },
        watch: {
            codeLang: function(v) {
                this.editor.setOption("mode", v);

            }
        },
        methods: {
            toggleInputCode(e) {
                this.showCode = !this.showCode;
                setTimeout(() => {
                    if (!this.editor) {
                        this.editor = CodeMirror.fromTextArea(this.$refs['code-area'], {
                            lineNumbers: true,
                            mode: "text/" + this.codeLang,
                            matchBrackets: true,
                            theme: "monokai"
                        });
                    }


                });
            },
            setDefaultRoom() {

                if (this.$route.params.rooms) {
                    this.rooms = this.$route.params.rooms;
                }


                if (!this.rooms || this.rooms.length === 0) {
                    return;
                }

                this.currentRoom = this.rooms[0];
            },
            send(roomName, type, content) {
                if (!content) {
                    return;
                }
                if (socket.context.logged) {
                    socket.send({
                        room: roomName,
                        type,
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

            },

        },
        components: {
            Room
        }

    }

</script>
