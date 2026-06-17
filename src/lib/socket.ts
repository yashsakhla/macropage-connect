import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io(
      import.meta.env.VITE_SOCKET_URL || 'https://macropage-connect.onrender.com',
      {
        autoConnect:          false,
        withCredentials:      true,
        transports:           ['websocket', 'polling'],
        reconnection:         true,
        reconnectionAttempts: 5,
        reconnectionDelay:    1000,
        reconnectionDelayMax: 5000,
        timeout:              20000,
      }
    )
  }
  return socket
}

export function connectSocket(token: string) {
  const s = getSocket()
  s.auth = { token }
  if (!s.connected) s.connect()
}

export function disconnectSocket() {
  if (socket?.connected) socket.disconnect()
}

export function getSocketId(): string | undefined {
  return socket?.id
}
