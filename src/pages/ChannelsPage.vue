<template>
    <MemberInfo v-model="dialog.showMemberInfoDialog" :member="dialog.dialogMember" :channel-id="dialog.shownChannel ? dialog.shownChannel.id : null"></MemberInfo>

    <div style="display: flex; height: 100%">
        <ChannelsBar></ChannelsBar>
        <ChatContainer></ChatContainer>
    </div>
</template>


<script setup lang="ts">
    import ChannelsBar from 'src/components/ChannelsBar.vue'
    import ChatContainer from 'components/ChatContainer.vue'
    import { useDialogStore } from 'src/stores/dialog-store'
    import MemberInfo from 'src/components/MemberInfo.vue'

    const dialog = useDialogStore()
</script>