import type { Member, Channel, ChannelInvite } from 'src/utils/types';
import type { DialogState } from './state';
import type { dialogMutations } from './mutations';
import { Dialog } from 'quasar';

type Commit = <K extends keyof typeof dialogMutations>(
  mutation: K,
  payload?: Parameters<(typeof dialogMutations)[K]>[1],
) => void;

/**
 * Actions are async functions that commit mutations.
 * They handle business logic and side effects.
 */
export function createDialogActions(state: DialogState, commit: Commit) {
  return {
    // Member Info Dialog
    openMemberInfo(member: Member, channel: Channel) {
      commit('OPEN_MEMBER_INFO', { member, channel });
    },

    closeMemberInfo() {
      commit('CLOSE_MEMBER_INFO');
    },

    // Channel Invite Dialog
    openChannelInviteAcceptation(channelInvite: ChannelInvite) {
      commit('OPEN_CHANNEL_INVITE', channelInvite);
    },

    closeChannelInviteAcceptation() {
      commit('CLOSE_CHANNEL_INVITE');
    },

    // Member List Dialog
    openMemberList(members: Member[]) {
      console.log('ADAD');
      commit('OPEN_MEMBER_LIST', members);
    },

    closeMemberList() {
      commit('CLOSE_MEMBER_LIST');
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
  };
}
