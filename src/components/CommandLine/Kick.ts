import { useChannelStore } from 'src/stores/channelStore';
import { Notify } from 'quasar';
import { useAuthStore } from 'src/stores/auth-store';
import { storeToRefs } from 'pinia';

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
  const authStore = useAuthStore();
  const { getCurrentUser } = storeToRefs(authStore);
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

      const targetNick = args[1];
      const filteredMembers = Object.values(channel.members).filter(
        (member) => member.nickname === targetNick,
      );
      if (filteredMembers.length === 0 || !filteredMembers[0])
        return Notify.create({
          type: 'negative',
          message: 'User not found in channel',
          position: 'top',
        });

      channelStore.incrementKickCounter(
        filteredMembers[0].id,
        channel.id,
        getCurrentUser.value!.id,
      );
    },
  };
}
