<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 400px; max-width: 500px;">
      <!-- Header Section -->
      <q-card-section class="row items-center justify-between">
        <div class="row items-center">
          <q-icon name="person" size="md" class="q-mr-sm" />
          <div class="text-h6">{{ member ? member.nickname : '' }}</div>
        </div>

        <!-- Right side: owner or vote count -->
        <div class="row items-center">
          <template v-if="member && getCurrentUser && (member.isOwner || getCurrentUser.id === member.userId)">
            <q-icon name="star" color="amber" class="q-mr-xs" />
            <span class="text-subtitle2 text-bold">
              {{ member.isOwner ? 'Owner' : 'You' }}
            </span>
          </template>

          <template v-else>
            <div class="row items-center">
              <span class="text-subtitle2 text-grey-8">
                {{ (hasVoted ? 'Voted: ' : 'Vote to kick: ') + (props.member?.kickVotes ?? 0) + ' / 3' }}
              </span>
              <q-btn :disable="hasVoted" flat
                dense round icon="person_off" color="red" size="sm"
                :class="'q-ml-sm ' + (hasVoted ? 'disabled-btn' : '')"
                @click="confirmKickVote" />
            </div>
          </template>
        </div>
      </q-card-section>

      <!-- Typing Section -->
      <q-card-section>
        <div class="text-subtitle2 text-grey-8 q-mb-xs">
          Currently being typed by user:
        </div>

        <div class="typing-box" :class="{
          'text-grey-6':
            member && (!member.currentlyTyping || member.currentlyTyping.trim() === '')
        }">
          {{
            member && member.currentlyTyping && member.currentlyTyping.trim() !== ''
              ? member.currentlyTyping
              : 'User is currently not typing'
          }}
        </div>
      </q-card-section>

      <!-- Actions -->
      <q-card-actions align="right">
        <q-btn flat label="Close" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { defineProps, defineModel, computed } from 'vue'
import { useQuasar } from 'quasar'
import type { Member } from 'src/utils/types'
import { useChannelStore } from 'src/stores/channelStore';
import { storeToRefs } from 'pinia'
import { useAuthStore } from 'src/stores/auth-store'

const authStore = useAuthStore()
const { getCurrentUser } = storeToRefs(authStore)

const $q = useQuasar()
const show = defineModel<boolean>('modelValue', { required: true })

const channelStore = useChannelStore()

const hasVoted = computed(() => {
  const user = getCurrentUser.value
  const channelId = props.channelId
  const m = props.member

  if (!user || !channelId || !m) {
    return false
  }

  const actingMember = channelStore.getMemberByUserId(user.id, channelId)
  if (!actingMember) {
    return false
  }

  return m.receivedKickVotes?.includes(actingMember.id)
})

const props = defineProps<{
  member: Member | null
  channelId: number | null
}>()

/** Ask for confirmation before voting to kick */
function confirmKickVote() {
  if (!props.member) return

  $q.dialog({
    title: 'Confirm Kick Vote',
    message: `Are you sure you want to vote to kick <strong>${props.member.nickname}</strong>?<br><br>
    It takes <strong>3 votes</strong> for a member to be kicked out.`,
    html: true,
    persistent: true,
    ok: {
      label: 'Yes, Vote to Kick',
      color: 'red'
    },
    cancel: {
      label: 'Cancel',
      color: 'grey'
    }
  }).onOk(() => {
    if (!props.member || !props.channelId || !getCurrentUser.value) return
    //channelStore.incrementKickCounter(props.member.id, props.channelId, getCurrentUser.value.id)
    channelStore.kickMemberAction(props.channelId, props.member.id)
  })
}
</script>

<style scoped>
.typing-box {
  min-height: 80px;
  border: 1px solid #bfbfbf;
  border-radius: 6px;
  padding: 8px 10px;
  background-color: #fafafa;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 15px;
}

.body--dark .typing-box {
  background-color: #2a2a2a;
  border-color: #444;
}

.text-grey-6 {
  color: #9e9e9e;
}

.disabled-btn {
  opacity: 0.4 !important;
  filter: grayscale(50%);
}
</style>
