/**
 * Socket.IO composable for raid real-time communication.
 */

import { io, Socket } from 'socket.io-client'
import { useRaidStore } from '~/stores/useRaidStore'
import { useAuthStore } from '~/stores/useAuthStore'

let socket: Socket | null = null

export function useRaidSocket() {
  const config = useRuntimeConfig()
  const raid = useRaidStore()
  const auth = useAuthStore()

  function connect() {
    if (socket?.connected) return

    const wsUrl = config.public.apiBase || 'http://localhost:3333'

    socket = io(wsUrl, {
      path: '/ws',
      withCredentials: true,
      auth: {
        userId: auth.user?.id,
        username: auth.user?.username,
      },
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      raid.connected = true
    })

    socket.on('disconnect', () => {
      raid.connected = false
    })

    // Room state updates (lobby + combat)
    socket.on('raid:room_state', (data) => {
      raid.updateRoomState(data)
    })

    // Combat started
    socket.on('raid:combat_start', (data) => {
      raid.updateRoomState(data)
    })

    // Combat tick (every second during combat)
    socket.on('raid:tick', (data) => {
      raid.updateTick(data)
    })

    // Raid result (victory or defeat)
    socket.on('raid:result', (data) => {
      raid.setResult(data)
      // Reload game state to get rewards
      if (data.victory) {
        setTimeout(() => auth.loadGameState(), 2000)
      }
    })

    // Room disbanded (host left)
    socket.on('raid:disbanded', () => {
      raid.reset()
    })

    // Lobbies updated (for refresh)
    socket.on('raid:lobbies_updated', () => {
      listLobbies()
    })

    // Pending result from a previous raid (reconnect notification)
    socket.on('raid:pending_result', (data) => {
      raid.setPendingResult(data)
      // Reload game state to get rewards
      if (data.victory) {
        setTimeout(() => auth.loadGameState(), 1000)
      }
    })
  }

  function disconnect() {
    if (socket) {
      socket.disconnect()
      socket = null
      raid.connected = false
    }
  }

  function createRoom(generation: number): Promise<any> {
    return new Promise((resolve) => {
      socket?.emit('raid:create', { generation }, (response: any) => {
        if (response.room) {
          raid.updateRoomState(response.room)
        }
        resolve(response)
      })
    })
  }

  function joinRoom(code: string): Promise<any> {
    return new Promise((resolve) => {
      socket?.emit('raid:join', { code: code.toUpperCase() }, (response: any) => {
        if (response.room) {
          raid.updateRoomState(response.room)
        }
        resolve(response)
      })
    })
  }

  function leaveRoom(): Promise<any> {
    return new Promise((resolve) => {
      socket?.emit('raid:leave', {}, (response: any) => {
        if (response.ok) {
          raid.reset()
        }
        resolve(response)
      })
    })
  }

  function setTeam(team: any[]): Promise<any> {
    return new Promise((resolve) => {
      socket?.emit('raid:set_team', { team }, (response: any) => {
        resolve(response)
      })
    })
  }

  function setReady(ready: boolean): Promise<any> {
    return new Promise((resolve) => {
      socket?.emit('raid:ready', { ready }, (response: any) => {
        resolve(response)
      })
    })
  }

  function listLobbies(generation?: number): Promise<any> {
    return new Promise((resolve) => {
      socket?.emit('raid:list_lobbies', { generation }, (response: any) => {
        if (response.lobbies) {
          raid.lobbies = response.lobbies
        }
        resolve(response)
      })
    })
  }

  return {
    connect,
    disconnect,
    createRoom,
    joinRoom,
    leaveRoom,
    setTeam,
    setReady,
    listLobbies,
  }
}
