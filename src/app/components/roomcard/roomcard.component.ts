import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-room-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './roomcard.component.html',
})
export class RoomCardComponent {
  @Input({ required: true }) room!: {
    id: string;
    name: string;
    state: string;
    colors: number;
    players: number;
    maxPlayers: number;
  };
  @Output() join = new EventEmitter<any>();
}
