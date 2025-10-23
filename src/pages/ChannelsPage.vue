<template>
    <MemberInfo v-model="dialog.showMemberInfoDialog" :member="dialog.dialogMember" :channel-id="dialog.shownChannel ? dialog.shownChannel.id : null"></MemberInfo>
    <ChannelInviteAccept v-model="dialog.showChannelInviteAcceptation" ></ChannelInviteAccept>

    <div style="display: flex; height: 100%">
        <ChannelsBar></ChannelsBar>
        <ChatContainer></ChatContainer>
    </div>
</template>


<script setup lang="ts">
    import ChannelsBar from 'src/components/Channels/ChannelsBar.vue'
    import ChatContainer from 'src/components/Chat/ChatContainer.vue'
    import { useDialogStore } from 'src/stores/dialog-store'
    import MemberInfo from 'src/components/Dialog/MemberInfo.vue'
    import ChannelInviteAccept from 'src/components/Dialog/ChannelInviteAccept.vue'

    const dialog = useDialogStore()
</script>