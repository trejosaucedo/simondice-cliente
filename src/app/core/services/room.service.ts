import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {
  CreateRoomRequest,
  RoomResponse,
  RoomsListResponse,
  RoomStatusResponse,
  RoomJoinResponse, GameStartResponse,
} from '../../shared/models/room.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RoomService {
  #http = inject(HttpClient);

  getRooms(): Observable<RoomsListResponse> {
    return this.#http.get<RoomsListResponse>(`${environment.apiBaseUrl}/rooms`);
  }

  createRoom(payload: CreateRoomRequest): Observable<RoomResponse> {
    return this.#http.post<RoomResponse>(`${environment.apiBaseUrl}/rooms`, payload, {
      withCredentials: true,
    });
  }

  joinRoom(roomId: string): Observable<RoomJoinResponse> {
    return this.#http.post<RoomJoinResponse>(
      `${environment.apiBaseUrl}/rooms/${roomId}/join`,
      {},
      { withCredentials: true }
    );
  }

  getRoomStatus(roomId: string): Observable<RoomStatusResponse> {
    return this.#http.get<RoomStatusResponse>(
      `${environment.apiBaseUrl}/rooms/${roomId}/status`,
      { withCredentials: true }
    );
  }

  startRoom(roomId: string): Observable<GameStartResponse> {
    return this.#http.post<GameStartResponse>(
      `${environment.apiBaseUrl}/rooms/${roomId}/start`,
      {},
      { withCredentials: true }
    );
  }


  leaveRoom(roomId: string): Observable<RoomResponse> {
    return this.#http.post<RoomResponse>(
      `${environment.apiBaseUrl}/rooms/${roomId}/leave`,
      {},
      { withCredentials: true }
    );
  }

  cancelRoom(roomId: string): Observable<RoomResponse> {
    return this.#http.post<RoomResponse>(
      `${environment.apiBaseUrl}/rooms/${roomId}/cancel`,
      {},
      { withCredentials: true }
    );
  }
}
