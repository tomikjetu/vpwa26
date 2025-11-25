import type { Socket } from 'socket.io-client';
import type { ISocketController } from './types';
import { useChannelStore } from 'src/stores/channelStore';
import { useAuthStore } from 'src/stores/auth-store';
import { Notify } from 'quasar';
import type { ChatMessagePayload, ServerReplyMsg } from 'src/utils/types';


/**
 * Handles message-related socket events
 */
export class MessageSocketController implements ISocketController {
  registerListeners(socket: Socket): void {
    // New message received
    socket.on('message:new', this.handleMessageNew.bind(this));

    // Message deleted
    socket.on('message:deleted', this.handleMessageDeleted.bind(this));

    // Message edited
    socket.on('message:edited', this.handleMessageEdited.bind(this));

    socket.on('msg:list', this.handleMessageList.bind(this));
  }

  cleanup(socket: Socket): void {
    socket.off('message:new');
    socket.off('message:deleted');
    socket.off('message:edited');
    socket.off('msg:list');
  }

  private handleMessageList(data: { messages: ServerReplyMsg[] }) : void {
    const channelStore = useChannelStore();

    for(const message of data.messages) {
      // Get file names
      const file_names : string[] = []
      for (const file of message.files) file_names.push(`${file.name}.${file.mime}`)

      // Transform backend message data
      const transformedMessage: ChatMessagePayload = {
        ...(message.id !== undefined && { id: message.id }),
        user: message.memberId,
        text: message.content,
        time: new Date(message.createdAt),
        files: file_names || [],
        userNickname: channelStore.getMemberById(message.memberId, message.channelId)?.nickname,
      };
      channelStore.messages.unshift(transformedMessage)
    }
    console.log(data.messages)

    if (channelStore._pendingResolve) {
      channelStore._pendingResolve()
      channelStore._pendingResolve = null
    }
  }



  private handleMessageNew(data: { channelId: number; message: ServerReplyMsg, memberId: number }): void {
    const channelStore = useChannelStore();
    const authStore = useAuthStore();
    const channel = channelStore.getChannelById(data.channelId);

    if (!channel) return;

    // Get file names
    const file_names : string[] = []
    for (const file of data.message.files) file_names.push(`${file.name}.${file.mime}`)
    
    // Transform backend message data
    const transformedMessage: ChatMessagePayload = {
      ...(data.message.id !== undefined && { id: data.message.id }),
      user: data.memberId,
      text: data.message.content,
      time: new Date(data.message.createdAt),
      files: file_names || [],
      userNickname: data.message.user.nick,
    };

    // Add message to store
    channelStore.addMessage(transformedMessage, data.channelId);
    console.log(data.message)
    console.log("message:new")
    // Mark as unread if not viewing this channel (handled by store)
    // Show notification if message is from another user
    if (transformedMessage.user !== authStore.getCurrentUser?.id) {
      Notify.create({
        type: 'info',
        message: `New message in ${channel.name}`,
        caption: transformedMessage.text.substring(0, 50),
        position: 'bottom-right',
        timeout: 3000,
      });
    }
  }

  private handleMessageDeleted(data: { channelId: number; messageId: number }): void {
    const channelStore = useChannelStore();
    const messages = channelStore.getMessages();
    const index = messages.findIndex((m: ChatMessagePayload) => m.id === data.messageId);

    if (index !== -1) {
      messages.splice(index, 1);
    }
  }

  private handleMessageEdited(data: { channelId: number; message: ChatMessagePayload }): void {
    const channelStore = useChannelStore();
    const messages = channelStore.getMessages();
    const index = messages.findIndex((m: ChatMessagePayload) => m.id === data.message.id);

    if (index !== -1 && messages[index]) {
      // Update message with backend data
      Object.assign(messages[index], {
        text: data.message.text,
        time: new Date(data.message.time),
        files: data.message.files || messages[index].files,
      });
    }
  }
}
