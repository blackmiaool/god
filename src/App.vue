<template>
    <div class="chat-page">
        <div class="left-tabs-wrap">
            <div class="middle">
                <img src="./assets/deep_ui/btn_rect_orange6.png" class="bg-image">
            </div>
            <img src="./assets/deep_ui/btn_rect_orange5.png" class="bg-image top">


            <img src="./assets/deep_ui/btn_rect_orange4.png" class="bg-image bottom">
            <div class="avatar deep-avatar">
                <img src="./assets/avatar.gif" alt="">
            </div>
            <div class="tabs">
                <div data-tab-name="groups" class="clickable"></div>
                <div data-tab-name="search" class="clickable"></div>
                <div data-tab-name="other" class="clickable"></div>
            </div>
            <div class="tools">
                <div data-tool-name="logging"></div>
                <div data-tool-name="search"></div>
                <div data-tool-name="other"></div>
            </div>
        </div>
        <div class="list-wrap">
            <header>已加入列表</header>
            <ul>
                <li>
                    <span class="avatar deep-avatar">
                        <img src="./assets/avatar2.jpeg" alt="">
                    </span>
                    <span class="name">MDZZ</span>
                </li>
            </ul>
        </div>
        <div class="main-area-wrap">
            <main class="deep-panel">
                <div class="messages-wrap deep-scroll" v-sticky-scroll>
                    <Message v-for="msg in messages" :avatar="msg.avatar" :name="msg.name" :time="msg.time" :content="msg.content">

                    </Message>
                </div>
            </main>
            <header class="">
                <span class="name">MDZZ</span>
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
    import StickScroll from './directives/stick-scroll';
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
    export default {
        name: 'app',
        data() {
            return {
                messages: [{
                    name: "blackmiaool",
                    time: "16:36",
                    content: "这个风格怎么样",
                    avatar: "/static/img/avatar.ed30abc.gif",
                }],
                abc: "",
                imgPath: "./assets"
            }
        },
        methods: {
            send() {
                console.log(this.inputText)
                this.messages.push({
                    name: "blackmiaool",
                    time: (new Date()).format("hh:mm"),
                    content: this.inputText,
                    avatar: "/static/img/avatar.ed30abc.gif",
                });
            },
            input($event) {
                this.inputText = $event.target.innerHTML;
            }
        },
        components: {
            Message
        },
        directives: {
            StickScroll
        }
    }

</script>
