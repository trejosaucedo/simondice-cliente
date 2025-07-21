import { Component } from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-guest-layout',
  imports: [
    RouterOutlet,
    RouterLink
  ],
  templateUrl: './guest-layout.html',
})
export class GuestLayout {

}
