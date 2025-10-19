import { useChannelStore } from 'src/stores/channelStore';
// import { getSocket } from "./socketService"

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
    members: []
  };

  channelStore.addChannel(Channel);

  //🧦 socket.emit("channel:create", payload)
}
