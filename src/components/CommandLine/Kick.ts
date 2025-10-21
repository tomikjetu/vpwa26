import { useChannelStore } from 'src/stores/channelStore';
import { Notify } from 'quasar';
import { kickUserFromChannel } from 'src/services/channelService';

export default function Kick() {
  /*
  /kick nickName
  Vyhodí používateľa z kanála
  Pravidlá:
  - vo verejnom môže člen vyhodiť iného
  - ak aspoň 3 členovia vyhodia, ban je trvalý
  - správca môže vyhodiť natrvalo kedykoľvek
  Korelácia:
  - správca môže zrušiť ban cez /invite
  */
  const channelStore = useChannelStore();
  return {
    cmd: 'kick',
    execute: (args: string[]) => {
      if (args.length != 2) {
        return Notify.create({
          type: 'negative',
          message: 'Usage: /kick channelName nickName',
          position: 'top',
        });
      }

      const channelName = args[0];
      const channel = channelStore.channels.find((ch) => ch.name === channelName);
      if (!channel) {
        return Notify.create({
          type: 'negative',
          message: 'Channel not found',
          position: 'top',
        });
      }

      const user = Object.values(channel.members).find((member) => member.nickname === args[1]);
      if (!user)
        return Notify.create({
          type: 'negative',
          message: `User ${args[1]} not found in channel ${args[0]}`,
        });

      kickUserFromChannel(channel.id, user.id);
    },
  };
}
