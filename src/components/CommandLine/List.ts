import { Notify } from 'quasar';
import { useChannelStore } from 'src/stores/channel';

export default function List() {
  const channelStore = useChannelStore();
  return {
    cmd: 'list',
    execute: (args: string[]) => {
      if (args.length !== 1)
        return Notify.create({
          type: 'negative',
          message: 'Usage: /list channelName',
        });

      const channel = channelStore.channels.find((ch) => ch.name === args[0]);
      if (!channel)
        return Notify.create({
          type: 'negative',
          message: `Channel ${args[0]} not found`,
        });
      console.log('LIST');
      channelStore.listMembersAction(channel?.id);
    },
  };
}
