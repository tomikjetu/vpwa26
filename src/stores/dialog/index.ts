import { defineStore } from 'pinia';
import type { Member, Channel, ChannelInvite } from 'src/utils/types';
import { Dialog } from 'quasar';
import { createInitialState, type DialogState } from './state';
import { dialogGetters } from './getters';
import { dialogMutations } from './mutations';

export type { DialogState } from './state';

export const useDialogStore = defineStore('dialogStore', {
  state: (): DialogState => createInitialState(),

  getters: dialogGetters,

  actions: {
    // Create a commit function to apply mutations
    commit<K extends keyof typeof dialogMutations>(
      this: DialogState,
      mutation: K,
      payload?: Parameters<(typeof dialogMutations)[K]>[1],
    ) {
      const mutationFn = dialogMutations[mutation] as (
        state: DialogState,
        payload?: unknown,
      ) => void;
      mutationFn(this, payload);
    },

    // Member Info Dialog
    openMemberInfo(member: Member, channel: Channel) {
      this.commit('OPEN_MEMBER_INFO', { member, channel });
    },

    closeMemberInfo() {
      this.commit('CLOSE_MEMBER_INFO');
    },

    // Channel Invite Dialog
    openChannelInviteAcceptation(channelInvite: ChannelInvite) {
      this.commit('OPEN_CHANNEL_INVITE', channelInvite);
    },

    closeChannelInviteAcceptation() {
      this.commit('CLOSE_CHANNEL_INVITE');
    },

    // Member List Dialog
    openMemberList(members: Member[]) {
      console.log('ADAD');
      this.commit('OPEN_MEMBER_LIST', members);
    },

    closeMemberList() {
      this.commit('CLOSE_MEMBER_LIST');
    },

    // Confirmation Dialog
    confirmLeaveChannel(isOwner: boolean): Promise<boolean> {
      const message = isOwner
        ? 'Are you sure you want to remove this channel permanently?'
        : 'Are you sure you want to leave this channel?';

      const title = isOwner ? 'Remove Channel' : 'Leave Channel';
      const confirmLabel = isOwner ? 'Remove' : 'Leave';

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
          .onDismiss(() => resolve(false));
      });
    },
  },
});
