import { useAuthStore } from 'src/stores/auth-store';
import { useChannelStore } from 'src/stores/channelStore';
import type { Member } from 'src/utils/types';
// import { getSocket } from "./socketService"
import type { Channel } from 'src/utils/types'
import { Notify } from 'quasar';

const auth = useAuthStore();
const channelStore = useChannelStore();
export function createChannel(name: string, isPublic: boolean) {
  //🧦 const socket = getSocket()
  // const payload = { name }
  const user = auth.getCurrentUser;
  if (!user) return;

  // mapping from User to Member
  const mbs = {
    [user.id]: {
      id: user.id,
      nickname: user.nickName,
      isOwner: true,
      kickVotes: 0,
      kickVoters: [],
      currentlyTyping: '',
    },
  } as Record<number, Member>;
  const Channel = {
    id: Date.now(), // Temporary ID, replace with server-generated ID
    ownerId: auth.getCurrentUser?.id ?? 0, // Replace with actual owner ID or fallback
    name,
    createdAt: new Date(),
    updatedAt: new Date(),
    joinedAt: new Date(),
    description: '',
    icon: isPublic ? 'group' : 'lock',
    color: 'blue',
    infoColor: '#FFFFFF',
    isPublic,
    hasUnreadMsgs: false,
    members: mbs,
  };

  channelStore.addChannel(Channel);

  //🧦 socket.emit("channel:create", payload)
}

/* owner only */
export function revokeUserFromChannel(channelId: number, userId: number) {
  console.log(channelId, userId);
}
export function quitChannel(channelId: number) {
  console.log(channelId);
}
/* owner only for private */
export function inviteUserToChannel(channelId: number, userId: number) {
  console.log(channelId, userId);
}
/* public */
export function joinChannel(channelName: string) {
  console.log(channelName);
  const Channel = {
    id: Date.now(), // Temporary ID, replace with server-generated ID
    ownerId: 1, // Replace with actual owner ID
    name: channelName,
    createdAt: new Date(),
    updatedAt: new Date(),
    joinedAt: new Date(),
    description: '',
    icon: 'group',
    color: 'blue',
    infoColor: '#FFFFFF',
    isPublic: false,
    hasUnreadMsgs: false,
    members: [],
  };

  channelStore.addChannel(Channel);
}
export function cancelChannel(channelId: number) {
  const channelStore = useChannelStore();
  channelStore.removeChannel(channelId);
  console.log(channelId);
}
export function kickUserFromChannel(channelId: number, userId: number) {
  const currentUser = auth.getCurrentUser;
  console.log(currentUser);
  console.log(channelId, userId);
  // channelStore.incrementKickCounter(
  //   filteredMembers[0].id,
  //   channel.id,
  //   getCurrentUser.value!.id,
  // );
}

export function acceptChannelInvite(channelInviteId: number) {
  const channelInvite = channelStore.getChannelInviteById(channelInviteId)
  if(!channelInvite || !channelInvite.name) return
  
  channelStore.addChannel({
    id: 3, // Temporary ID, replace with server-generated ID
    ownerId: 3, // Replace with actual owner ID or fallback
    name: "Channel_3",
    createdAt: new Date(),
    updatedAt: new Date(),
    joinedAt: new Date(),
    description: '',
    icon: 'lock',
    color: 'red',
    infoColor: 'red',
    isPublic: false,
    hasUnreadMsgs: false,
    members: {
      3: {
            id: 3,
            nickname: 'Alice',
            isOwner: true,
            kickVotes: 0,
            currentlyTyping: '',
            kickVoters: [],
      },
      [auth.getCurrentUser ? auth.getCurrentUser.id : 7]: {
        id: auth.getCurrentUser ? auth.getCurrentUser.id : 7,
        nickname: 'Jur',
        isOwner: false,
        kickVotes: 0,
        currentlyTyping: '',
        kickVoters: [],
      },
    },
  });

  channelStore.addMessages([
    {
      user: 3,
      text: 'This is a secret channel which only you have been invited to',
      time: new Date(),
      files: [],
      userNickname: 'Alice',
    },
  ], 3)

  channelStore.removeInvite(channelInviteId)
}

export function declineChannelInvite(channelInviteId: number) {
  const channelInvite = channelStore.getChannelInviteById(channelInviteId)
  if(!channelInvite) return
  channelStore.removeInvite(channelInviteId)
}

export function msgNotif(name: string, text: string, onClick: () => void) {
  const maxLength = 30
  const shortText = text.length > maxLength
    ? text.slice(0, maxLength).trimEnd() + '...'
    : text

  const shortName = name.length > maxLength
    ? name.slice(0, maxLength).trimEnd() + '...'
    : name

  const closeNotify = Notify.create({
    message: `<strong style="font-size: 18px; display: block; margin-bottom: 4px;">${shortName}</strong>`,
    caption: `<span style="font-size: 16px; line-height: 1.4;">${shortText}</span>`,
    color: 'white',
    textColor: 'black',
    position: 'bottom-right',
    timeout: 6000,
    progress: false,
    html: true,
    classes:
      'q-pa-lg q-ma-md shadow-4 rounded-2xl border cursor-pointer transition-all hover:bg-grey-2 messenger-notify',
    icon: 'account_circle',
    iconColor: 'blue-6',
    actions: [
      {
        icon: 'close',
        color: 'grey-8',
        handler: () => {
          event?.stopPropagation?.()
          closeNotify()
        }
      }
    ]
  })

  setTimeout(() => {
    const el = document.querySelector('.messenger-notify')
    if (el) {
      el.addEventListener('click', () => {
        onClick()
        closeNotify()
      })
    }
  }, 0)
}