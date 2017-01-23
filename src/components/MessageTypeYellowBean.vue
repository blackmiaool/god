<template>
    <img :src="src"></img>
</template>
<script>
    export default {
        name: 'MessageTypeYellowBean',
        data: function() {
            return {
                src: require(`assets/expressions/${this.data}.png`)
            }
        },
        props: {
            data: {
                type: String,
            }
        }
    }

</script>
