import Location from './locations.js';
import Items from './items.js';

const allowedDirections = ['N', 'E', 'S', 'W', 'NORTH', 'EAST', 'SOUTH', 'WEST'];

export class Game {
  start() {
    this.location = new Location(7, 4, Items.defaultPositions());
    this.items = new Items();

    document.getElementById('location-desc').textContent = this.location.desc;
    document.getElementById('available-paths').textContent = `You can go ${this.location.availablePaths}`;

    const visibleItems = 'You see ' + (this.location.itemsInSight().map(Items.idToFullName).join(', ') || 'nothing');
    document.getElementById('visible-items').textContent = visibleItems;

    const carriedItem = 'You are carrying ' + (this.items.carriedItem || 'nothing');
    document.getElementById('carried-item').textContent = carriedItem;

    document.getElementById('user-input').addEventListener('keyup', this.handleUserInput.bind(this));

    const gfxImg = document.getElementById('gfx-img');
    gfxImg.src = `assets/img/${this.location.img}`;
    gfxImg.style.backgroundColor = `rgb(${this.location.color.join(',')})`;
  }

  handleUserInput(e) {
    const inputText = e.target.value.trim().toUpperCase();

    setTimeout(() => {
      e.preventDefault();
    });

    if (e.key !== 'Enter') return;
    console.log(`User input: '${inputText}'`);

    if (inputText === 'V') {
      console.log('Vocabulary:');
      return;
    }

    if (inputText.startsWith('TAKE ') || inputText.startsWith('T ')) {
      this.#take(inputText.split(' ')[1]);
      return;
    }

    if (!allowedDirections.includes(inputText)) {
      const whatNowtext = document.getElementById('what-now-text');
      whatNowtext.textContent = 'Try another word or "V" for vocabulary.';
      e.target.style.display = 'none';
      setTimeout(() => {
        whatNowtext.textContent = 'What now?';
        e.target.style.display = 'block';
      }, 2000);
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

    const visibleItems = 'You see ' + (this.location.itemsInSight().map(Items.idToFullName).join(', ') || 'nothing');
    document.getElementById('visible-items').textContent = visibleItems;

    const carriedItem = 'You are carrying ' + (this.items.carriedItem || 'nothing');
    document.getElementById('carried-item').textContent = carriedItem;
  }

  #take(item) {
    try {
      this.items.carry(item);
      const carriedItem = 'You are carrying ' + this.items.carriedItem;
    } catch (error) {
      console.log(error.message);
    }
  }
}
