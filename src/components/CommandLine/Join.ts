import { Notify } from 'quasar';
import { joinChannel } from 'src/services/channelService';
import { useChannelStore } from 'src/stores/channelStore';

export default function Join() {
  /*
  /join channelName [private]
  Pripojí sa do kanála alebo ho vytvorí
  Pravidlá:
  - každý môže vytvoriť kanál cez /join
  - ak verejný kanál neexistuje, vytvorí sa
  - channelName je unikátny
  Korelácia:
  - súkromný vyžaduje pozvánku (/invite)
  */

  const channelStore = useChannelStore();
  return {
    cmd: 'join',
    execute: (args: string[]) => {
      if (args.length === 0)
        return Notify.create({
          type: 'negative',
          message: 'Usage: /join channelName',
        });

      const channel = channelStore.channels.find((ch) => ch.name === args[0]);
      if (!channel)
        return Notify.create({
          type: 'negative',
          message: `Channel ${args[0]} not found`,
        });

      joinChannel(channel?.id);
    },
  };
}
