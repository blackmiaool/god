<template>
<div class="main-area-wrap image-drop-zone" @drop="drop" @dragenter="dragEnter" @dragleave="dragLeave" @dragexit="dragExit" @dragover="dragOver" @click="dragClear" :ref="'room'+roomName">
    <main class="deep-panel" @load="load">
        <div class="messages-wrap deep-scroll" v-sticky-scroll>
            <Message v-for="msg in messages" :avatar="msg.avatar" :name="msg.name" :time="msg.time" :content="msg.content" :type="msg.type">

            </Message>
        </div>
    </main>
    <header class="">
        <span class="name">{{roomName}}</span>
    </header>
    <footer>
        <img src="../assets/deep_ui/little_box1.png" class="bg-img left">
        <img src="../assets/deep_ui/little_box2.png" class="bg-img right">
        <div class="bg-img middle">
            <img src="../assets/deep_ui/little_box3.png" class="bg-img">
        </div>
        <div class="tools-wrap">
            <i @click="toggleEmotion" class="glyphicon glyphicon-heart-empty clickable" data-tool="emotion"></i>
            <i class="glyphicon glyphicon-picture clickable" data-tool="img">
                <input @change="fileUpload" type="file" accept="image/png,image/jpeg,image/gif" style="position: absolute; width: 100%; height: 100%; left: 0px; top: 0px; opacity: 0; z-index: 8;">
            </i>
            <i @click="openInputCode()" class="glyphicon glyphicon-edit clickable" data-tool="code"></i>
        </div>        
        <div class="input-wrap deep-scroll" @keypress="input" @keyup="input" contenteditable="" @keypress.enter.prevent="sendText" @paste="paste" ref="$input">
        </div>        
        <div @click="sendText()" class="send-wrap clickable">
            <i class="glyphicon glyphicon-send" data-tool="img"></i>
        </div>
    </footer>    
</div>
</template>
<script>
    import $ from "jquery";
    import Message from './Message';
    import MessageSection from './MessageSection';
    import StickScroll from '../directives/stick-scroll';
    import eventHub from '../eventHub';
    const loadImage = require("blueimp-load-image");

    export default {
        name: 'Room',
        created() {

        },
        methods: {
            sendText() {
                this.send(this.roomName, 'text', this.inputText);
                this.clearInput();
            },
            sendCode() {

            },

            input($event) {
                this.inputText = this.$refs.$input.textContent;
            },
            clearInput() {
                this.$refs.$input.innerHTML = "";
            },
            load() {
                console.log(a)
            },
            paste(e) {
                console.log(e);
                const items = (e.clipboardData || e.originalEvent.clipboardData).items;
                const types = (e.clipboardData || e.originalEvent.clipboardData).types;
                const roomName = this.roomName;
                if (!roomName) {
                    console.log("no room");
                    return;
                }
                const that = this;
                console.log(1, types, items, items[0], items[1])
                if (types.indexOf('Files') > -1) {
                    for (let index = 0; index < items.length; index++) {
                        const item = items[index];
                        if (item.kind === 'file' && item.type.match(/^image/)) {
                            const reader = new FileReader();
                            const instance = this;
                            reader.onloadend = function() {
                                that.send(roomName, "image", {
                                    data: this.result
                                });
                            };
                            reader.readAsDataURL(item.getAsFile());
                        }
                    }
                    e.preventDefault();
                }
            },
            fileUpload(e) {
                const roomName = this.roomName;
                const that = this;
                console.log(e);
                loadImage(
                    e.target.files[0],
                    function(canvas) {
                        that.send(roomName, "image", {
                            data: canvas.toDataURL()
                        });
                    }, {
                        orientation: true,
                        maxWidth: 200,
                        maxHeight: 200
                    } // Options
                );

            },
            drop(e) {
                const dropEvent = e;
                this.$refs['room' + this.roomName].classList.remove("dragging");
                const roomName = this.roomName;
                e.stopPropagation();
                e.preventDefault();
                console.log(e.dataTransfer)
                    //                var imageUrl = e.dataTransfer.getData('Text'); // alert(imageUrl);
                const that = this;
                var items = e.dataTransfer.items;

                console.log(e.dataTransfer.files)

                const files = e.dataTransfer.files;
                for (let index = 0; index < items.length; index++) {
                    const item = items[index];
                    console.log(item);
                    if (item.kind === 'file') {
                        let kind;
                        if (item.type.match(/^image/)) {
                            kind = "image";
                        } else {
                            kind = "file";
                        }
                        const reader = new FileReader();
                        const instance = this;
                        reader.onloadend = function(e) {
                            console.log(e, index, "i");
                            that.send(roomName, kind, {
                                name: files[index].name,
                                data: this.result
                            });
                        };
                        reader.readAsDataURL(item.getAsFile());

                    }
                }
            },
            dragClear(e) {
                this.$refs['room' + this.roomName].classList.remove("dragging");
            },
            dragEnter(e) {
                this.$refs['room' + this.roomName].classList.add("dragging");
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
                const input = this.$refs.$input;
                const $input = $(input);
                input.innerHTML += `#(${name})`;
                this.inputText = input.textContent;
                this.showEmotion = false;

                $input.focus();
                var strLength = input.innerHTML.length;
                var range = document.createRange();
                var sel = window.getSelection();
                range.setStart(input.childNodes[0], strLength);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            },
            toggleEmotion() {
                eventHub.$emit("toggleEmotion", this);
            },
        },
        components: {
            Message,
        },
        directives: {
            StickScroll
        },
        props: ['messages', 'roomName', 'send', 'openInputCode']
    };

</script>
