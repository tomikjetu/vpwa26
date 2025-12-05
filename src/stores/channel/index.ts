import { defineStore } from 'pinia';
import { createInitialState, type ChannelState } from './state';
import { channelGetters } from './getters';
import { channelMutations } from './mutations';
import { createChannelActions } from './actions';
import type { Channel, ChatMessagePayload, NotifStatus, UserStatus } from 'src/utils/types';

export type { ChannelState } from './state';

export const useChannelStore = defineStore('channels', {
  state: (): ChannelState => createInitialState(),

  getters: channelGetters,

  actions: {
    // Create a commit function to apply mutations
    commit<K extends keyof typeof channelMutations>(
      this: ChannelState,
      mutation: K,
      payload?: Parameters<(typeof channelMutations)[K]>[1],
    ) {
      const mutationFn = channelMutations[mutation] as (
        state: ChannelState,
        payload?: unknown,
      ) => void;
      mutationFn(this, payload);
    },

    // Helper to create actions with proper context
    _getActions() {
      return createChannelActions(this, this.commit.bind(this));
    },

    // === Data Loading Actions ===
    loadChannelsAndInvites() {
      this._getActions().loadChannelsAndInvites();
    },

    loadInvites() {
      this._getActions().loadInvites();
    },

    loadChannels() {
      this._getActions().loadChannels();
    },

    async loadNextMessages(channelId: number, offset: number): Promise<void> {
      return this._getActions().loadNextMessages(channelId, offset);
    },

    async loadMessages(channelId: number): Promise<void> {
      return this._getActions().loadMessages(channelId);
    },

    // === Channel Management Actions ===
    setChannels(channelList: Channel[]) {
      this._getActions().setChannels(channelList);
    },

    addChannel(channel: Channel) {
      this._getActions().addChannel(channel);
    },

    removeChannel(channelId: number) {
      this._getActions().removeChannel(channelId);
    },

    cancelChannel(channelId: number) {
      this._getActions().cancelChannel(channelId);
    },

    removeInvite(channelId: number) {
      this._getActions().removeInvite(channelId);
    },

    // === Message Actions ===
    setMessages(messagesList: ChatMessagePayload[]) {
      this._getActions().setMessages(messagesList);
    },

    addMessage(msg: ChatMessagePayload, channelId: number) {
      this._getActions().addMessage(msg, channelId);
    },

    addMessages(msgs: ChatMessagePayload[]) {
      this._getActions().addMessages(msgs);
    },

    sendMessage(msg: ChatMessagePayload, channelId: number, files: File[]) {
      this._getActions().sendMessage(msg, channelId, files);
    },

    markAsRead(channelId: number) {
      this._getActions().markAsRead(channelId);
    },

    // === Member Actions ===
    removeMember(channelId: number, memberId: number) {
      this._getActions().removeMember(channelId, memberId);
    },

    incrementKickCounter(memberId: number, channelId: number, voterId: number) {
      this._getActions().incrementKickCounter(memberId, channelId, voterId);
    },

    updateMemberStatus(userId: number, status: UserStatus) {
      this._getActions().updateMemberStatus(userId, status);
    },

    updateMemberConnection(userId: number, isConnected: boolean) {
      this._getActions().updateMemberConnection(userId, isConnected);
    },

    updateMemberState(userId: number, status: UserStatus, isConnected: boolean) {
      this._getActions().updateMemberState(userId, status, isConnected);
    },

    updateMemberTyping(channelId: number, memberId: number, text: string) {
      this._getActions().updateMemberTyping(channelId, memberId, text);
    },

    // === Notification Actions ===
    setUpdateStatus(channelId: number, notifStatus: NotifStatus) {
      this._getActions().setUpdateStatus(channelId, notifStatus);
    },

    // === Typing Actions ===
    sendTypingAction(channelId: number, message: string) {
      this._getActions().sendTypingAction(channelId, message);
    },

    // === Pagination Actions ===
    fetchOlderMessages(channelId: number): { older: ChatMessagePayload[]; remaining: number } {
      return this._getActions().fetchOlderMessages(channelId);
    },

    // === Async Actions with Loading State ===
    createChannelAction(name: string, isPrivate: boolean) {
      this._getActions().createChannelAction(name, isPrivate);
    },

    joinChannelAction(channelName: string) {
      this._getActions().joinChannelAction(channelName);
    },

    quitChannelAction(channelId: number) {
      this._getActions().quitChannelAction(channelId);
    },

    revokeUserAction(channelId: number, userId: number) {
      this._getActions().revokeUserAction(channelId, userId);
    },

    inviteUserAction(channelId: number, nickname: string) {
      this._getActions().inviteUserAction(channelId, nickname);
    },

    cancelChannelAction(channelId: number) {
      this._getActions().cancelChannelAction(channelId);
    },

    kickMemberAction(channelId: number, memberId: number) {
      this._getActions().kickMemberAction(channelId, memberId);
    },

    acceptChannelInviteAction(channelId: number) {
      this._getActions().acceptChannelInviteAction(channelId);
    },

    declineChannelInviteAction(channelId: number) {
      this._getActions().declineChannelInviteAction(channelId);
    },

    updateNotifStatusAction(channelId: number, notifStatus: NotifStatus) {
      this._getActions().updateNotifStatusAction(channelId, notifStatus);
    },

    listMembersAction(channelId: number) {
      this._getActions().listMembersAction(channelId);
    },
  },
});
