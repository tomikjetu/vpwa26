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

    socket.on('invite:list', this.handleInviteList.bind(this))
  }

  cleanup(socket: Socket): void {
    socket.off('channel:invite:received');
    socket.off('channel:invite:accepted');
    socket.off('channel:invite:declined');
    socket.off('invite:list');
  }

  private handleInviteList(data: { invites: ChannelInvite[] }) : void {
    const channelStore = useChannelStore();
    console.log(data)
    for(const invite of data.invites) {
      // Transform backend invite data
      const transformedInvite: ChannelInvite = {
        id: invite.id,
        channelId: invite.channelId,
        name: invite.name,
        invitedAt: new Date(invite.invitedAt),
        description: '',
        icon: 'tag',
        color: 'primary',
      };
      channelStore.channelInvites.push(transformedInvite);
    }
  }

  private handleInviteReceived(data: { invitedAt: Date, channelName: string, inviteId: number, channelId: number }): void {
    const channelStore = useChannelStore();

    // Transform backend invite data
    const transformedInvite: ChannelInvite = {
      id: data.inviteId,
      channelId: data.channelId,
      name: data.channelName,
      invitedAt: new Date(data.invitedAt),
      description: '',
      icon: 'tag',
      color: 'primary',
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
        icon: 'tag',
        color: 'primary',
        infoColor: 'grey',
        isPrivate: data.channel.isPrivate,
        hasUnreadMsgs: false,
        members: data.channel.members || {},
      };
      channelStore.removeInvite(transformedChannel.id)
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

  private handleInviteDeclined(data: { channelId: number }): void {
    console.log("DECLINED")
    const channelStore = useChannelStore();
    console.log(data.channelId)
    channelStore.removeInvite(data.channelId);
    console.log(channelStore.channelInvites)
  }
}
