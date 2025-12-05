import type { Channel } from 'src/utils/types';

export interface ChatState {
  channel: Channel | null;
  isLoading: boolean;
  error: string | null;
}

export const createInitialState = (): ChatState => ({
  channel: null,
  isLoading: false,
  error: null,
});
