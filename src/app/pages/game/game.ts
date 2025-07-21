import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { GameTurnService } from '../../core/services/game-turn.service';
import { AuthService } from '../../core/services/auth.service';
import { interval, Subject, takeUntil, switchMap, tap } from 'rxjs';
import { Game, GameTurn, ColorCell } from '../../shared/models/room.model';

type Phase = 'espera' | 'repetir' | 'agregarColor' | 'perdio' | 'gano';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game.html',
})
export class GamePage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private turnService = inject(GameTurnService);
  private authService = inject(AuthService);

  game = signal<Game | null>(null);
  turns = signal<GameTurn[]>([]);
  myPlayerId = signal<string | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  sequenceError = signal<string | null>(null);
  inputSequence = signal<ColorCell[]>([]);
  phase = signal<Phase>('espera');
  destroyed$ = new Subject<void>();

  ngOnInit() {
    const gameId = this.route.snapshot.paramMap.get('id')!;

    this.authService.fetchMe().subscribe(res => {
      this.myPlayerId.set(res?.data?.user?.id ?? null);
    });

    interval(1100)
      .pipe(
        takeUntil(this.destroyed$),
        switchMap(() => this.turnService.getTurnsByGame(gameId)),
        tap({
          next: res => {
            this.turns.set(res.data);
            this.updatePhase();
          }
        })
      ).subscribe();

    // Load game (one time)
    this.turnService.getGame(gameId).subscribe({
      next: res => {
        this.game.set(res.data);
        this.loading.set(false);
      },
      error: _ => this.error.set('No se pudo cargar el juego'),
    });

    // Load turns (initial)
    this.turnService.getTurnsByGame(gameId).subscribe({
      next: res => {
        this.turns.set(res.data);
        this.updatePhase();
      }
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  cols = computed(() =>
    this.game()?.room?.colorsConfig
      ? Math.max(...this.game()!.room.colorsConfig.map(c => c.x))
      : 1
  );
  rows = computed(() =>
    this.game()?.room?.colorsConfig
      ? Math.max(...this.game()!.room.colorsConfig.map(c => c.y))
      : 1
  );

  lastTurn = computed(() => {
    const arr = this.turns();
    return arr.length ? arr[arr.length - 1] : undefined;
  });

  isHost(): boolean {
    const g = this.game();
    const myId = this.myPlayerId();
    return !!g && !!myId && g.room.hostPlayerId === myId;
  }
  isSecond(): boolean {
    const g = this.game();
    const myId = this.myPlayerId();
    return !!g && !!myId && g.room.secondPlayerId === myId;
  }

  hasLost(): boolean {
    const last = this.lastTurn();
    return !!last && (last.isCorrect === false || last.isCorrect === 0) && last.playerId === this.myPlayerId();
  }
  hasWon(): boolean {
    const g = this.game();
    return !!g && !!g.winnerId && g.winnerId === this.myPlayerId();
  }

  updatePhase() {
    if (this.hasLost()) {
      this.phase.set('perdio');
      return;
    }
    if (this.hasWon()) {
      this.phase.set('gano');
      return;
    }

    const turns = this.turns();
    const last = this.lastTurn();
    const myId = this.myPlayerId();

    if (turns.length === 0 && this.isHost()) {
      this.phase.set('agregarColor');
      return;
    }
    if (turns.length === 0 && !this.isHost()) {
      this.phase.set('espera');
      return;
    }
    if (
      last &&
      last.playerId === myId &&
      (last.isCorrect === true || last.isCorrect === 1) &&
      !last.isTurnFinished
    ) {
      this.phase.set('agregarColor');
      return;
    }
    if (
      last &&
      last.isTurnFinished &&
      last.playerId !== myId
    ) {
      this.phase.set('repetir');
      return;
    }
    this.phase.set('espera');
  }

  canInteract(tablero: 'host' | 'second'): boolean {
    if (this.phase() === 'agregarColor') {
      if (tablero === 'host' && this.isHost()) return true;
      if (tablero === 'second' && this.isSecond()) return true;
    }
    if (this.phase() === 'repetir') {
      if (this.isHost() && tablero === 'host') return true;
      if (this.isSecond() && tablero === 'second') return true;
    }
    return false;
  }

  addColor(cell: ColorCell) {
    if (!this.canInteract(this.isHost() ? 'host' : 'second')) return;
    const gameId = this.game()!.id;
    this.turnService.addColor({ gameId, sequenceInput: [cell] }).subscribe({
      next: () => {
        this.sequenceError.set(null);
        this.inputSequence.set([]);
      },
      error: err => {
        this.sequenceError.set(err.error?.message || 'Error al agregar color');
      }
    });
  }

  selectInputColor(cell: ColorCell) {
    if (!this.canInteract(this.isHost() ? 'host' : 'second')) return;
    this.inputSequence.update(seq => [...seq, cell]);
  }

  clearSequence() {
    this.inputSequence.set([]);
  }

  canSendSequence(): boolean {
    return this.phase() === 'repetir' && this.inputSequence().length > 0 && !this.hasLost();
  }

  sendSequence() {
    if (!this.canSendSequence()) return;
    const gameId = this.game()!.id;
    this.turnService.createTurn(gameId, this.inputSequence()).subscribe({
      next: () => {
        this.sequenceError.set(null);
        this.clearSequence();
      },
      error: err => {
        this.sequenceError.set(err.error?.message || 'Error al enviar secuencia');
      }
    });
  }

  getLastSequenceColor(): ColorCell | null {
    const last = this.lastTurn();
    // Si ya hay al menos un color en la secuencia del último turno, úsalo
    if (last && last.currentSequence && last.currentSequence.length) {
      return last.currentSequence[last.currentSequence.length - 1];
    }
    // Si aún no hay turnos terminados, no mostramos nada
    return null;
  }

  getTurnMessage(): string {
    if (this.phase() === 'perdio') return '¡Has perdido!';
    if (this.phase() === 'gano') return '¡Has ganado!';
    if (this.phase() === 'agregarColor') return 'Secuencia correcta. Agrega un color nuevo.';
    if (this.phase() === 'repetir') return 'Repite la secuencia completa y da "Enviar secuencia".';
    return 'Esperando al otro jugador...';
  }
}
