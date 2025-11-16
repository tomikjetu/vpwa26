import { Notify } from 'quasar';
import { socketEmit } from './socketService';

/**
 * ChannelService - Socket-based service for real-time channel operations
 * All channel data comes from socket events pushed by the server
 */
class ChannelService {
  /**
   * Create a new channel (via socket)
   */
  createChannel(name: string, isPublic: boolean): void {
    socketEmit.createChannel(name, isPublic);
    // Response will come via socket event 'channel:created'
  }

  /**
   * Join a public channel by name (via socket)
   */
  joinChannel(channelName: string): void {
    socketEmit.joinChannel(channelName);
    // Response will come via socket event 'channel:joined'
  }

  /**
   * Leave/quit a channel (via socket)
   */
  quitChannel(channelId: number): void {
    socketEmit.leaveChannel(channelId);
    // Response will come via socket event 'channel:left'
  }

  /**
   * Revoke/kick a user from a channel (via socket - owner only)
   */
  revokeUserFromChannel(channelId: number, userId: number): void {
    socketEmit.revokeUser(channelId, userId);
    // Response will come via socket event 'member:left'
  }

  /**
   * Invite a user to a channel (via socket - owner only for private channels)
   */
  inviteUserToChannel(channelId: number, userId: number): void {
    socketEmit.inviteUser(channelId, userId);
    // Response will come via socket event 'channel:invite:received' (for target user)
  }

  /**
   * Delete/cancel a channel (via socket - owner only)
   */
  cancelChannel(channelId: number): void {
    socketEmit.deleteChannel(channelId);
    // Response will come via socket event 'channel:deleted'
  }

  /**
   * Vote to kick a user from a channel (via socket)
   */
  kickUserFromChannel(channelId: number, userId: number): void {
    socketEmit.voteKick(channelId, userId);
    // Response will come via socket event 'member:kick-vote' or 'member:kicked'
  }

  /**
   * Accept a channel invitation (via socket)
   */
  acceptChannelInvite(channelInviteId: number): void {
    socketEmit.acceptInvite(channelInviteId);
    // Response will come via socket event 'channel:invite:accepted'
  }

  /**
   * Decline a channel invitation (via socket)
   */
  declineChannelInvite(channelInviteId: number): void {
    socketEmit.declineInvite(channelInviteId);
    // Response will come via socket event 'channel:invite:declined'
  }

  /**
   * Send a message to a channel (via socket)
   */
  sendMessage(channelId: number, text: string, files?: string[]): void {
    socketEmit.sendMessage(channelId, text, files);
    // Response will come via socket event 'message:new'
  }

  /**
   * Delete a message (via socket)
   */
  deleteMessage(channelId: number, messageId: number): void {
    socketEmit.deleteMessage(channelId, messageId);
    // Response will come via socket event 'message:deleted'
  }

  /**
   * Update typing indicator (via socket)
   */
  startTyping(channelId: number, text: string): void {
    socketEmit.startTyping(channelId, text);
  }

  stopTyping(channelId: number): void {
    socketEmit.stopTyping(channelId);
  }
}

export const channelService = new ChannelService();

/**
 * Utility function for displaying message notifications
 * (UI utility, kept in service file for convenience)
 */
export function msgNotif(name: string, text: string, onClick: () => void) {
  const maxLength = 30;
  const shortText = text.length > maxLength ? text.slice(0, maxLength).trimEnd() + '...' : text;

  const shortName = name.length > maxLength ? name.slice(0, maxLength).trimEnd() + '...' : name;

  const closeNotify = Notify.create({
    message: `<strong style="font-size: 18px; display: block; margin-bottom: 4px;">${shortName}</strong>`,
    caption: `<span style="font-size: 16px; line-height: 1.4;">${shortText}</span>`,
    textColor: 'black',
    position: 'bottom-right',
    timeout: 6000,
    progress: false,
    html: true,
    classes:
      'q-pa-lg q-ma-md shadow-4 rounded-2xl border cursor-pointer transition-all hover:bg-grey-2 messenger-notify',
    icon: 'account_circle',
    iconColor: 'blue-6',
    actions: [
      {
        icon: 'close',
        handler: () => {
          event?.stopPropagation?.();
          closeNotify();
        },
      },
    ],
  });

  setTimeout(() => {
    const el = document.querySelector('.messenger-notify');
    if (el) {
      el.addEventListener('click', () => {
        onClick();
        closeNotify();
      });
    }
  }, 0);
}
