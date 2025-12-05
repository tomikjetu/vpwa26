import type { Socket } from 'socket.io-client';
import type { ISocketController } from './types';
import { useChannelStore } from 'src/stores/channel';
import { useAuthStore } from 'src/stores/auth';
import type { UserStatus } from 'src/utils/types';

/**
 * Handles user status-related socket events
 */
export class UserStatusSocketController implements ISocketController {
  registerListeners(socket: Socket): void {
    // User event handler (status updates come via user:event)
    socket.on('user:event', this.handleUserEvent.bind(this));
  }

  cleanup(socket: Socket): void {
    socket.off('user:event');
  }

  private handleUserEvent(data: {
    type: string;
    userId?: number;
    status?: UserStatus;
    isConnected?: boolean;
  }): void {
    const channelStore = useChannelStore();
    const authStore = useAuthStore();

    if (data.type === 'user_state_changed' && data.userId !== undefined) {
      // Handle combined status + connection state change
      if (data.status !== undefined && data.isConnected !== undefined) {
        channelStore.updateMemberState(data.userId, data.status, data.isConnected);
      } else if (data.status !== undefined) {
        channelStore.updateMemberStatus(data.userId, data.status);
      } else if (data.isConnected !== undefined) {
        channelStore.updateMemberConnection(data.userId, data.isConnected);
      }

      // Update auth store if it's the current user
      if (authStore.getCurrentUser?.id === data.userId && data.status !== undefined) {
        authStore.setStatus(data.status);
      }
    } else if (data.type === 'status_update_success' && data.status !== undefined) {
      // Handle current user's own status update confirmation
      const currentUserId = authStore.getCurrentUser?.id;
      if (currentUserId) {
        channelStore.updateMemberStatus(currentUserId, data.status);
        authStore.setStatus(data.status);
      }
    }
  }
}
