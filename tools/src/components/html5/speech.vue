<template>
    <div>
        <el-input v-model="text" />
        <el-button @click="speechSynthesis">play</el-button>
    </div>
</template>
<script>
export default {
    data() {
        return {
            text: ''
        }
    },
    methods: {
        speechSynthesis() {
            var speechSynthesis = window.speechSynthesis;
            
            var utterance = new SpeechSynthesisUtterance();
            utterance.text = this.text;
            
            speechSynthesis.speak(utterance);
        },
    }
}
</script>