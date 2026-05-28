import { Component, signal, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('symulator-pralki');

  modes = [
    {
      index: 0,
      name: 'Eko',
      time: 60,
      temp: 30,
    },
    {
      index: 1,
      name: 'Bawełna',
      time: 120,
      temp: 40,
    },
    {
      index: 2,
      name: 'Syntetyki',
      time: 90,
      temp: 40,
    },
    {
      index: 3,
      name: 'Gotowanie - Program Ciężki',
      time: 180,
      temp: 90,
    },
  ];

  modeActive: number | null = null;

  status: 'idle' | 'running' = 'idle';

  getMode() {
    const m = this.modes.find((m) => m.index === this.modeActive);
    return m;
  }

  chooseMode(index: number, event: any) {
    if (event.altKey) {
      const mode = this.modes.find((m) => m.index === index);
      console.log('TEST:');
      console.log(' - nazwa: ' + mode?.name);
      console.log(' - temperatura: ' + mode?.temp);
    }
    this.modeActive = index;
  }

  startPranie() {
    this.status = 'running';
  }
}
