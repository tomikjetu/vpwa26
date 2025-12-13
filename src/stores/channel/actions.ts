import type { Channel, ChatMessagePayload, NotifStatus, UserStatus } from 'src/utils/types';
import { channelService } from 'src/services/channelService';
import { Notify } from 'quasar';
import type { ChannelState } from './state';
import type { channelMutations } from './mutations';
import { useChatStore } from 'src/stores/chat';
import { useDialogStore } from 'src/stores/dialog';

type Commit = <K extends keyof typeof channelMutations>(
  mutation: K,
  payload?: Parameters<(typeof channelMutations)[K]>[1],
) => void;

/**
 * Actions are async functions that commit mutations.
 * They handle business logic and side effects.
 */
export function createChannelActions(state: ChannelState, commit: Commit) {
  // Helper to get channel by ID from current state
  const getChannelById = (id: number) => state.channels.find((c) => c.id === id);

  return {
    // === Data Loading Actions ===
    loadChannelsAndInvites() {
      this.loadInvites();
      this.loadChannels();
    },

    loadInvites() {
      channelService.listChannelInvites();
    },

    loadChannels() {
      channelService.listChannels();
    },

    async loadNextMessages(channelId: number, offset: number): Promise<void> {
      return new Promise<void>((resolve) => {
        commit('SET_PENDING_RESOLVE', resolve);
        channelService.listMessages(channelId, offset);
      });
    },

    async loadMessages(channelId: number): Promise<void> {
      commit('SET_MESSAGES', []);
      await this.loadNextMessages(channelId, 0);
      console.log('msg:list:load');
    },

    // === Channel Management Actions ===
    setChannels(channelList: Channel[]) {
      commit('SET_CHANNELS', channelList);
    },

    addChannel(channel: Channel) {
      commit('ADD_CHANNEL', channel);
    },

    removeChannel(channelId: number) {
      commit('REMOVE_CHANNEL', channelId);
    },

    cancelChannel(channelId: number) {
      const chatStore = useChatStore();
      if (chatStore.channel && chatStore.channel.id == channelId) {
        chatStore.closeChat();
      }
      commit('REMOVE_CHANNEL', channelId);
    },

    removeInvite(channelId: number) {
      commit('REMOVE_CHANNEL_INVITE', channelId);
    },

    // === Message Actions ===
    setMessages(messagesList: ChatMessagePayload[]) {
      commit('SET_MESSAGES', messagesList);
    },

    addMessage(msg: ChatMessagePayload, channelId: number) {
      this.markAsRead(channelId);
      commit('ADD_MESSAGE', msg);
    },

    addMessages(msgs: ChatMessagePayload[]) {
      commit('ADD_MESSAGES', msgs);
    },

    sendMessage(msg: ChatMessagePayload, channelId: number, files: File[]) {
      channelService.sendMessage(channelId, msg.text, files);

      //await channelService.uploadFiles(files, channelId)
    },

    markAsRead(channelId: number) {
      commit('MARK_CHANNEL_READ', channelId);
    },

    // === Member Actions ===
    removeMember(channelId: number, memberId: number) {
      commit('REMOVE_MEMBER', { channelId, memberId });

      const dialogStore = useDialogStore();
      if (dialogStore.dialogMember && dialogStore.dialogMember.id == memberId) {
        dialogStore.closeMemberInfo();
      }
    },

    incrementKickCounter(memberId: number, channelId: number, voterId: number) {
      const channel = getChannelById(channelId);
      if (!channel || !memberId) return;

      const targetMember = channel.members[memberId];
      if (!targetMember) return;

      if (targetMember.id === channel.ownerId) {
        Notify.create({
          type: 'negative',
          message: 'Cannot kick the channel owner',
          position: 'top',
        });
        return;
      }

      commit('INCREMENT_KICK_COUNTER', { channelId, memberId, voterId });

      Notify.create({
        type: 'info',
        message: `You have voted to kick ${targetMember.nickname} from ${channel.name}. Total votes: ${targetMember.kickVotes + 1}`,
        position: 'top',
      });
    },

    updateMemberStatus(userId: number, status: UserStatus) {
      commit('UPDATE_MEMBER_STATUS', { userId, status });
    },

    updateMemberConnection(userId: number, isConnected: boolean) {
      commit('UPDATE_MEMBER_CONNECTION', { userId, isConnected });
    },

    updateMemberState(userId: number, status: UserStatus, isConnected: boolean) {
      commit('UPDATE_MEMBER_STATE', { userId, status, isConnected });
    },

    updateMemberTyping(channelId: number, memberId: number, text: string) {
      commit('UPDATE_MEMBER_TYPING', { channelId, memberId, text });
    },

    // === Notification Actions ===
    setUpdateStatus(channelId: number, notifStatus: NotifStatus) {
      commit('UPDATE_NOTIF_STATUS', { channelId, notifStatus });
    },

    // === Typing Actions ===
    sendTypingAction(channelId: number, message: string) {
      channelService.sendTyping(channelId, message);
    },

    // === Pagination Actions ===
    fetchOlderMessages(channelId: number): { older: ChatMessagePayload[]; remaining: number } {
      commit('SET_MESSAGES', []);
      commit('SET_OLDER_PAGES_LEFT', { channelId, count: 0 });
      return { older: [] as ChatMessagePayload[], remaining: 0 };
    },

    // === Async Actions with Loading State ===
    createChannelAction(name: string, isPrivate: boolean) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        channelService.createChannel(name, isPrivate);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        commit('SET_ERROR', errorMessage);
        throw err;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    joinChannelAction(channelName: string) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        channelService.joinChannel(channelName);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        commit('SET_ERROR', errorMessage);
        throw err;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    quitChannelAction(channelId: number) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      console.log('QUIT CHANNEL ACTION');
      try {
        channelService.quitChannel(channelId);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        commit('SET_ERROR', errorMessage);
        throw err;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    revokeUserAction(channelId: number, userId: number) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        channelService.revokeUserFromChannel(channelId, userId);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        commit('SET_ERROR', errorMessage);
        throw err;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    inviteUserAction(channelId: number, nickname: string) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        channelService.inviteUserToChannel(channelId, nickname);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        commit('SET_ERROR', errorMessage);
        throw err;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    cancelChannelAction(channelId: number) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        channelService.cancelChannel(channelId);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        commit('SET_ERROR', errorMessage);
        throw err;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    kickMemberAction(channelId: number, memberId: number) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        channelService.kickMemberFromChannel(channelId, memberId);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        commit('SET_ERROR', errorMessage);
        throw err;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    acceptChannelInviteAction(channelId: number) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        channelService.acceptChannelInvite(channelId);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        commit('SET_ERROR', errorMessage);
        throw err;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    declineChannelInviteAction(channelId: number) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        channelService.declineChannelInvite(channelId);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        commit('SET_ERROR', errorMessage);
        throw err;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    updateNotifStatusAction(channelId: number, notifStatus: NotifStatus) {
      channelService.updateNotifStatus(channelId, notifStatus);
    },

    listMembersAction(channelId: number) {
      channelService.listMembers(channelId);
    },
  };
}
