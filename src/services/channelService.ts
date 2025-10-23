import { useAuthStore } from 'src/stores/auth-store';
import { useChannelStore } from 'src/stores/channelStore';
// import { getSocket } from "./socketService"
import type { Channel } from 'src/utils/types'

const auth = useAuthStore();
const channelStore = useChannelStore();
export function createChannel(name: string, isPublic: boolean) {
  //🧦 const socket = getSocket()
  // const payload = { name }
  const Channel = {
    id: Date.now(), // Temporary ID, replace with server-generated ID
    ownerId: auth.getCurrentUser?.id ?? 0, // Replace with actual owner ID or fallback
    name,
    createdAt: new Date(),
    updatedAt: new Date(),
    joinedAt: new Date(),
    description: '',
    icon: isPublic ? 'group' : 'lock',
    color: '#000000',
    infoColor: '#FFFFFF',
    isPublic,
    hasUnreadMsgs: false,
    members: {
      1760716592343: {
        id: 1760716592343,
        nickname: 'Jur',
        isOwner: false,
        kickVotes: 0,
        currentlyTyping: '',
        kickVoters: [],
      },
    },
  } as Channel;

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
    color: '#000000',
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
      1760716592343: {
        id: 1760716592343,
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
