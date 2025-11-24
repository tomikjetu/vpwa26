import type { Socket } from 'socket.io-client';
import type { ISocketController } from './types';
import { useChannelStore } from 'src/stores/channelStore';
import { useAuthStore } from 'src/stores/auth-store';
import { useChatStore } from 'src/stores/chat-store';
import { Notify } from 'quasar';
import type { Member } from 'src/utils/types';

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
  }

  cleanup(socket: Socket): void {
    socket.off('member:joined');
    socket.off('member:left');
    socket.off('member:kicked');
    socket.off('member:typing');
    socket.off('member:kick-voted');
  }

  private handleMemberJoined(data: { channelId: number; member: Member }): void {
    const channelStore = useChannelStore();
    const channel = channelStore.getChannelById(data.channelId);

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
        status: data.member.status || 'offline',
      };

      Notify.create({
        type: 'info',
        message: `${data.member.nickname} joined ${channel.name}`,
        position: 'top',
      });
    }
  }

  private handleMemberLeft(data: { channelId: number; userId: number }): void {
    const channelStore = useChannelStore();
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
  }

  private handleMemberKicked(data: { channelId: number;  memberId : number, userId : number; kickedBy: number }): void {
    const channelStore = useChannelStore();
    const authStore = useAuthStore();
    const chatStore = useChatStore();
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
      const member = channel.members[data.memberId];
      if(!member) return
      const memberName = member.nickname || 'User';
      delete channel.members[data.memberId];

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

    console.log(data)

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
}
