import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from 'src/stores/auth-store';
import { Notify } from 'quasar';
import type { UserStatus } from 'src/utils/types';
import {
  ConnectionSocketController,
  ChannelSocketController,
  MessageSocketController,
  MemberSocketController,
  InviteSocketController,
  UserStatusSocketController,
  type ISocketController,
} from './socket';

let socket: Socket | null = null;

// Controllers for handling different socket event domains
const controllers: ISocketController[] = [
  new ConnectionSocketController(), // Handles channels:list on connection
  new ChannelSocketController(),
  new MessageSocketController(),
  new MemberSocketController(),
  new InviteSocketController(),
  new UserStatusSocketController(),
];

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
 * Register all socket event listeners using controllers
 */
function registerSocketListeners(socket: Socket): void {
  const authStore = useAuthStore();

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

  // ==================== REGISTER DOMAIN CONTROLLERS ====================

  controllers.forEach((controller) => {
    controller.registerListeners(socket);
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
