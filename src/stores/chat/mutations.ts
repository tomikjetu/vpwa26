import type { Channel } from 'src/utils/types';
import type { ChatState } from './state';

/**
 * Mutations are synchronous functions that directly modify state.
 * They should be called via commit() from actions.
 */
export const chatMutations = {
  SET_CHANNEL(state: ChatState, channel: Channel | null) {
    state.channel = channel;
  },

  SET_LOADING(state: ChatState, loading: boolean) {
    state.isLoading = loading;
  },

  SET_ERROR(state: ChatState, error: string | null) {
    state.error = error;
  },
};

export type ChatMutations = typeof chatMutations;
