import type { Socket } from 'socket.io-client';
import type { ISocketController } from './types';
import { useChannelStore } from 'src/stores/channelStore';
import type { Channel } from 'src/utils/types';

/**
 * Handles initial connection and channel list events
 */
export class ConnectionSocketController implements ISocketController {
  registerListeners(socket: Socket): void {
    // Initial channel list sent by server on connection
    socket.on('channels:list', this.handleChannelsList.bind(this));

    // General channel errors
    socket.on('channels:error', this.handleChannelsError.bind(this));
  }

  cleanup(socket: Socket): void {
    socket.off('channels:list');
    socket.off('channels:error');
  }

  private handleChannelsList(data: { channels: Channel[] }): void {
    const channelStore = useChannelStore();
    console.log('📋 Received initial channels list:', data.channels);

    // Transform all channels from backend
    const transformedChannels: Channel[] = data.channels.map((channel) => ({
      id: channel.id,
      ownerId: channel.ownerId,
      name: channel.name,
      createdAt: new Date(channel.createdAt),
      updatedAt: new Date(channel.updatedAt),
      joinedAt: new Date(channel.joinedAt || channel.createdAt),
      description: channel.description || '',
      icon: channel.isPublic ? 'tag' : 'lock',
      color: channel.isPublic ? 'primary' : 'purple',
      infoColor: 'grey',
      isPublic: channel.isPublic,
      hasUnreadMsgs: false,
      members: channel.members || {},
    }));

    // Set all channels at once
    channelStore.setChannels(transformedChannels);
  }

  private handleChannelsError(data: { error: string }): void {
    console.error('Channels error:', data.error);
  }
}
