import type { Socket } from 'socket.io-client';
import type { ISocketController } from './types';
import { useChannelStore } from 'src/stores/channel';
import { useAuthStore } from 'src/stores/auth';
import { Notify } from 'quasar';
import type { ChannelInvite, Channel } from 'src/utils/types';
import type {
  InviteListResponse,
  InviteSentResponse,
  InviteReceivedBroadcast,
  InviteAcceptedResponse,
  InviteDeclinedResponse,
} from 'src/utils/contracts';

/**
 * Transforms backend ChannelWithMembers to frontend Channel
 */
function transformChannel(ch: InviteAcceptedResponse['channel']): Channel {
  // Transform members to include frontend-only fields
  const members: Record<number, Channel['members'][number]> = {};
  if (ch.members) {
    for (const [id, member] of Object.entries(ch.members)) {
      members[Number(id)] = {
        ...member,
        currentlyTyping: '',
      };
    }
  }

  return {
    id: ch.id,
    ownerId: ch.ownerId,
    name: ch.name,
    createdAt: ch.createdAt,
    updatedAt: ch.updatedAt,
    description: '',
    icon: 'tag',
    color: 'primary',
    infoColor: 'grey',
    isPrivate: ch.isPrivate,
    hasUnreadMsgs: false,
    members,
    notifStatus: ch.notifStatus || 'all',
  };
}

/**
 * Handles channel invitation-related socket events
 */
export class InviteSocketController implements ISocketController {
  registerListeners(socket: Socket): void {
    // Invitation received
    socket.on('channel:invite:received', this.handleInviteReceived.bind(this));

    socket.on('invite:sent', this.handleInviteSent.bind(this));

    // Invitation accepted
    socket.on('channel:invite:accepted', this.handleInviteAccepted.bind(this));

    // Invitation declined
    socket.on('channel:invite:declined', this.handleInviteDeclined.bind(this));

    socket.on('invite:list', this.handleInviteList.bind(this));
  }

  cleanup(socket: Socket): void {
    socket.off('channel:invite:received');
    socket.off('channel:invite:accepted');
    socket.off('channel:invite:declined');
    socket.off('invite:list');
    socket.off('invite:sent');
  }

  private handleInviteList(data: InviteListResponse): void {
    const channelStore = useChannelStore();
    console.log(data);
    for (const invite of data.invites) {
      // Transform backend invite data
      const transformedInvite: ChannelInvite = {
        id: invite.id,
        channelId: invite.channelId,
        name: invite.channelName,
        invitedAt: new Date(invite.createdAt),
        description: '',
        icon: 'tag',
        color: 'primary',
      };
      channelStore.channelInvites.push(transformedInvite);
    }
  }

  private handleInviteSent(data: InviteSentResponse): void {
    Notify.create({
      type: 'info',
      message: `You've successfully invited ${data.nickname} to the channel ${data.channelName}`,
      position: 'top',
      timeout: 5000,
    });
  }

  private handleInviteReceived(data: InviteReceivedBroadcast): void {
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

  private handleInviteAccepted(data: InviteAcceptedResponse): void {
    const channelStore = useChannelStore();
    const authStore = useAuthStore();
    const isCurrentUser = data.userId === authStore.getCurrentUser?.id;

    if (isCurrentUser) {
      // Transform backend channel data
      const transformedChannel = transformChannel(data.channel);
      channelStore.removeInvite(transformedChannel.id);
      channelStore.addChannel(transformedChannel);
    } else {
      // Another user accepted invite to our channel
      const channel = channelStore.getChannelById(data.channel.id);
      if (channel) {
        // Update members
        if (data.channel.members) {
          for (const [id, member] of Object.entries(data.channel.members)) {
            channel.members[Number(id)] = {
              ...member,
              currentlyTyping: channel.members[Number(id)]?.currentlyTyping || '',
            };
          }
        }
      }
    }
  }

  private handleInviteDeclined(data: InviteDeclinedResponse): void {
    console.log('DECLINED');
    const channelStore = useChannelStore();
    console.log(data.channelId);
    channelStore.removeInvite(data.channelId);
    console.log(channelStore.channelInvites);
  }
}
