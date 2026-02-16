import Location from './locations.js';

const allowedCommands = ['n', 'e', 's', 'w', 'north', 'east', 'south', 'west', 'v'];

export class Game {
  start() {
    this.location = new Location(7, 4);

    document.getElementById('location-desc').textContent = this.location.desc;
    document.getElementById('available-paths').textContent = `You can go ${this.location.availablePaths}`;

    document.getElementById('user-input').addEventListener('keydown', this.#handleUserInput.bind(this));

    const gfxImg = document.getElementById('gfx-img');
    gfxImg.src = `assets/img/${this.location.img}`;
    gfxImg.style.backgroundColor = `rgb(${this.location.color.join(',')})`;
  }

  #handleUserInput(e) {
    if (e.key !== 'Enter') return;

    const inputText = e.target.value.trim().toLowerCase();
    e.target.value = '';
    if (!allowedCommands.includes(inputText)) {
      const whatNowtext = document.getElementById('what-now-text');
      whatNowtext.textContent = 'Try another word or "V" for vocabulary.';
      e.target.style.display = 'none';
      setTimeout(() => {
        whatNowtext.textContent = 'What now?';
        e.target.style.display = 'block';
      }, 2000);
      return;
    }

    if (inputText === 'v') {
      console.log('Vocabulary:');
      return;
    }

    const path = inputText[0];
    console.log(`You chose to go ${path}`);

    this.#move(path);
  }

  #move(path) {
    const availablePathsP = document.getElementById('available-paths');

    try {
      this.location.go(path);
      availablePathsP.textContent = `You can go ${this.location.availablePaths}`;
    } catch (error) {
      if (error.message === 'PATH_UNAVAILABLE') {
        availablePathsP.textContent = 'You cannot go that way.';
        setTimeout(() => {
          availablePathsP.textContent = `You can go ${this.location.availablePaths}`;
        }, 2000);
      } else {
        console.error(error);
      }
      return;
    }

    const gfxImg = document.getElementById('gfx-img');
    gfxImg.src = `assets/img/${this.location.img}`;
    gfxImg.style.backgroundColor = `rgb(${this.location.color.join(',')})`;

    const locationDescP = document.getElementById('location-desc');
    locationDescP.textContent = this.location.desc;
  }
}
