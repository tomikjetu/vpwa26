import { defineStore } from 'pinia'
import type { Member } from 'src/utils/types'
import { ref } from 'vue'

export const useDialogStore = defineStore('dialogStore', () => {
    
  const showMemberInfoDialog = ref(false)

  const dialogMember = ref<Member | null>(null)

  /** Open the Member Info dialog with the given member */
  function openMemberInfo(member: Member) {
    dialogMember.value = member
    showMemberInfoDialog.value = true
  }

  /** Close the Member Info dialog */
  function closeMemberInfo() {
    showMemberInfoDialog.value = false
    dialogMember.value = null
  }

  return {
    // state
    showMemberInfoDialog,
    dialogMember,

    // actions
    openMemberInfo,
    closeMemberInfo
  }
})