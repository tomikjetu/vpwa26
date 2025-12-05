import type { Socket } from 'socket.io-client';
import type { ISocketController } from './types';
import { useChannelStore } from 'src/stores/channel';
import { useAuthStore } from 'src/stores/auth';
import { useChatStore } from 'src/stores/chat';
import { Notify } from 'quasar';
import type { Member, NotifStatus } from 'src/utils/types';
import { useDialogStore } from 'src/stores/dialog';

/**
 * Handles member-related socket events
 */
export class MemberSocketController implements ISocketController {
  registerListeners(socket: Socket): void {
    // Member joined channel
    socket.on('member:joined', this.handleMemberJoined.bind(this));

    // Member left channel
    socket.on('member:left', this.handleMemberLeft.bind(this));

    // Member kicked from channel
    socket.on('member:kicked', this.handleMemberKicked.bind(this));

    // Member typing indicator
    socket.on('member:typing', this.handleMemberTyping.bind(this));

    // Member kick vote received
    socket.on('member:kick-voted', this.handleMemberKickVote.bind(this));

    socket.on('member:notif-status:updated', this.handleNotifStatusUpdated.bind(this));
  }

  cleanup(socket: Socket): void {
    socket.off('member:joined');
    socket.off('member:left');
    socket.off('member:kicked');
    socket.off('member:typing');
    socket.off('member:kick-voted');
    socket.off('member:notif-status:updated');
  }

  private handleMemberJoined(data: { channelId: number; member: Member }): void {
    const channelStore = useChannelStore();
    const channel = channelStore.getChannelById(data.channelId);

    console.log(`member: `);
    console.log(data.member);
    console.log(`id: ${data.channelId}`);

    if (channel) {
      // Transform backend member data
      channel.members[data.member.id] = {
        id: data.member.id,
        userId: data.member.userId,
        nickname: data.member.nickname,
        isOwner: data.member.isOwner,
        kickVotes: data.member.kickVotes || 0,
        currentlyTyping: '',
        receivedKickVotes: data.member.receivedKickVotes || [],
        status: data.member.status || 'active',
        isConnected: data.member.isConnected ?? true,
      };

      console.log(data);

      console.log(data.member.nickname);

      Notify.create({
        type: 'info',
        message: `${data.member.nickname} joined ${channel.name}`,
        position: 'top',
      });
    }
  }

  private handleMemberLeft(data: { channelId: number; memberId: number }): void {
    const channelStore = useChannelStore();
    const channel = channelStore.getChannelById(data.channelId);

    if (channel && channel.members[data.memberId]) {
      const member = channelStore.getMemberById(data.memberId, data.channelId);
      const memberName = member?.nickname;
      channelStore.removeMember(data.channelId, data.memberId);

      Notify.create({
        type: 'info',
        message: `${memberName} left ${channel.name}`,
        position: 'top',
      });
    }
  }

  private handleMemberKicked(data: {
    channelId: number;
    memberId: number;
    userId: number;
    kickedBy: number;
  }): void {
    const channelStore = useChannelStore();
    const authStore = useAuthStore();
    const chatStore = useChatStore();
    const channel = channelStore.getChannelById(data.channelId);
    const dialogStore = useDialogStore();

    console.log(data);
    if (!channel) return;

    const isCurrentUser = data.userId === authStore.getCurrentUser?.id;

    if (isCurrentUser) {
      channelStore.removeChannel(data.channelId);
      if (chatStore.channel?.id === data.channelId) {
        chatStore.closeChat();
      }
      if (dialogStore.showMemberInfoDialog) {
        dialogStore.closeMemberInfo();
      }

      Notify.create({
        type: 'negative',
        message: `You have been kicked from ${channel.name}`,
        position: 'top',
      });
    } else if (channel.members[data.memberId]) {
      const member = channel.members[data.memberId];
      if (!member) return;
      const memberName = member.nickname || 'User';

      channelStore.removeMember(data.channelId, data.memberId);
      Notify.create({
        type: 'info',
        message: `${memberName} was kicked from ${channel.name}`,
        position: 'top',
      });
    }
  }

  private handleMemberTyping(data: {
    channelId: number;
    userId: number;
    typing: boolean;
    text?: string;
  }): void {
    const channelStore = useChannelStore();
    channelStore.updateMemberTyping(
      data.channelId,
      data.userId,
      data.typing ? data.text || 'typing...' : '',
    );
  }

  private handleMemberKickVote(data: {
    channelId: number;
    targetMemberId: number;
    voterId: number;
    voteCount: number;
  }): void {
    const channelStore = useChannelStore();
    const channel = channelStore.getChannelById(data.channelId);

    console.log(data);

    if (channel && channel.members[data.targetMemberId]) {
      const member = channel.members[data.targetMemberId];
      if (member) {
        member.kickVotes = data.voteCount;

        if (!member.receivedKickVotes) {
          member.receivedKickVotes = [];
        }

        if (!member.receivedKickVotes.includes(data.voterId)) {
          member.receivedKickVotes.push(data.voterId);
        }
      }
    }
  }

  private handleNotifStatusUpdated(data: { channelId: number; notifStatus: NotifStatus }): void {
    console.log('Notif status updated');
    console.log(data.notifStatus);
    const channelStore = useChannelStore();
    const channel = channelStore.getChannelById(data.channelId);

    if (!channel) return;

    channel.notifStatus = data.notifStatus;
  }
}
