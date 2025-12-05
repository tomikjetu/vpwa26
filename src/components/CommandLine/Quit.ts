import { useChannelStore } from 'src/stores/channel';
import { Notify } from 'quasar';

export default function Quit() {
  const channelStore = useChannelStore();
  return {
    cmd: 'quit',
    execute: (args: string[]) => {
      if (args.length === 0 || !args[0])
        return Notify.create({
          type: 'negative',
          message: 'Usage: /quit channelName',
          position: 'top',
        });
      const channel = channelStore.channels.find((ch) => ch.name === args[0]);
      if (!channel)
        return Notify.create({
          type: 'negative',
          message: 'Channel not found',
          position: 'top',
        });
      channelStore.quitChannelAction(channel.id);
    },
  };
}
