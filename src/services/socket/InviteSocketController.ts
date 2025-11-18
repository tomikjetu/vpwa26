import type { Socket } from 'socket.io-client';
import type { ISocketController } from './types';
import { useChannelStore } from 'src/stores/channelStore';
import { useAuthStore } from 'src/stores/auth-store';
import { Notify } from 'quasar';
import type { ChannelInvite, Channel } from 'src/utils/types';

/**
 * Handles channel invitation-related socket events
 */
export class InviteSocketController implements ISocketController {
  registerListeners(socket: Socket): void {
    // Invitation received
    socket.on('channel:invite:received', this.handleInviteReceived.bind(this));

    // Invitation accepted
    socket.on('channel:invite:accepted', this.handleInviteAccepted.bind(this));

    // Invitation declined
    socket.on('channel:invite:declined', this.handleInviteDeclined.bind(this));
  }

  cleanup(socket: Socket): void {
    socket.off('channel:invite:received');
    socket.off('channel:invite:accepted');
    socket.off('channel:invite:declined');
  }

  private handleInviteReceived(data: { invite: ChannelInvite }): void {
    const channelStore = useChannelStore();

    // Transform backend invite data
    const transformedInvite: ChannelInvite = {
      id: data.invite.id,
      name: data.invite.name,
      invitedAt: new Date(data.invite.invitedAt),
      description: data.invite.description || '',
      icon: 'lock',
      color: 'purple',
    };

    channelStore.channelInvites.push(transformedInvite);

    Notify.create({
      type: 'info',
      message: `You've been invited to channel "${transformedInvite.name}"`,
      position: 'top',
      timeout: 5000,
    });
  }

  private handleInviteAccepted(data: { channel: Channel; userId: number }): void {
    const channelStore = useChannelStore();
    const authStore = useAuthStore();
    const isCurrentUser = data.userId === authStore.getCurrentUser?.id;

    if (isCurrentUser) {
      // Transform backend channel data
      const transformedChannel: Channel = {
        id: data.channel.id,
        ownerId: data.channel.ownerId,
        name: data.channel.name,
        createdAt: new Date(data.channel.createdAt),
        updatedAt: new Date(data.channel.updatedAt),
        joinedAt: new Date(data.channel.joinedAt || data.channel.createdAt),
        description: data.channel.description || '',
        icon: 'lock',
        color: 'purple',
        infoColor: 'grey',
        isPublic: data.channel.isPublic,
        hasUnreadMsgs: false,
        members: data.channel.members || {},
      };

      channelStore.addChannel(transformedChannel);
    } else {
      // Another user accepted invite to our channel
      const channel = channelStore.getChannelById(data.channel.id);
      if (channel) {
        // Update members
        if (data.channel.members) {
          channel.members = data.channel.members;
        }
      }
    }
  }

  private handleInviteDeclined(data: { inviteId: number }): void {
    const channelStore = useChannelStore();
    channelStore.removeInvite(data.inviteId);
  }
}
