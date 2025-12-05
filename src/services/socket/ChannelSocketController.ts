import type { Socket } from 'socket.io-client';
import type { ISocketController } from './types';
import { useChannelStore } from 'src/stores/channel';
import { useAuthStore } from 'src/stores/auth';
import { useChatStore } from 'src/stores/chat';
import { Notify } from 'quasar';
import type { Channel } from 'src/utils/types';
import type {
  ChannelListResponse,
  ChannelCreatedResponse,
  ChannelJoinedResponse,
  ChannelListMembersResponse,
  ChannelDeletedBroadcast,
  ChannelLeftResponse,
} from 'src/utils/contracts';
import { useDialogStore } from 'src/stores/dialog';

/**
 * Transforms backend ChannelWithMembers to frontend Channel
 */
function transformChannel(ch: ChannelCreatedResponse['channel']): Channel {
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
 * Handles channel-related socket events
 */
export class ChannelSocketController implements ISocketController {
  registerListeners(socket: Socket): void {
    // Channels list - broadcast to user only
    socket.on('channel:list', this.handleChannelsList.bind(this));

    // Channel created - broadcast to all users
    socket.on('channel:created', this.handleChannelCreated.bind(this));

    // User joined channel - broadcast to channel members
    socket.on('channel:joined', this.handleChannelJoined.bind(this));

    socket.on('channel:list-members', this.handleChannelMembersList.bind(this));

    // Channel deleted - broadcast to channel members
    socket.on('channel:deleted', this.handleChannelDeleted.bind(this));

    // Channel updated - broadcast to channel members
    socket.on('channel:updated', this.handleChannelUpdated.bind(this));

    socket.on('channel:left', this.handleChannelLeft.bind(this));
  }

  cleanup(socket: Socket): void {
    socket.off('channel:list');
    socket.off('channel:created');
    socket.off('channel:joined');
    socket.off('channel:listMembers');
    socket.off('channel:left');
    socket.off('channel:deleted');
    socket.off('channel:updated');
  }

  private handleChannelsList(data: ChannelListResponse): void {
    const channelStore = useChannelStore();

    console.log(data);

    for (const ch of data.channels) {
      const transformedChannel = transformChannel(ch);
      channelStore.addChannel(transformedChannel);
    }
  }

  private handleChannelCreated(data: ChannelCreatedResponse): void {
    const channelStore = useChannelStore();

    console.log(data.channel);

    const transformedChannel = transformChannel(data.channel);
    channelStore.addChannel(transformedChannel);

    Notify.create({
      type: 'positive',
      message: `Channel "${transformedChannel.name}" created successfully`,
      position: 'top',
    });
  }

  private handleChannelJoined(data: ChannelJoinedResponse): void {
    const channelStore = useChannelStore();
    const authStore = useAuthStore();
    const existingChannel = channelStore.getChannelById(data.channel.id);

    console.log(data);

    if (!existingChannel) {
      const transformedChannel = transformChannel(data.channel);
      channelStore.addChannel(transformedChannel);
    } else {
      // Update existing channel with new members
      if (data.channel.members) {
        for (const [id, member] of Object.entries(data.channel.members)) {
          existingChannel.members[Number(id)] = {
            ...member,
            currentlyTyping: '',
          };
        }
      }
    }

    const isCurrentUser = data.userId === authStore.getCurrentUser?.id;
    if (isCurrentUser) {
      Notify.create({
        type: 'positive',
        message: `You joined channel "${data.channel.name}"`,
        position: 'top',
      });
    }
  }

  private handleChannelMembersList(data: ChannelListMembersResponse): void {
    const dialogStore = useDialogStore();
    console.log(data);
    dialogStore.openMemberList(data.members);
  }

  private handleChannelDeleted(data: ChannelDeletedBroadcast): void {
    const channelStore = useChannelStore();
    const chatStore = useChatStore();

    console.log('CLOSED');

    channelStore.removeChannel(data.channelId);

    if (chatStore.channel?.id === data.channelId) {
      chatStore.closeChat();
    }

    Notify.create({
      type: 'info',
      message: 'Channel has been deleted',
      position: 'top',
    });
  }

  private handleChannelUpdated(data: ChannelCreatedResponse): void {
    const channelStore = useChannelStore();
    const existingChannel = channelStore.getChannelById(data.channel.id);

    if (existingChannel) {
      // Update with backend data
      Object.assign(existingChannel, {
        name: data.channel.name,
        isPublic: data.channel.isPrivate,
        updatedAt: data.channel.updatedAt,
      });
      // Update members if provided
      if (data.channel.members) {
        for (const [id, member] of Object.entries(data.channel.members)) {
          existingChannel.members[Number(id)] = {
            ...member,
            currentlyTyping: existingChannel.members[Number(id)]?.currentlyTyping || '',
          };
        }
      }
    }
  }

  private handleChannelLeft(data: ChannelLeftResponse): void {
    const channelStore = useChannelStore();
    const chatStore = useChatStore();

    channelStore.removeChannel(data.channelId);

    if (chatStore.channel?.id === data.channelId) {
      chatStore.closeChat();
    }

    Notify.create({
      type: 'info',
      message: 'You have left the channel',
      position: 'top',
    });
  }
}
