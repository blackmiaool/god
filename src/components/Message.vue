<template>
    <div class="message-wrap">
        <div class="avatar">
           <div class="avatar-img" :style="{'background-image':'url('+avatar+')'}"></div>
<!--            <img :src="avatar" alt="">-->
        </div>
        <div class="message">
            <div class="title">
                {{name}} {{time}}
            </div>
            <div class="content-wrap">
                <div class="content">
                    <p>{{content}}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'message',
        data() {
            return {

            }
        },
        props: ["name", "time", "content", "avatar"]
    }

</script>
