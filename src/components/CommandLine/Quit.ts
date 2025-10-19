import { leaveChannel } from 'src/composables/useChannelList';
import { useChannelStore } from 'src/stores/channelStore';
import { Notify } from 'quasar';

export default function Quit() {
  const channelStore = useChannelStore();
  return {
    cmd: 'quit',
    execute: async (args: string[]) => {
      if (args.length === 0 || !args[0])
        return Notify.create({
          type: 'negative',
          message: 'Channel name is required',
          position: 'top',
        });
      const channel = channelStore.channels.find((ch) => ch.name === args[0]);
      if (!channel)
        return Notify.create({
          type: 'negative',
          message: 'Channel not found',
          position: 'top',
        });
      await leaveChannel(channel, channelStore.channels);
    },
  };
}
