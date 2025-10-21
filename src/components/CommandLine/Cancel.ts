import { useChannelStore } from 'src/stores/channelStore';
import { Notify } from 'quasar';
import { cancelChannel } from 'src/services/channelService';

export default function Cancel() {
  /*
  /cancel
  Zruší prebiehajúci príkaz alebo akciu
  Korelácia:
  - môže sa použiť na zrušenie /join
  - neusmerňuje práva alebo členstvo
  */
  const channelStore = useChannelStore();
  return {
    cmd: 'cancel',
    execute: (args: string[]) => {
      if (args.length === 0)
        return Notify.create({
          type: 'negative',
          message: 'Usage: /cancel channelName',
        });

      const channel = channelStore.channels.find((ch) => ch.name === args[0]);
      if (!channel)
        return Notify.create({
          type: 'negative',
          message: `Channel ${args[0]} not found`,
        });
      cancelChannel(channel.id);
    },
  };
}
