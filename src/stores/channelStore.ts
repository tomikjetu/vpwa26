import { defineStore } from 'pinia';
import type { Channel, ChatMessagePayload, ChannelInvite, NotifStatus } from 'src/utils/types';
import { useAuthStore } from 'src/stores/auth-store';
import { Notify } from 'quasar';
import { channelService } from 'src/services/channelService';
import { useChatStore } from './chat-store';
import { useDialogStore } from './dialog-store';

interface ChannelState {
  channels: Channel[];
  channelInvites: ChannelInvite[];
  messages: ChatMessagePayload[];
  unreadMessages: ChatMessagePayload[];
  olderPagesLeft: Record<number, number>;
  isLoading: boolean;
  error: string | null;
  _pendingResolve: null | (() => void),
}

export const useChannelStore = defineStore('channels', {
  state: (): ChannelState => {
    return {
      channels: [] as Channel[],
      channelInvites: [] as ChannelInvite[],
      messages: [] as ChatMessagePayload[],
      unreadMessages: [] as ChatMessagePayload[],
      olderPagesLeft: {} as Record<number, number>,
      isLoading: false,
      error: null,
      _pendingResolve: null as null | (() => void),
    };
  },

  actions: {
    loadChannelsAndInvites() {
      this.loadInvites()
      this.loadChannels()
    },

    loadInvites() {
      channelService.listChannelInvites()
    },

    loadChannels() {
      channelService.listChannels()
    },

    async loadNextMessages(channelId: number, offset: number) {
      // So the scrollbar works
      return new Promise<void>((resolve) => {
        this._pendingResolve = resolve
        channelService.listMessages(channelId, offset)
      })
    },

    async loadMessages(channelId: number) {
      this.setMessages([])
      await this.loadNextMessages(channelId, 0)
      console.log("msg:list:load")
    },

    removeInvite(channelId: number) {
      this.channelInvites = this.channelInvites.filter((invite) => invite.channelId!== channelId);
    },

    addChannel(channel: Channel) {
      if (!this.channels.find((c) => c.id === channel.id)) {
        this.channels.push(channel);
      }
    },

    setChannels(channelList: Channel[]) {
      this.channels = channelList;
    },

    setMessages(messagesList: ChatMessagePayload[]) {
      this.messages = messagesList;
    },

    removeChannel(channelId: number) {
      this.channels = this.channels.filter((c) => c.id !== channelId);
      console.log(this.channels)
    },

    cancelChannel(channelId: number) {
      const chatStore = useChatStore()
      if(chatStore.channel && chatStore.channel.id == channelId) 
        chatStore.closeChat()
      this.channels = this.channels.filter((c) => c.id !== channelId);
    },

    removeMember(channelId: number, memberId: number) {
      const channel = this.getChannelById(channelId)
      if(!channel) return
      delete channel.members[memberId]

      const dialogStore = useDialogStore()
      if(dialogStore.dialogMember && dialogStore.dialogMember.id == memberId) {
        dialogStore.closeMemberInfo()
      }
    },

    setUpdateStatus(channelId: number, notifStatus: NotifStatus) {
      const channel = this.getChannelById(channelId)
      if(!channel) return
      channel.notifStatus = notifStatus
    },

    sendMessage(msg: ChatMessagePayload, channelId: number, files: File[]) {

      channelService.sendMessage(channelId, msg.text, files)
    },

    addMessage(msg: ChatMessagePayload, channelId: number) {
      this.markAsRead(channelId);
      this.messages.push(msg);
    },

    addMessages(msgs: ChatMessagePayload[]) {
      this.messages.push(...msgs);
    },

    markAsRead(channelId: number) {
      const msgs = this.getMessages();
      const unreadMsgs = this.getUnreadMessages();
      if (!msgs || !unreadMsgs) return;

      msgs.push(...unreadMsgs);
      unreadMsgs.length = 0;

      const channel = this.getChannelById(channelId);
      if (!channel) return;
      channel.hasUnreadMsgs = false;
    },

    incrementKickCounter(memberId: number, channelId: number, voterId: number) {
      const channel = this.getChannelById(channelId);
      if (!channel || !memberId) return;

      const targetMember = channel.members[memberId];
      if (!targetMember) return;
      if (targetMember.id === channel.ownerId)
        return Notify.create({
          type: 'negative',
          message: 'Cannot kick the channel owner',
          position: 'top',
        });
      targetMember.kickVotes += 1;

      targetMember.receivedKickVotes.push(voterId);
      Notify.create({
        type: 'info',
        message: `You have voted to kick ${targetMember.nickname} from ${channel.name}. Total votes: ${targetMember.kickVotes}`,
        position: 'top',
      });
    },

    fetchOlderMessages(channelId: number): { older: ChatMessagePayload[]; remaining: number } {

      this.messages = [];

      // For now, return empty - backend should provide pagination
      // This can be implemented when backend supports message history pagination
      this.olderPagesLeft[channelId] = 0;
      return { older: [] as ChatMessagePayload[], remaining: 0 };
    },

    /**
     * Update a member's typing text for a specific channel.
     * Pass an empty string to clear the indicator.
     */
    updateMemberTyping(channelId: number, memberId: number, text: string) {
      const channel = this.getChannelById(channelId);
      if (!channel) return;
      const member = channel.members[memberId];
      if (!member) return;
      member.currentlyTyping = text;
    },

    // === Async Actions coordinating with channelService ===
    // Note: Socket operations don't return data immediately - they trigger socket events
    // that are handled by socketService listeners which update the store reactively
    // Server pushes all channel data via socket events - no HTTP polling needed

    createChannelAction(name: string, isPrivate: boolean) {
      this.isLoading = true;
      this.error = null;
      try {
        channelService.createChannel(name, isPrivate);
        // Channel will be added via socket event 'channel:created'
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    joinChannelAction(channelName: string) {
      this.isLoading = true;
      this.error = null;
      try {
        channelService.joinChannel(channelName);
        // Channel will be added via socket event 'channel:joined'
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    quitChannelAction(channelId: number) {
      this.isLoading = true;
      this.error = null;
      console.log("QUIT CHANNEL ACTION")
      try {
        channelService.quitChannel(channelId);
        // Channel will be removed via socket event 'channel:left'
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    revokeUserAction(channelId: number, userId: number) {
      this.isLoading = true;
      this.error = null;
      try {
        channelService.revokeUserFromChannel(channelId, userId);
        // User will be removed via socket event 'member:left'
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    inviteUserAction(channelId: number, nickname: string) {
      this.isLoading = true;
      this.error = null;
      try {
        channelService.inviteUserToChannel(channelId, nickname);
        // Invite will be sent via socket event
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    cancelChannelAction(channelId: number) {
      this.isLoading = true;
      this.error = null;
      try {
        channelService.cancelChannel(channelId);
        // Channel will be removed via socket event 'channel:deleted'
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    kickMemberAction(channelId: number, memberId: number) {
      this.isLoading = true;
      this.error = null;
      try {
        channelService.kickMemberFromChannel(channelId, memberId);
        // Increment kick counter via socket event
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    acceptChannelInviteAction(channelId: number) {
      this.isLoading = true;
      this.error = null;
      try {
        channelService.acceptChannelInvite(channelId);
        // Channel will be added and invite removed via socket event 'channel:invite:accepted'
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    declineChannelInviteAction(channelId: number) {
      this.isLoading = true;
      this.error = null;
      try {
        channelService.declineChannelInvite(channelId);
        // Invite will be removed via socket event 'channel:invite:declined'
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    updateNotifStatusAction(channelId: number, notifStatus: NotifStatus) {
      channelService.updateNotifStatus(channelId, notifStatus)
    }
  },

  getters: {

    getChannelById: (state) => {
      return (id: number) => state.channels.find((c) => c.id === id);
    },
    getOwnedChannels: (state) => {
      const auth = useAuthStore();
      const user = auth.getCurrentUser;
      return state.channels.filter((c) => c.ownerId === user?.id);
    },
    getJoinedChannels: (state) => {
      const auth = useAuthStore();
      const user = auth.getCurrentUser;
      return state.channels.filter((c) => c.ownerId !== user?.id);
    },
    totalChannels: (state) => state.channels.length,
    getMessages: (state) => {
      return () => state.messages || [];
    },
    getUnreadMessages: (state) => {
      return () => state.unreadMessages || [];
    },
    getMemberById: (state) => {
      return (id: number, channelId: number) => { return state.channels.find((c) => c.id === channelId)?.members[id] }
    },
    getMemberByUserId: (state) => {
      return (userId: number, channelId: number) => {
        const channel = state.channels.find((c) => c.id === channelId)
        if (!channel) return undefined

        return Object.values(channel.members).find(m => m.userId === userId)
      }
    },
    getChannelInviteById: (state) => {
      return (id: number) => state.channelInvites.find((c) => c.id === id);
    },
    hasMoreOlder: (state) => {
      return (channelId: number) => {
        // Backend pagination not implemented yet
        const left = state.olderPagesLeft[channelId];
        return (typeof left === 'number' ? left : 0) > 0;
      };
    },
    getLoading: (state) => state.isLoading,
    getError: (state) => state.error,
  },
});
