<script>
    import Vue from 'vue';
    import MessageTypeYellowBean from './MessageTypeYellowBean';
    var getChildrenTextContent = function(children) {
        return children.map(function(node) {
            return node.children ?
                getChildrenTextContent(node.children) :
                node.text
        }).join('')
    }
    Vue.component('MessageSection', {
        name: 'message-section',
        render(createElement) {
            // create kebabCase id
            console.log(this.$slots)
                // var headingId = getChildrenTextContent(this.$slots.default) // .toLowerCase() // .replace(/\W+/g, '-') // .replace(/(^\-|\-$)/g, '')
            console.log(this.data)
            if (this.type === "span") {
                return createElement(
                    this.type, this.data);
            }
            return createElement(
                this.type, {
                    attrs: {
                        data: this.data
                    }
                }
            )
        },
        props: {
            type: {
                type: String,
                required: true
            },
            data: {
                type: String,
            }
        },
        components: {
            MessageTypeYellowBean
        }
    });

</script>
