import { Component } from '@angular/core';

@Component({
  selector: 'czesc1',
  templateUrl: 'cz1.component.html',
  styleUrls: ['cz1.component.css'],
})
export class cz1Component {
  photoUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLe8oDl8hU1bDhQItV4AOXf41yga5R2SJP5w&s';
  photoWidth = 300;

  lightColor = 'green';

  isLocked = false;
}
