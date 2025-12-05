import { useChatStore } from 'src/stores/chat';
import { useChannelStore } from 'src/stores/channel';
import { Notify } from 'quasar';

export default function Open() {
  const chatStore = useChatStore();
  const channelStore = useChannelStore();

  return {
    cmd: 'open',
    execute: async (args: string[]) => {
      if (args.length === 0 || !args[0])
        return Notify.create({
          type: 'negative',
          message: 'Usage: /open channelName',
          position: 'top',
        });
      const channel = channelStore.channels.find((ch) => ch.name === args[0]);
      if (!channel)
        return Notify.create({
          type: 'negative',
          message: 'Channel not found',
          position: 'top',
        });
      await chatStore.openChat(channel);
    },
  };
}
