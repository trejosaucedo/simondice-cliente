import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { RoomService } from '../../core/services/room.service';
import { Room } from '../../shared/models/room.model';
import { Observable, interval } from 'rxjs';
import { switchMap, map, startWith } from 'rxjs/operators';
import { RoomCardComponent } from '../../components/roomcard/roomcard.component';

interface RoomCardViewModel {
  id: string;
  name: string;
  state: 'waiting' | 'playing' | 'finished' | 'canceled';
  colors: number;
  players: number;
  maxPlayers: number;
  _original: Room;
}

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [AsyncPipe, RoomCardComponent, RouterLink],
  templateUrl: './lobby.html',
})
export class Lobby {
  private roomService = inject(RoomService);
  private router = inject(Router);

  rooms$: Observable<RoomCardViewModel[]> = interval(5000).pipe(
    startWith(0),
    switchMap(() => this.roomService.getRooms()),
    map(res =>
      res.data.map((room: Room) => ({
        id: room.id,
        name: room.name,
        state: room.status,
        colors: room.cantidadColores,
        players: [room.hostPlayerId, room.secondPlayerId].filter(Boolean).length,
        maxPlayers: 2,
        _original: room,
      }))
    )
  );

  joinRoom(room: RoomCardViewModel) {
    this.roomService.joinRoom(room.id).subscribe({
      next: () => {
        this.router.navigate(['/waiting-room', room.id]);
      },
      error: (err) => {
        alert('No se pudo unir a la sala: ' + (err?.error?.message || 'Error'));
      }
    });
  }
}
