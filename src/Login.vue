<template>
    <div class="login-page">
        <LeftTabs/>
        <main>          
           <div class="login-panel deep-panel">
               <div>
                    <label for=""></label>
                    <input class="deep-input" type="text">
                </div>    
                <div>
                    <label for=""></label>
                    <input class="deep-input" type="text">
                </div>  
           </div>
              
        </main>
        <header></header>
    </div>
</template>

<script>
    import LeftTabs from './components/LeftTabs';


    const socket = window.io(':9012');

    export default {
        name: 'app',
        mounted() {

        },
        data() {
            return {

            }
        },
        methods: {

        },
        components: {
            LeftTabs

        },
    }
</script>