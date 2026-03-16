import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `
    <app-navbar></app-navbar>
    <div class="pt-3">
      <router-outlet></router-outlet>
    </div>
  `,
})
export class AppComponent {}
