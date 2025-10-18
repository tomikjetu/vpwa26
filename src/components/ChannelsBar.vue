<template>
  <q-page class="channels-bar-container">

    <q-input square filled v-model="search" label="Search" type="text" clearable debounce="300"
      class="flat-top q-mt-md q-mb-md channels-search-input">
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-input>

    <div class="channels-list-container">
      <template v-if="showMembersList">
        <MembersList :channel="memberListChannel" :members="membersListContent" @cancel="handleCancelMembersList"></MembersList>
      </template>

      <template v-else-if="(search ?? '').trim() !== ''">
        <AllChannelList
          :channels="filteredAll"
          @select-channel="handleSelectChannel" 
          @show-members="handleShowMembers"/>
      </template>

      <template v-else>
        <JoinedChannelList :channels="channelStore.getJoinedChannels" @select-channel="handleSelectChannel" @show-members="handleShowMembers"></JoinedChannelList>
        <OwnedChannelList :channels="channelStore.getOwnedChannels" @select-channel="handleSelectChannel" @show-members="handleShowMembers"></OwnedChannelList>
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useChannelStore } from 'src/stores/channelStore'
import AllChannelList from './AllChannelList.vue'
import JoinedChannelList from './JoinedChannelList.vue'
import OwnedChannelList from './OwnedChannelList.vue'
import type { Channel } from 'src/utils/types.ts'
import MembersList from './MembersList.vue'
import type { Member } from 'src/utils/types.ts'
import { useChatStore } from 'src/stores/chat-store'

const chatStore = useChatStore()
const search = ref('')
const channelStore = useChannelStore()
const showMembersList = ref(false)
const memberListChannel = ref<Channel | undefined>()

// Merge and filter lists when searching 
const filteredAll = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return channelStore.channels

  // Adjust these field names to match your Channel type
  return channelStore.channels.filter((channel: Channel) =>
    channel.name.toLowerCase().includes(term) ||
    (channel.description?.toLowerCase().includes(term) ?? false)
  )
})

function handleSelectChannel(channel: Channel) {
  if(chatStore.channel) {
    channelStore.markAsRead(chatStore.channel.id)
  }
  chatStore.openChat(channel)
}

const membersListContent = ref<Member[]>([])

function handleShowMembers(channel: Channel) {
  showMembersList.value = true
  membersListContent.value = Object.values(channel.members)
  memberListChannel.value = channel
}

function handleCancelMembersList() {
  showMembersList.value = false
}
</script>



<style scoped>
.channels-bar-container {
  border-right: 1px solid rgb(195, 195, 195);
  display: flex;
  flex-direction: column;
}

.channels-search-input {
  width: 350px;
  flex: 0 0 auto;
}

.channels-list-container {
  width: 350px;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
}
</style>
