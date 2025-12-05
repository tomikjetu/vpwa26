import { Notify } from 'quasar';
import { useChannelStore } from 'src/stores/channel';

export default function Revoke() {
  /*
  /revoke nickName
  Odstráni používateľa zo súkromného kanála
  Pravidlá:
  - iba správca môže vykonať /revoke
  - nesie sa s /invite (opačná akcia)
  Korelácia:
  - v verejnom kanáli sa místo toho používa /kick
  */
  const channelStore = useChannelStore();
  return {
    cmd: 'revoke',
    execute: (args: string[]) => {
      if (args.length !== 2)
        return Notify.create({
          type: 'negative',
          message: 'Usage: /revoke channelName nickName',
        });

      const channel = channelStore.channels.find((ch) => ch.name === args[0]);
      if (!channel)
        return Notify.create({
          type: 'negative',
          message: `Channel ${args[0]} not found`,
        });

      const user = Object.values(channel.members).find((member) => member.nickname === args[1]);
      if (!user)
        return Notify.create({
          type: 'negative',
          message: `User ${args[1]} not found in channel ${args[0]}`,
        });

      channelStore.revokeUserAction(channel?.id, user.id);
    },
  };
}
