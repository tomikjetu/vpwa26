import { useAuthStore } from 'src/stores/auth-store';
import { useChannelStore } from 'src/stores/channelStore';
// import { getSocket } from "./socketService"

const auth = useAuthStore();
export function createChannel(name: string) {
  const channelStore = useChannelStore();
  //🧦 const socket = getSocket()
  // const payload = { name }
  const Channel = {
    id: Date.now(), // Temporary ID, replace with server-generated ID
    ownerId: 1, // Replace with actual owner ID
    name,
    createdAt: new Date(),
    updatedAt: new Date(),
    joinedAt: new Date(),
    description: '',
    icon: 'default-icon.png',
    color: '#000000',
    infoColor: '#FFFFFF',
    isPublic: false,
    hasUnreadMsgs: false,
    members: [],
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
export function joinChannel(channelId: number) {
  console.log(channelId);
}
export function cancelChannel(channelId: number) {
  console.log(channelId);
}
export function kickUserFromChannel(channelId: number, userId: number) {
  const currentUser = auth.getCurrentUser;
  console.log(currentUser);
  console.log(channelId, userId);
}
