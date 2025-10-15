<template>
    <div style="display: flex;">
        <ChannelsBar @channel-selected="handleSelectChannel"></ChannelsBar>
        <ChatContainer :channel="selectedChannel"></ChatContainer>
    </div>
</template>


<script setup lang="ts">
    import ChannelsBar from 'src/components/ChannelsBar.vue'
    import ChatContainer from 'components/ChatContainer.vue'
    import { ref } from 'vue'
    import type { Channel } from 'src/utils/types.ts'

    const selectedChannel = ref<Channel | null>(null)

    function handleSelectChannel(channel: Channel) {
        selectedChannel.value = channel
    }
</script>