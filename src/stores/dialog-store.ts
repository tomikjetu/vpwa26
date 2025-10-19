import { defineStore } from 'pinia'
import type { Member, Channel } from 'src/utils/types'
import { Dialog } from 'quasar'

export const useDialogStore = defineStore('dialogStore', {

  state: () => ({
    // Member info dialog
    showMemberInfoDialog: false as boolean,
    dialogMember: null as Member | null,
    shownChannel: null as Channel | null,
  }),

  getters: {
    currentChannelName: (state) => state.shownChannel?.name ?? ''
  },

  actions: {
    /** Open the Member Info dialog with the given member and channel */
    openMemberInfo(member: Member, channel: Channel) {
      this.dialogMember = member
      this.shownChannel = channel
      this.showMemberInfoDialog = true
    },

    /** Close the Member Info dialog */
    closeMemberInfo() {
      this.showMemberInfoDialog = false
      this.dialogMember = null
      this.shownChannel = null
    },

    confirmLeaveChannel(isOwner: boolean): Promise<boolean> {
      const message = isOwner
        ? 'Are you sure you want to remove this channel permanently?'
        : 'Are you sure you want to leave this channel?'

      const title = isOwner ? 'Remove Channel' : 'Leave Channel'
      const confirmLabel = isOwner ? 'Remove' : 'Leave'

      return new Promise((resolve) => {
        Dialog.create({
          title,
          message,
          persistent: true,
          ok: {
            label: confirmLabel,
            color: 'negative',
          },
          cancel: { label: 'Cancel' },
        })
          .onOk(() => resolve(true))
          .onCancel(() => resolve(false))
          .onDismiss(() => resolve(false))
      })
    }
  }
})