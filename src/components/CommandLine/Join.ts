import { Notify } from 'quasar';
import { joinChannel } from 'src/services/channelService';

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

  return {
    cmd: 'join',
    execute: (args: string[]) => {
      if (args.length === 0)
        return Notify.create({
          type: 'negative',
          message: 'Usage: /join channelName',
        });
      joinChannel(args[0] as string);
    },
  };
}
