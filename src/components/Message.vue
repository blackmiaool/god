<template>
    <div class="message-wrap">
        <div class="avatar">
            <div class="avatar-img" :style="{'background-image':'url('+avatar+')'}"></div>
            <!--            <img :src="avatar" alt="">-->
        </div>
        <div class="message">
            <div class="title">
                {{name}} {{time|messageDate}}
            </div>
            <div class="content-wrap">
                <div class="content">
                    <MessageSection v-if="type==='text'" :data="section.data" :type="section.type" v-for="section in sections" data-message-type="text">
                    </MessageSection>
                    <img @click="imgOnClick(content)" @load="onload" v-if="type==='image'&&content" :src="content.data" class="message-image" data-message-type="image" />
                    <CodePreview v-if="type==='code'" :data="content" data-message-type="code" />
                    <FileLink v-if="type==='file'&&content" :data="content.data" :name="content.name" data-message-type="file" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import CodePreview from "./CodePreview";
import FileLink from "./FileLink";
import eventHub from '../eventHub';

function tokenMatch(content, matches) {
    const tokens = [];
    matches.forEach(function (v) {
        let result;
        while (1) {
            result = v.regexp.exec(content);
            if (!result) {
                break;
            }
            tokens.push({
                index: result.index,
                length: result[0].length,
                data: result[1] || result[0],
                type: v.type,
            })
        }
    });
    tokens.sort(function (a1, a2) {
        return a1.index > a2.index ? 1 : -1;
    });
    let result = [];
    let lastIndex = 0;
    tokens.forEach(function (v, i) {
        if (v.index > lastIndex) {
            result.push({
                type: "span",
                data: content.slice(lastIndex, v.index)
            });
        }

        lastIndex = v.index + v.length;
        result.push({
            type: v.type,
            data: v.data
        });
    });
    if (tokens.length) {
        const lastToken = tokens[tokens.length - 1];
        if (lastToken.index + lastToken.length !== tokens.length) {
            result.push({
                type: "span",
                data: content.slice(lastToken.index + lastToken.length, content.length)
            });
        }
    } else {
        result.push({
            type: "span",
            data: content
        });
    }
    return result;

}
export default {
    name: 'message',
    data() {
        return {

        }
    },
    methods: {
        onload: function () {
            eventHub.$emit("chat-room-image-onload");
        },
        imgOnClick: function (content) {
            eventHub.$emit("previewImage", content.data);
        }
    },
    mounted() { },
    props: ["name", "time", "content", "avatar", "type"],
    computed: {

        sections: function () {
            return tokenMatch(this.content, [{
                regexp: /#\(([\S]+?)\)\s?/g,
                type: "MessageTypeYellowBean"
            }]);
        }

    },
    components: {
        CodePreview,
        FileLink
    }

}

</script>
<!--
var a=/#\([\S]+?\)/g;
var b="123#(滑稽)2#(滑稽2)34";

console.log(a.exec(b))
console.log(a.exec(b))
console.log(a.exec(b))

输入： 123#(滑稽)2#(滑稽2)34 输出：[{type:"text",data:"123"},{type:"face",data:"滑稽"},{type:"text",data:"234"}]
-->
