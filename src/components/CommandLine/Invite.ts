import { Notify } from 'quasar';
import { useChannelStore } from 'src/stores/channelStore';

export default function Invite() {
  /*
  /invite nickName
  Pozve používateľa do kanála
  Pravidlá:
  - do súkromného len správca môže
  - do verejného pozýva ktorýkoľvek člen
  Korelácia:
  - páruje sa s /revoke a /kick
  */
  const channelStore = useChannelStore();
  return {
    cmd: 'invite',
    execute: (args: string[]) => {
      if (args.length !== 2)
        return Notify.create({
          type: 'negative',
          message: 'Usage: /revoke channelName userName',
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

      channelStore.inviteUserAction(channel?.id, user.id);
    },
  };
}
