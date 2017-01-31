<script>
    import Vue from 'vue';
    import MessageTypeYellowBean from './MessageTypeYellowBean';
    var getChildrenTextContent = function (children) {
        return children.map(function (node) {
            return node.children ?
                getChildrenTextContent(node.children) :
                node.text
        }).join('')
    }
    Vue.component('MessageSection', {
        name: 'message-section',
        render(createElement) {
            // create kebabCase id

            // var headingId = getChildrenTextContent(this.$slots.default) // .toLowerCase() // .replace(/\W+/g, '-') // .replace(/(^\-|\-$)/g, '')

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