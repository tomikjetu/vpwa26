<template>
    <MemberInfo v-model="dialog.showMemberInfoDialog" :member="dialog.dialogMember"></MemberInfo>

    <div style="display: flex; height: 100%">
        <ChannelsBar @channel-selected="handleSelectChannel"></ChannelsBar>
        <ChatContainer :channel="selectedChannel"></ChatContainer>
    </div>
</template>


<script setup lang="ts">
    import ChannelsBar from 'src/components/ChannelsBar.vue'
    import ChatContainer from 'components/ChatContainer.vue'
    import { ref } from 'vue'
    import type { Channel } from 'src/utils/types.ts'
    import { useDialogStore } from 'src/stores/dialog-store'
    import MemberInfo from 'src/components/MemberInfo.vue'

    const selectedChannel = ref<Channel | null>(null)

    const dialog = useDialogStore()

    function handleSelectChannel(channel: Channel) {
        selectedChannel.value = channel
    }
</script>