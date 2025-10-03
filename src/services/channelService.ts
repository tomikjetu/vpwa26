import { useChannelStore } from "src/stores/channelStore"
import { getSocket } from "./socketService"

export function createChannel(name: string) {
  const channelStore = useChannelStore()
  //🧦 const socket = getSocket()
  const payload = { name }
  let Channel = {
    id: Date.now(), // Temporary ID, replace with server-generated ID
    ownerId: 1, // Replace with actual owner ID
    name,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  channelStore.addChannel(Channel)


  //🧦 socket.emit("channel:create", payload)
}
