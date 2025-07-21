export interface ColorCell {
  x: number;
  y: number;
  hex: string;
}

export interface Room {
  id: string;
  name: string;
  hostPlayerId: string;
  hostPlayerName: string;
  secondPlayerId: string | null;
  secondPlayerName: string | null;
  status: 'waiting' | 'playing' | 'finished' | 'canceled';
  colorsConfig: { x: number; y: number; hex: string }[];
  cantidadColores: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoomWithGameId extends Room {
  gameId: string;
}

export interface GameStartRoom {
  id: string;
  name: string;
  hostPlayerId: string;
  hostPlayerName: string;
  secondPlayerId: string;
  secondPlayerName: string;
  status: string;
  colorsConfig: { x: number; y: number; hex: string }[];
  cantidadColores: number;
  createdAt: string;
  updatedAt: string;
  gameId: string;
}

export interface GameStartResponse {
  success: boolean;
  message: string;
  data: GameStartRoom;
}

export interface RoomResponse {
  success: boolean;
  message: string;
  data: Room;
}

export interface RoomJoinResponse {
  success: boolean;
  message: string;
  data: Room;
}

export interface RoomStatusResponse {
  success: boolean;
  message: string;
  data: RoomWithGameId;
}

export interface RoomsListResponse {
  success: boolean;
  message: string;
  data: Room[];
}

export interface CreateRoomRequest {
  name: string;
  colorsConfig: ColorCell[];
  cantidadColores: number;
}

export interface GameTurn {
  id: string;
  gameId: string;
  playerId: string;
  turnNumber: number;
  sequenceInput: ColorCell[];
  isCorrect: boolean | number;
  isTurnFinished: boolean | number;
  createdAt: string;
  currentSequence: ColorCell[];
}

export interface Game {
  id: string;
  room: Room | RoomWithGameId;
  status: 'playing' | 'finished';
  winnerId: string | null;
  currentSequence: ColorCell[];
}
export interface GameResponseDto {
  id: string;
  room: Room;
  status: 'playing' | 'finished';
  winnerId: string | null;
  currentSequence: ColorCell[];
  createdAt: string;
  updatedAt: string;
}


export interface GameTurnHistoryResponse {
  success: boolean;
  message: string;
  data: GameTurn[];
}

export interface GameTurnCreateResponse {
  success: boolean;
  message: string;
  data: GameTurn;
}

export interface AddColorRequest {
  gameId: string;
  sequenceInput: ColorCell[];
}


