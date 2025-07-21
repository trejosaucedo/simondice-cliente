import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RoomService } from '../../core/services/room.service';
import { CreateRoomRequest } from '../../shared/models/room.model';

/* Utilidad para el grid cuadrado */
function bestGrid(n: number) {
  const cols = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);
  return { rows, cols };
}

@Component({
  selector: 'app-room-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-config.html',
})
export class RoomConfigComponent {
  private router = inject(Router);
  private roomService = inject(RoomService);

  name = signal('');
  cantidad = signal(4);
  grid = computed(() => bestGrid(this.cantidad()));
  colores = signal<{ x: number; y: number; hex: string }[]>([]);
  loading = signal(false);

  allSelected = computed(
    () => this.colores().every((c) => c.hex) && !!this.name().trim()
  );

  error = signal<string | null>(null);

  constructor() {
    effect(() => {
      const n = this.cantidad();
      const g = bestGrid(n);
      this.colores.set(
        Array.from({ length: n }).map((_, i) => ({
          x: (i % g.cols) + 1,
          y: Math.floor(i / g.cols) + 1,
          hex: '',
        }))
      );
    });
  }

  setColor(idx: number, hex: string) {
    const copy = [...this.colores()];
    copy[idx] = { ...copy[idx], hex };
    this.colores.set(copy);
  }

  create() {
    if (!this.allSelected() || this.loading()) return;
    this.loading.set(true);
    this.error.set(null);

    const payload: CreateRoomRequest = {
      name: this.name(),
      colorsConfig: this.colores(),
      cantidadColores: this.cantidad(),
    };

    this.roomService.createRoom(payload).subscribe({
      next: (res) => {
        this.loading.set(false);
        console.log('Room creado:', res);

        const roomId = res.data.id;
        if (!roomId) {
          alert('No se recibió roomId, revisa la respuesta:\n' + JSON.stringify(res));
          return;
        }
        this.router.navigate(['/waiting-room', roomId]);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          err.error?.message || 'Error al crear la sala. Intenta nuevamente.'
        );
      },
    });


  }
}
