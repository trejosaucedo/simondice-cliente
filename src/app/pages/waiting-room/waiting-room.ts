import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService } from '../../core/services/room.service';
import { AuthService } from '../../core/services/auth.service';
import { Room } from '../../shared/models/room.model';
import { interval, of, takeWhile } from 'rxjs';
import { catchError, startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-waiting-room',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './waiting-room.html',
})
export class WaitingRoomComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private roomService = inject(RoomService);
  private authService = inject(AuthService);

  room = signal<Room | null>(null);
  userId = signal<string | null>(null);

  constructor() {
    const roomId = this.route.snapshot.paramMap.get('id');

    if (roomId) {
      interval(3000)
        .pipe(
          startWith(0),
          switchMap(() => this.roomService.getRoomStatus(roomId).pipe(
            catchError(() => of(null))
          )),
          takeWhile((res) => res?.data?.status !== 'playing' && res?.data !== null, true)
        )
        .subscribe({
          next: (res) => {
            if (!res || !res.data) {
              this.router.navigate(['/rooms']);
              return;
            }

            this.room.set(res.data);

            // Redirección según el estado
            if (res.data.status === 'playing' && res.data.gameId) {
              this.router.navigate(['/game', res.data.gameId]);
            }

            if (res.data.secondPlayerId === null && this.isSecond()) {
              this.router.navigate(['/rooms']);
            }
          },
          error: () => this.router.navigate(['/rooms']),
        });
    }

    this.authService.fetchMe().subscribe({
      next: (res) => {
        this.userId.set(res?.data?.user?.id ?? null);
      },
      error: () => {
        this.userId.set(null);
      },
    });
  }

  cols = computed(() =>
    this.room()?.colorsConfig.length
      ? Math.max(...this.room()!.colorsConfig.map(c => c.x))
      : 1
  );

  rows = computed(() =>
    this.room()?.colorsConfig.length
      ? Math.max(...this.room()!.colorsConfig.map(c => c.y))
      : 1
  );

  isHost(): boolean {
    return !!this.room() && !!this.userId() && this.room()!.hostPlayerId === this.userId();
  }

  isSecond(): boolean {
    return !!this.room() && !!this.userId() && this.room()!.secondPlayerId === this.userId();
  }

  canStartGame(): boolean {
    return this.isHost() && !!this.room()?.secondPlayerId && this.room()?.status === 'waiting';
  }

  startGame() {
    if (!this.room()) return;

    this.roomService.startRoom(this.room()!.id).subscribe({
      next: (res) => {
        console.log('🔎 roomId:', res.data.id);
        console.log('🎯 gameId:', res.data.gameId);

        const gameId = res.data.gameId;
        this.router.navigate(['/game', gameId]);
      },
      error: (err) => {
        alert('No se pudo iniciar la partida: ' + (err?.error?.message || 'Error'));
      },
    });
  }

  leaveRoom() {
    if (!this.room()) return;
    this.roomService.leaveRoom(this.room()!.id).subscribe({
      next: () => this.router.navigate(['/rooms']),
      error: () => this.router.navigate(['/rooms']),
    });
  }

  cancelRoom() {
    if (!this.room()) return;
    this.roomService.cancelRoom(this.room()!.id).subscribe({
      next: () => this.router.navigate(['/rooms']),
      error: () => this.router.navigate(['/rooms']),
    });
  }
}

