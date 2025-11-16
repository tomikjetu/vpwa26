import type { Socket } from 'socket.io-client';
import type { ISocketController } from './types';
import { useContacts } from 'src/stores/contacts-store';
import type { UserStatus } from 'src/utils/types';

/**
 * Handles user status-related socket events
 */
export class UserStatusSocketController implements ISocketController {
  registerListeners(socket: Socket): void {
    // User status changed
    socket.on('user:status', this.handleUserStatus.bind(this));

    // User came online
    socket.on('user:online', this.handleUserOnline.bind(this));

    // User went offline
    socket.on('user:offline', this.handleUserOffline.bind(this));
  }

  cleanup(socket: Socket): void {
    socket.off('user:status');
    socket.off('user:online');
    socket.off('user:offline');
  }

  private handleUserStatus(data: { userId: number; status: UserStatus }): void {
    const contactsStore = useContacts();
    contactsStore.updateStatus(data.userId, data.status);
  }

  private handleUserOnline(data: { userId: number }): void {
    const contactsStore = useContacts();
    contactsStore.updateStatus(data.userId, 'online');
  }

  private handleUserOffline(data: { userId: number }): void {
    const contactsStore = useContacts();
    contactsStore.updateStatus(data.userId, 'offline');
  }
}
