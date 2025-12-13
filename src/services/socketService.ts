import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from 'src/stores/auth';
import { Notify } from 'quasar';
import type { NotifStatus, UserStatus } from 'src/utils/types';
import { ref } from 'vue';
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

// Reactive connection state - can be imported and used anywhere
export const isSocketConnected = ref(false);

// Track if user manually disconnected (vs just not initialized yet)
export const isManuallyDisconnected = ref(false);

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
  // If socket already exists (connected or connecting), return it
  if (socket) {
    // Prevent duplicate initialization - just return existing socket
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

  // Register all event listeners (only once per socket instance)
  registerSocketListeners(socket);

  return socket;
}

/**
 * Get existing socket instance
 */
export function getSocket(): Socket {
  if (!socket) {
    return initSocket();
  }
  return socket;
}

/**
 * Disconnect socket - user goes offline
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
    isSocketConnected.value = false;
    isManuallyDisconnected.value = true;
  }
}

/**
 * Reconnect socket - user comes back online
 */
export function reconnectSocket(): void {
  isManuallyDisconnected.value = false;
  if (!socket) {
    initSocket();
  } else if (!socket.connected) {
    socket.connect();
  }
}

/**
 * Check if socket is connected and show error if not
 * Returns true if connected, false if not
 * Only shows warning if user manually disconnected (not during initial connection)
 */
function requireConnection(action: string, silent = false): boolean {
  if (!isSocketConnected.value) {
    // Only show warning if user manually disconnected, not during initial connection
    if (isManuallyDisconnected.value && !silent) {
      Notify.create({
        type: 'warning',
        message: `Cannot ${action} while offline. Please reconnect first.`,
        position: 'top',
      });
    }
    return false;
  }
  return true;
}

/**
 * Register all socket event listeners using controllers
 */
function registerSocketListeners(socket: Socket): void {
  const authStore = useAuthStore();

  // ==================== CLEANUP FIRST ====================
  // Prevent duplicate listeners
  controllers.forEach((controller) => {
    controller.cleanup(socket);
  });

  // ==================== CONNECTION EVENTS ====================

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    isSocketConnected.value = true;
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
    isSocketConnected.value = false;
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
    isSocketConnected.value = false;
    if (
      error.message.includes('unauthorized') ||
      error.message.includes('authentication') ||
      error.message.includes('expired') ||
      error.message.includes('Invalid token') // migrated database case
    ) {
      authStore.clearAuth();
      window.location.href = '/auth/login';
    }
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
    Notify.create({
      type: 'negative',
      message: error.error || 'Socket error occurred',
      position: 'top',
    });
  });

  // ==================== REGISTER DOMAIN CONTROLLERS ====================

  controllers.forEach((controller) => {
    controller.registerListeners(socket);
  });
}

export function cleanupSocketListeners(): void {
  const socket = getSocket();

  controllers.forEach((controller) => {
    controller.cleanup(socket);
  });
}

// ==================== SOCKET EMIT HELPERS ====================

export const socketEmit = {
  // Channel operations
  listChannels: () => {
    if (!requireConnection('list channels')) return;
    getSocket().emit('channel:list');
    console.log('channel:list emited');
  },

  listMembers: (channelId: number) => {
    if (!requireConnection('list members')) return;
    getSocket().emit('channel:list-members', { channelId });
    console.log('members:list emited');
  },

  listMessages: (channelId: number, offset: number) => {
    if (!requireConnection('list messages')) return;
    getSocket().emit('msg:list', { channelId, offset });
    console.log('msg:list emitted');
  },

  listInvites: () => {
    if (!requireConnection('list invites')) return;
    getSocket().emit('invite:list');
    console.log('invite:list emited');
  },

  createChannel: (name: string, isPrivate: boolean) => {
    if (!requireConnection('create channel')) return;
    getSocket().emit('channel:create', { name, isPrivate });
  },

  joinChannel: (name: string) => {
    if (!requireConnection('join channel')) return;
    getSocket().emit('channel:join', { name });
  },

  leaveChannel: (channelId: number) => {
    if (!requireConnection('leave channel')) return;
    getSocket().emit('channel:cancel', { channelId });
  },

  deleteChannel: (channelId: number) => {
    if (!requireConnection('delete channel')) return;
    getSocket().emit('channel:quit', { channelId });
    console.log('channel:quit emitted');
  },

  // Invitations
  inviteUser: (channelId: number, nickname: string) => {
    if (!requireConnection('invite user')) return;
    getSocket().emit('invite:create', { channelId, nickname });
    console.log('invite:create emited');
  },

  acceptInvite: (channelId: number) => {
    if (!requireConnection('accept invite')) return;
    getSocket().emit('invite:accept', { channelId });
  },

  declineInvite: (channelId: number) => {
    if (!requireConnection('decline invite')) return;
    getSocket().emit('invite:decline', { channelId });
  },

  revokeUser: (channelId: number, userId: number) => {
    if (!requireConnection('revoke user')) return;
    getSocket().emit('channel:revoke', { channelId, userId });
  },

  // Messages
  sendMessage: (channelId: number, content: string, files: File[]) => {
    if (!requireConnection('send message')) return;
    getSocket().emit('msg:send', { channelId, content });
    console.log('msg:send emitted');
  },

  deleteMessage: (channelId: number, messageId: number) => {
    if (!requireConnection('delete message')) return;
    getSocket().emit('msg:delete', { channelId, messageId });
  },

  editMessage: (channelId: number, messageId: number, text: string) => {
    if (!requireConnection('edit message')) return;
    getSocket().emit('msg:edit', { channelId, messageId, text });
  },

  // Typing indicator
  sendTyping: (channelId: number, message: string) => {
    if (!isSocketConnected.value) return; // Silent fail for typing - no notification needed
    getSocket().emit('msg:typing', { channelId, message });
  },

  // Kick voting
  voteKick: (channelId: number, targetMemberId: number) => {
    if (!requireConnection('vote kick')) return;
    getSocket().emit('member:kick-vote', { channelId, targetMemberId });
  },

  kickUser: (channelId: number, userId: number) => {
    if (!requireConnection('kick user')) return;
    getSocket().emit('member:kick', { channelId, userId });
  },

  // User status
  updateStatus: (status: UserStatus) => {
    if (!requireConnection('update status')) return;
    getSocket().emit('user:status', { status });
  },

  // File operations
  uploadFile: (channelId: number, file: File) => {
    if (!requireConnection('upload file')) return;
    // Typically files are uploaded via HTTP, but we can notify via socket
    getSocket().emit('file:upload', { channelId, fileName: file.name, fileSize: file.size });
  },

  updateNotifStatus: (channelId: number, notifStatus: NotifStatus) => {
    if (!requireConnection('update notification status')) return;
    getSocket().emit('member:notif-status:update', { channelId, status: notifStatus });
    console.log('member:notif-status:update emitted');
  },
};
