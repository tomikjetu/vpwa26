import { io, type Socket } from 'socket.io-client';
import { useChannelStore } from 'src/stores/channelStore';
import { useAuthStore } from 'src/stores/auth-store';
import { useChatStore } from 'src/stores/chat-store';
import { useContacts } from 'src/stores/contacts-store';
import type {
  Channel,
  ChatMessagePayload,
  Member,
  UserStatus,
  ChannelInvite,
} from 'src/utils/types';
import { Notify } from 'quasar';

let socket: Socket | null = null;

/**
 * Initialize socket connection with authentication
 */
export function initSocket(): Socket {
  if (socket?.connected) {
    return socket;
  }

  const authStore = useAuthStore();
  const token = authStore.getToken;

  if (!token) {
    throw new Error('Cannot initialize socket: No authentication token');
  }

  // Create socket connection with auth token
  socket = io(process.env.SOCKETURL || 'http://localhost:3333', {
    auth: {
      token: token,
    },
    autoConnect: true,
  });

  // Register all event listeners
  registerSocketListeners(socket);

  return socket;
}

/**
 * Get existing socket instance
 */
export function getSocket(): Socket {
  if (!socket?.connected) {
    return initSocket();
  }
  return socket;
}

/**
 * Disconnect socket
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Register all socket event listeners
 */
function registerSocketListeners(socket: Socket): void {
  const channelStore = useChannelStore();
  const authStore = useAuthStore();
  const chatStore = useChatStore();
  const contactsStore = useContacts();

  // ==================== CONNECTION EVENTS ====================

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
    if (error.message.includes('unauthorized') || error.message.includes('authentication')) {
      authStore.clearAuth();
      window.location.href = '/auth/login';
    }
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
    Notify.create({
      type: 'negative',
      message: error.message || 'Socket error occurred',
      position: 'top',
    });
  });

  // ==================== CHANNEL EVENTS ====================

  socket.on('channel:created', (data: { channel: Channel }) => {
    channelStore.addChannel(data.channel);
    Notify.create({
      type: 'positive',
      message: `Channel "${data.channel.name}" created successfully`,
      position: 'top',
    });
  });

  socket.on('channel:joined', (data: { channel: Channel; user: Member }) => {
    const existingChannel = channelStore.getChannelById(data.channel.id);

    if (!existingChannel) {
      channelStore.addChannel(data.channel);
    } else {
      // Update channel members
      existingChannel.members[data.user.id] = data.user;
    }

    const isCurrentUser = data.user.id === authStore.getCurrentUser?.id;
    if (isCurrentUser) {
      Notify.create({
        type: 'positive',
        message: `You joined channel "${data.channel.name}"`,
        position: 'top',
      });
    }
  });

  socket.on('channel:left', (data: { channelId: number; userId: number }) => {
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
  });

  socket.on('channel:deleted', (data: { channelId: number }) => {
    channelStore.removeChannel(data.channelId);

    if (chatStore.channel?.id === data.channelId) {
      chatStore.closeChat();
    }

    Notify.create({
      type: 'info',
      message: 'Channel has been deleted',
      position: 'top',
    });
  });

  socket.on('channel:updated', (data: { channel: Channel }) => {
    const existingChannel = channelStore.getChannelById(data.channel.id);

    if (existingChannel) {
      Object.assign(existingChannel, data.channel);
    }
  });

  // ==================== CHANNEL INVITE EVENTS ====================

  socket.on('channel:invite:received', (data: { invite: ChannelInvite }) => {
    channelStore.channelInvites.push(data.invite);

    Notify.create({
      type: 'info',
      message: `You've been invited to channel "${data.invite.name}"`,
      position: 'top',
      timeout: 5000,
    });
  });

  socket.on('channel:invite:accepted', (data: { channel: Channel; userId: number }) => {
    const isCurrentUser = data.userId === authStore.getCurrentUser?.id;

    if (isCurrentUser) {
      channelStore.addChannel(data.channel);
    } else {
      // Another user accepted invite to our channel
      const channel = channelStore.getChannelById(data.channel.id);
      if (channel) {
        Object.assign(channel, data.channel);
      }
    }
  });

  socket.on('channel:invite:declined', (data: { inviteId: number }) => {
    channelStore.removeInvite(data.inviteId);
  });

  // ==================== MESSAGE EVENTS ====================

  socket.on('message:new', (data: { channelId: number; message: ChatMessagePayload }) => {
    const channel = channelStore.getChannelById(data.channelId);

    if (!channel) return;

    // Add message to store
    channelStore.addMessage(data.message, data.channelId);

    // If not viewing this channel, mark as unread
    if (chatStore.channel?.id !== data.channelId) {
      channel.hasUnreadMsgs = true;

      // Show notification if message is from another user
      if (data.message.user !== authStore.getCurrentUser?.id) {
        Notify.create({
          type: 'info',
          message: `New message in ${channel.name}`,
          caption: data.message.text.substring(0, 50),
          position: 'bottom-right',
          timeout: 3000,
        });
      }
    }
  });

  socket.on('message:deleted', (data: { channelId: number; messageId: number }) => {
    const messages = channelStore.getMessagesByChannelId(data.channelId);
    const index = messages.findIndex((m: ChatMessagePayload) => m.id === data.messageId);

    if (index !== -1) {
      messages.splice(index, 1);
    }
  });

  socket.on('message:edited', (data: { channelId: number; message: ChatMessagePayload }) => {
    const messages = channelStore.getMessagesByChannelId(data.channelId);
    const index = messages.findIndex((m: ChatMessagePayload) => m.id === data.message.id);

    if (index !== -1 && messages[index]) {
      Object.assign(messages[index], data.message);
    }
  });

  // ==================== MEMBER EVENTS ====================

  socket.on('member:joined', (data: { channelId: number; member: Member }) => {
    const channel = channelStore.getChannelById(data.channelId);

    if (channel) {
      channel.members[data.member.id] = data.member;

      Notify.create({
        type: 'info',
        message: `${data.member.nickname} joined ${channel.name}`,
        position: 'top',
      });
    }
  });

  socket.on('member:left', (data: { channelId: number; userId: number }) => {
    const channel = channelStore.getChannelById(data.channelId);

    if (channel && channel.members[data.userId]) {
      const member = channel.members[data.userId];
      const memberName = member?.nickname || 'User';
      delete channel.members[data.userId];

      Notify.create({
        type: 'info',
        message: `${memberName} left ${channel.name}`,
        position: 'top',
      });
    }
  });

  socket.on('member:kicked', (data: { channelId: number; userId: number; kickedBy: number }) => {
    const channel = channelStore.getChannelById(data.channelId);

    if (!channel) return;

    const isCurrentUser = data.userId === authStore.getCurrentUser?.id;

    if (isCurrentUser) {
      channelStore.removeChannel(data.channelId);
      if (chatStore.channel?.id === data.channelId) {
        chatStore.closeChat();
      }

      Notify.create({
        type: 'negative',
        message: `You have been kicked from ${channel.name}`,
        position: 'top',
      });
    } else if (channel.members[data.userId]) {
      const member = channel.members[data.userId];
      const memberName = member?.nickname || 'User';
      delete channel.members[data.userId];

      Notify.create({
        type: 'info',
        message: `${memberName} was kicked from ${channel.name}`,
        position: 'top',
      });
    }
  });

  socket.on(
    'member:typing',
    (data: { channelId: number; userId: number; typing: boolean; text?: string }) => {
      channelStore.updateMemberTyping(
        data.channelId,
        data.userId,
        data.typing ? data.text || 'typing...' : '',
      );
    },
  );

  socket.on(
    'member:kick-vote',
    (data: { channelId: number; targetUserId: number; voterId: number; voteCount: number }) => {
      const channel = channelStore.getChannelById(data.channelId);

      if (channel && channel.members[data.targetUserId]) {
        const member = channel.members[data.targetUserId];
        if (member) {
          member.kickVotes = data.voteCount;

          if (!member.kickVoters) {
            member.kickVoters = [];
          }

          if (!member.kickVoters.includes(data.voterId)) {
            member.kickVoters.push(data.voterId);
          }
        }
      }
    },
  );

  // ==================== USER STATUS EVENTS ====================

  socket.on('user:status', (data: { userId: number; status: UserStatus }) => {
    contactsStore.updateStatus(data.userId, data.status);

    // Update in channels where this user is a member
    channelStore.channels.forEach((channel) => {
      if (channel.members[data.userId]) {
        // Could add status field to member if needed
        // channel.members[data.userId].status = data.status;
      }
    });
  });

  socket.on('user:online', (data: { userId: number }) => {
    contactsStore.updateStatus(data.userId, 'online');
  });

  socket.on('user:offline', (data: { userId: number }) => {
    contactsStore.updateStatus(data.userId, 'offline');
  });

  // ==================== FILE EVENTS ====================

  socket.on('file:uploaded', (data: { channelId: number; messageId: number; file: string }) => {
    // Handle file upload completion
    console.log('File uploaded:', data);
  });

  socket.on('file:deleted', (data: { channelId: number; fileId: string }) => {
    // Handle file deletion
    console.log('File deleted:', data);
  });
}

// ==================== SOCKET EMIT HELPERS ====================

export const socketEmit = {
  // Channel operations
  createChannel: (name: string, isPublic: boolean) => {
    getSocket().emit('channel:create', { name, isPublic });
  },

  joinChannel: (channelName: string) => {
    getSocket().emit('channel:join', { channelName });
  },

  leaveChannel: (channelId: number) => {
    getSocket().emit('channel:leave', { channelId });
  },

  deleteChannel: (channelId: number) => {
    getSocket().emit('channel:delete', { channelId });
  },

  // Invitations
  inviteUser: (channelId: number, userId: number) => {
    getSocket().emit('channel:invite', { channelId, userId });
  },

  acceptInvite: (inviteId: number) => {
    getSocket().emit('channel:invite:accept', { inviteId });
  },

  declineInvite: (inviteId: number) => {
    getSocket().emit('channel:invite:decline', { inviteId });
  },

  revokeUser: (channelId: number, userId: number) => {
    getSocket().emit('channel:revoke', { channelId, userId });
  },

  // Messages
  sendMessage: (channelId: number, text: string, files?: string[]) => {
    getSocket().emit('message:send', { channelId, text, files });
  },

  deleteMessage: (channelId: number, messageId: number) => {
    getSocket().emit('message:delete', { channelId, messageId });
  },

  editMessage: (channelId: number, messageId: number, text: string) => {
    getSocket().emit('message:edit', { channelId, messageId, text });
  },

  // Typing indicator
  startTyping: (channelId: number, text: string) => {
    getSocket().emit('member:typing', { channelId, typing: true, text });
  },

  stopTyping: (channelId: number) => {
    getSocket().emit('member:typing', { channelId, typing: false });
  },

  // Kick voting
  voteKick: (channelId: number, userId: number) => {
    getSocket().emit('member:kick-vote', { channelId, userId });
  },

  kickUser: (channelId: number, userId: number) => {
    getSocket().emit('member:kick', { channelId, userId });
  },

  // User status
  updateStatus: (status: UserStatus) => {
    getSocket().emit('user:status', { status });
  },

  // File operations
  uploadFile: (channelId: number, file: File) => {
    // Typically files are uploaded via HTTP, but we can notify via socket
    getSocket().emit('file:upload', { channelId, fileName: file.name, fileSize: file.size });
  },
};
