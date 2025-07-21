import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import {
  Game,
  GameTurn,
  GameTurnHistoryResponse,
  GameTurnCreateResponse,
  AddColorRequest, GameResponseDto
} from '../../shared/models/room.model';

@Injectable({ providedIn: 'root' })
export class GameTurnService {
  constructor(private http: HttpClient) {}

  getGame(gameId: string) {
    return this.http.get<{ success: boolean; message: string; data: GameResponseDto }>(
      `${environment.apiBaseUrl}/games/${gameId}`,
      { withCredentials: true }
    );
  }

  getTurnsByGame(gameId: string): Observable<GameTurnHistoryResponse> {
    return this.http.get<GameTurnHistoryResponse>(
      `${environment.apiBaseUrl}/game-turns/game/${gameId}`,
      { withCredentials: true }
    );
  }

  addColor(req: AddColorRequest) {
    return this.http.post(
      `${environment.apiBaseUrl}/game-turns/add`,
      req,
      { withCredentials: true }
    );
  }

  createTurn(gameId: string, sequenceInput: AddColorRequest['sequenceInput']): Observable<GameTurnCreateResponse> {
    return this.http.post<GameTurnCreateResponse>(
      `${environment.apiBaseUrl}/game-turns`,
      { gameId, sequenceInput },
      { withCredentials: true }
    );
  }
}
