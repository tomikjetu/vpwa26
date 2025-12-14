import type { Channel, ChatMessagePayload } from 'src/utils/types';
import type { ChatState } from './state';
import type { chatMutations } from './mutations';
import { useChannelStore } from 'src/stores/channel';

type Commit = <K extends keyof typeof chatMutations>(
  mutation: K,
  payload?: Parameters<(typeof chatMutations)[K]>[1],
) => void;

/**
 * Actions are async functions that commit mutations.
 * They handle business logic and side effects.
 */
export function createChatActions(state: ChatState, commit: Commit) {
  return {
    async sendMessage(msg: ChatMessagePayload, files: File[]) {
      if (!state.channel) return;
      const channelStore = useChannelStore();
      await channelStore.sendMessage(msg, state.channel.id, files);
    },

    async openChat(newChannel: Channel | null): Promise<void> {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        commit('SET_CHANNEL', newChannel);
        if (!newChannel) return;

        const channelStore = useChannelStore();
        await channelStore.loadMessages(newChannel.id);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        commit('SET_ERROR', errorMessage);
        throw err;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    closeChat() {
      commit('SET_CHANNEL', null);
    },
  };
}
