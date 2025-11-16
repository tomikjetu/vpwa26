import type { Socket } from 'socket.io-client';
import type { ISocketController } from './types';
import { useChannelStore } from 'src/stores/channelStore';
import { useAuthStore } from 'src/stores/auth-store';
import { useChatStore } from 'src/stores/chat-store';
import { Notify } from 'quasar';
import type { Channel } from 'src/utils/types';

/**
 * Handles channel-related socket events
 */
export class ChannelSocketController implements ISocketController {
  registerListeners(socket: Socket): void {
    // Channel created - broadcast to all users
    socket.on('channel:created', this.handleChannelCreated.bind(this));

    // User joined channel - broadcast to channel members
    socket.on('channel:joined', this.handleChannelJoined.bind(this));

    // User left channel - broadcast to channel members
    socket.on('channel:left', this.handleChannelLeft.bind(this));

    // Channel deleted - broadcast to channel members
    socket.on('channel:deleted', this.handleChannelDeleted.bind(this));

    // Channel updated - broadcast to channel members
    socket.on('channel:updated', this.handleChannelUpdated.bind(this));
  }

  cleanup(socket: Socket): void {
    socket.off('channel:created');
    socket.off('channel:joined');
    socket.off('channel:left');
    socket.off('channel:deleted');
    socket.off('channel:updated');
  }

  private handleChannelCreated(data: { channel: Channel }): void {
    const channelStore = useChannelStore();

    // Transform backend data to frontend format
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
      isPublic: data.channel.isPublic,
      hasUnreadMsgs: false,
      members: data.channel.members || {},
    };

    channelStore.addChannel(transformedChannel);

    Notify.create({
      type: 'positive',
      message: `Channel "${transformedChannel.name}" created successfully`,
      position: 'top',
    });
  }

  private handleChannelJoined(data: { channel: Channel; userId: number }): void {
    const channelStore = useChannelStore();
    const authStore = useAuthStore();
    const existingChannel = channelStore.getChannelById(data.channel.id);

    if (!existingChannel) {
      // Transform backend data to frontend format
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
        isPublic: data.channel.isPublic,
        hasUnreadMsgs: false,
        members: data.channel.members || {},
      };

      channelStore.addChannel(transformedChannel);
    } else {
      // Update existing channel with new members
      if (data.channel.members) {
        existingChannel.members = data.channel.members;
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

  private handleChannelLeft(data: { channelId: number; userId: number }): void {
    const channelStore = useChannelStore();
    const authStore = useAuthStore();
    const chatStore = useChatStore();
    const channel = channelStore.getChannelById(data.channelId);

    if (channel && channel.members[data.userId]) {
      delete channel.members[data.userId];
    }

    const isCurrentUser = data.userId === authStore.getCurrentUser?.id;
    if (isCurrentUser) {
      channelStore.removeChannel(data.channelId);
      if (chatStore.channel?.id === data.channelId) {
        chatStore.closeChat();
      }
    }
  }

  private handleChannelDeleted(data: { channelId: number }): void {
    const channelStore = useChannelStore();
    const chatStore = useChatStore();

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

  private handleChannelUpdated(data: { channel: Channel }): void {
    const channelStore = useChannelStore();
    const existingChannel = channelStore.getChannelById(data.channel.id);

    if (existingChannel) {
      // Update with backend data
      Object.assign(existingChannel, {
        name: data.channel.name,
        description: data.channel.description,
        isPublic: data.channel.isPublic,
        updatedAt: new Date(data.channel.updatedAt),
        members: data.channel.members || existingChannel.members,
      });
    }
  }
}
