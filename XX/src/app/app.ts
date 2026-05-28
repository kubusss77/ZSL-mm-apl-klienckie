import { Component, signal } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [DatePipe, CurrencyPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly czas = signal(Date.now());
  zarobki = signal(0);

  ngOnInit() {
    setInterval(() => {
      this.czas.set(Date.now());
    }, 1000);
  }

  wpiszZarobki(val: any) {
    console.log(val);
    this.zarobki.set(val);
  }
}
