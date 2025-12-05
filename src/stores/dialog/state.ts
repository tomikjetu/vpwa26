import type { Member, Channel, ChannelInvite } from 'src/utils/types';

export interface DialogState {
  // Member info dialog
  showMemberInfoDialog: boolean;
  dialogMember: Member | null;
  shownChannel: Channel | null;

  // Channel invite dialog
  showChannelInviteAcceptation: boolean;
  channelInvite: ChannelInvite | null;

  // Member list dialog
  showMemberListDialog: boolean;
  memberList: Member[] | null;

  // Loading state
  isLoading: boolean;
  error: string | null;
}

export const createInitialState = (): DialogState => ({
  showMemberInfoDialog: false,
  dialogMember: null,
  shownChannel: null,
  showChannelInviteAcceptation: false,
  channelInvite: null,
  showMemberListDialog: false,
  memberList: null,
  isLoading: false,
  error: null,
});
