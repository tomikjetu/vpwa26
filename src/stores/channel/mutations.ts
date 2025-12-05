import type {
  Channel,
  ChatMessagePayload,
  ChannelInvite,
  NotifStatus,
  UserStatus,
} from 'src/utils/types';
import type { ChannelState } from './state';

/**
 * Mutations are synchronous functions that directly modify state.
 * They should be called via commit() from actions.
 */
export const channelMutations = {
  SET_CHANNELS(state: ChannelState, channels: Channel[]) {
    state.channels = channels;
  },

  ADD_CHANNEL(state: ChannelState, channel: Channel) {
    if (!state.channels.find((c) => c.id === channel.id)) {
      state.channels.push(channel);
    }
  },

  REMOVE_CHANNEL(state: ChannelState, channelId: number) {
    state.channels = state.channels.filter((c) => c.id !== channelId);
  },

  SET_CHANNEL_INVITES(state: ChannelState, invites: ChannelInvite[]) {
    state.channelInvites = invites;
  },

  ADD_CHANNEL_INVITE(state: ChannelState, invite: ChannelInvite) {
    if (!state.channelInvites.find((i) => i.id === invite.id)) {
      state.channelInvites.push(invite);
    }
  },

  REMOVE_CHANNEL_INVITE(state: ChannelState, channelId: number) {
    state.channelInvites = state.channelInvites.filter((invite) => invite.channelId !== channelId);
  },

  SET_MESSAGES(state: ChannelState, messages: ChatMessagePayload[]) {
    state.messages = messages;
  },

  ADD_MESSAGE(state: ChannelState, message: ChatMessagePayload) {
    state.messages.push(message);
  },

  ADD_MESSAGES(state: ChannelState, messages: ChatMessagePayload[]) {
    state.messages.push(...messages);
  },

  SET_UNREAD_MESSAGES(state: ChannelState, messages: ChatMessagePayload[]) {
    state.unreadMessages = messages;
  },

  ADD_UNREAD_MESSAGE(state: ChannelState, message: ChatMessagePayload) {
    state.unreadMessages.push(message);
  },

  MARK_CHANNEL_READ(state: ChannelState, channelId: number) {
    // Move unread messages to read messages
    state.messages.push(...state.unreadMessages);
    state.unreadMessages.length = 0;

    // Mark channel as read
    const channel = state.channels.find((c) => c.id === channelId);
    if (channel) {
      channel.hasUnreadMsgs = false;
    }
  },

  SET_CHANNEL_HAS_UNREAD(state: ChannelState, payload: { channelId: number; hasUnread: boolean }) {
    const channel = state.channels.find((c) => c.id === payload.channelId);
    if (channel) {
      channel.hasUnreadMsgs = payload.hasUnread;
    }
  },

  UPDATE_NOTIF_STATUS(
    state: ChannelState,
    payload: { channelId: number; notifStatus: NotifStatus },
  ) {
    const channel = state.channels.find((c) => c.id === payload.channelId);
    if (channel) {
      channel.notifStatus = payload.notifStatus;
    }
  },

  REMOVE_MEMBER(state: ChannelState, payload: { channelId: number; memberId: number }) {
    const channel = state.channels.find((c) => c.id === payload.channelId);
    if (channel) {
      delete channel.members[payload.memberId];
    }
  },

  INCREMENT_KICK_COUNTER(
    state: ChannelState,
    payload: { channelId: number; memberId: number; voterId: number },
  ) {
    const channel = state.channels.find((c) => c.id === payload.channelId);
    if (!channel) return;

    const targetMember = channel.members[payload.memberId];
    if (!targetMember) return;

    targetMember.kickVotes += 1;
    targetMember.receivedKickVotes.push(payload.voterId);
  },

  UPDATE_MEMBER_STATUS(state: ChannelState, payload: { userId: number; status: UserStatus }) {
    for (const channel of state.channels) {
      for (const memberId of Object.keys(channel.members)) {
        const member = channel.members[Number(memberId)];
        if (member && member.userId === payload.userId) {
          member.status = payload.status;
        }
      }
    }
  },

  UPDATE_MEMBER_CONNECTION(state: ChannelState, payload: { userId: number; isConnected: boolean }) {
    for (const channel of state.channels) {
      for (const memberId of Object.keys(channel.members)) {
        const member = channel.members[Number(memberId)];
        if (member && member.userId === payload.userId) {
          member.isConnected = payload.isConnected;
        }
      }
    }
  },

  UPDATE_MEMBER_STATE(
    state: ChannelState,
    payload: { userId: number; status: UserStatus; isConnected: boolean },
  ) {
    for (const channel of state.channels) {
      for (const memberId of Object.keys(channel.members)) {
        const member = channel.members[Number(memberId)];
        if (member && member.userId === payload.userId) {
          member.status = payload.status;
          member.isConnected = payload.isConnected;
        }
      }
    }
  },

  UPDATE_MEMBER_TYPING(
    state: ChannelState,
    payload: { channelId: number; memberId: number; text: string },
  ) {
    const channel = state.channels.find((c) => c.id === payload.channelId);
    if (!channel) return;

    const member = channel.members[payload.memberId];
    if (member) {
      member.currentlyTyping = payload.text;
    }
  },

  SET_OLDER_PAGES_LEFT(state: ChannelState, payload: { channelId: number; count: number }) {
    state.olderPagesLeft[payload.channelId] = payload.count;
  },

  SET_LOADING(state: ChannelState, loading: boolean) {
    state.isLoading = loading;
  },

  SET_ERROR(state: ChannelState, error: string | null) {
    state.error = error;
  },

  SET_PENDING_RESOLVE(state: ChannelState, resolve: (() => void) | null) {
    state._pendingResolve = resolve;
  },

  RESOLVE_PENDING(state: ChannelState) {
    if (state._pendingResolve) {
      state._pendingResolve();
      state._pendingResolve = null;
    }
  },
};

export type ChannelMutations = typeof channelMutations;
