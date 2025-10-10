import { io, Socket } from "socket.io-client"
import { useChannelStore } from "src/stores/channelStore"

let socket: Socket | null = null

export function initSocket() {
  if (!socket) {
    socket = io(process.env.SOCKETURL) 

    socket.on("channel:created", (channel) => {
      useChannelStore().addChannel(channel)
    })
  }

  return socket
}

export function getSocket() {
  if (!socket) {
    throw new Error("Socket not initialized. Call initSocket() first.")
  }
  return socket
}
