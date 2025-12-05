import type { Socket } from 'socket.io-client';
import type { ISocketController } from './types';
import { useChannelStore } from 'src/stores/channel';
import { useAuthStore } from 'src/stores/auth';
import type { UserEvent } from 'src/utils/contracts';

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

  private handleUserEvent(data: UserEvent): void {
    const channelStore = useChannelStore();
    const authStore = useAuthStore();

    if (data.type === 'user_state_changed') {
      // Handle combined status + connection state change
      channelStore.updateMemberState(data.userId, data.status, data.isConnected);

      // Update auth store if it's the current user
      if (authStore.getCurrentUser?.id === data.userId) {
        authStore.setStatus(data.status);
      }
    } else if (data.type === 'status_update_success') {
      // Handle current user's own status update confirmation
      const currentUserId = authStore.getCurrentUser?.id;
      if (currentUserId) {
        channelStore.updateMemberStatus(currentUserId, data.status);
        authStore.setStatus(data.status);
      }
    } else if (data.type === 'profile') {
      // Handle profile data (e.g., on initial connection)
      const user = data.user;
      authStore.updateUser({
        id: user.id,
        name: user.firstName,
        surname: user.lastName,
        nickName: user.nick,
        email: user.email,
        status: user.status,
      });
    }
  }
}
