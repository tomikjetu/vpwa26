import type { DialogState } from './state';

export const dialogGetters = {
  currentChannelName: (state: DialogState) => state.shownChannel?.name ?? '',

  isMemberInfoVisible: (state: DialogState) => state.showMemberInfoDialog,

  isChannelInviteVisible: (state: DialogState) => state.showChannelInviteAcceptation,

  isMemberListVisible: (state: DialogState) => state.showMemberListDialog,

  getLoading: (state: DialogState) => state.isLoading,

  getError: (state: DialogState) => state.error,
};
