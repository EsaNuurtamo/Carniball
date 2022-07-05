import { Mesh } from 'three'
import { GameState } from './index'
import { Vector3 } from 'three'
export interface Entity {
  id: string
  mesh: Mesh,
  remove: () => void,
  update?: (state?: GameState) => void
}

export interface EntityData {
  id: string
  position: Vector3
}


export interface ServerToClientEvents {
  update: (objects: EntityData[]) => void;
}

export interface ClientToServerEvents {
  playerJoined: (id: string, data: EntityData) => void;
}

export interface ClientToServerEvents {
  playerMoved: (id: string, data: EntityData) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  name: string;
  age: number;
}