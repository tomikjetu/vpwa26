import type { Socket } from 'socket.io-client';
import type { ISocketController } from './types';
import { useContacts } from 'src/stores/contacts';
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
    updates?: Array<{ userId: number; status: UserStatus }>;
  }): void {
    if (data.type === 'status_updated' && data.userId !== undefined && data.status !== undefined) {
      this.handleStatusUpdate(data.userId, data.status);
    } else if (data.type === 'status_update_success' && data.status !== undefined) {
      // Handle current user's own status update confirmation
      const authStore = useAuthStore();
      const currentUserId = authStore.getCurrentUser?.id;
      if (currentUserId) {
        this.handleStatusUpdate(currentUserId, data.status);
      }
    }
  }

  private handleStatusUpdate(userId: number, status: UserStatus): void {
    // Update in contacts store
    const contactsStore = useContacts();
    contactsStore.updateStatus(userId, status);

    // Update in channel store (all channels where user is a member)
    const channelStore = useChannelStore();
    channelStore.updateMemberStatus(userId, status);

    // Update auth store if it's the current user
    const authStore = useAuthStore();
    if (authStore.getCurrentUser?.id === userId) {
      authStore.setStatus(status);
    }
  }
}
