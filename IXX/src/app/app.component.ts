import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { cz1Component } from './cz1/cz1.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, cz1Component],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'angular';
}
