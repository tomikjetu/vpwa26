import { useChatStore } from 'src/stores/chat-store';
import { useChannelStore } from 'src/stores/channelStore';

export default function Open() {
  const chatStore = useChatStore();
  const channelStore = useChannelStore();

  return {
    cmd: 'open',
    execute: (args: string[]) => {
      if (args.length === 0 || !args[0]) return;
      const channel = channelStore.channels.find((ch) => ch.name === args[0]);
      if (!channel) return;
      chatStore.openChat(channel);
    },
  };
}
