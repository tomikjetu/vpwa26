import type { Socket } from 'socket.io-client';
import type { ISocketController } from './types';
import { useChannelStore } from 'src/stores/channel';
import type { Channel } from 'src/utils/types';
import type { ChannelListResponse } from 'src/utils/contracts';

/**
 * Transforms backend ChannelWithMembers to frontend Channel
 */
function transformChannel(ch: ChannelListResponse['channels'][number]): Channel {
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
    icon: ch.isPrivate ? 'lock' : 'tag',
    color: ch.isPrivate ? 'purple' : 'primary',
    infoColor: 'grey',
    isPrivate: ch.isPrivate,
    hasUnreadMsgs: false,
    members,
    notifStatus: ch.notifStatus,
  };
}

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

  private handleChannelsList(data: ChannelListResponse): void {
    const channelStore = useChannelStore();
    console.log('📋 Received initial channels list:', data.channels);

    // Transform all channels from backend
    const transformedChannels = data.channels.map(transformChannel);

    // Set all channels at once
    channelStore.setChannels(transformedChannels);
  }

  private handleChannelsError(data: { error: string }): void {
    console.error('Channels error:', data.error);
  }
}
