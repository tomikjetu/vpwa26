import type { Channel, ChatMessagePayload, ChannelInvite } from 'src/utils/types';

export interface ChannelState {
  channels: Channel[];
  channelInvites: ChannelInvite[];
  messages: ChatMessagePayload[];
  unreadMessages: ChatMessagePayload[];
  olderPagesLeft: Record<number, number>;
  isLoading: boolean;
  error: string | null;
  _pendingResolve: null | (() => void);
}

export const createInitialState = (): ChannelState => ({
  channels: [],
  channelInvites: [],
  messages: [],
  unreadMessages: [],
  olderPagesLeft: {},
  isLoading: false,
  error: null,
  _pendingResolve: null,
});
