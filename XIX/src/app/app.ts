import { Component, signal } from '@angular/core';
import { MC } from './mc/mc';

@Component({
  selector: 'app-root',
  imports: [MC],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('testApp');

  readonly photoUrl = 'https://static.vecteezy.com/vite/assets/photo-masthead-375-BoK_p8LG.webp';
  readonly photoWidth = 200;
  lightColor = 'red';
  readonly isLocked = false;

  statusText = '';
  userTyped = '';

  changeColor() {
    this.lightColor = 'blue';
  }

  onInput(event: any) {
    this.userTyped = event.target.value;
  }

  log(val: any) {
    console.log(val);
  }
}
