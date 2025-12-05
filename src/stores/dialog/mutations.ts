import type { Member, Channel, ChannelInvite } from 'src/utils/types';
import type { DialogState } from './state';

/**
 * Mutations are synchronous functions that directly modify state.
 * They should be called via commit() from actions.
 */
export const dialogMutations = {
  // Member Info Dialog
  OPEN_MEMBER_INFO(state: DialogState, payload: { member: Member; channel: Channel }) {
    state.dialogMember = payload.member;
    state.shownChannel = payload.channel;
    state.showMemberInfoDialog = true;
  },

  CLOSE_MEMBER_INFO(state: DialogState) {
    state.showMemberInfoDialog = false;
    state.dialogMember = null;
    state.shownChannel = null;
  },

  // Channel Invite Dialog
  OPEN_CHANNEL_INVITE(state: DialogState, channelInvite: ChannelInvite) {
    state.channelInvite = channelInvite;
    state.showChannelInviteAcceptation = true;
  },

  CLOSE_CHANNEL_INVITE(state: DialogState) {
    state.showChannelInviteAcceptation = false;
    state.channelInvite = null;
  },

  // Member List Dialog
  OPEN_MEMBER_LIST(state: DialogState, members: Member[]) {
    state.memberList = members;
    state.showMemberListDialog = true;
  },

  CLOSE_MEMBER_LIST(state: DialogState) {
    state.showMemberListDialog = false;
    state.memberList = null;
  },

  // Loading state
  SET_LOADING(state: DialogState, loading: boolean) {
    state.isLoading = loading;
  },

  SET_ERROR(state: DialogState, error: string | null) {
    state.error = error;
  },
};

export type DialogMutations = typeof dialogMutations;
