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
    gfxImg.style.backgroundColor = this.location.color;
    gfxImg.style.borderColor = this.location.color;
  }

  handleUserInput(e) {
    const inputText = e.target.value.trim().toUpperCase();

    setTimeout(() => {
      e.preventDefault();
    });

    if (e.key !== 'Enter') return;
    console.log(`User input: '${inputText}'`);

    if (inputText === 'V') {
      document.getElementById('available-paths').innerHTML = `NORTH or N, SOUTH or S, <br>
      WEST or W, EAST or E <br>
      TAKE (object) or T (object) <br>
      DROP (object) or D (object) <br>
      USE (object) or U (object) <br>
      GOSSIPS or G, VOCABULARY or V`;

      document.getElementById('carried-items').textContent = 'Press any key';
      document.getElementById('what-now').style.display = 'none';
      document.querySelector('body').addEventListener(
        'input',
        () => {
          document.getElementById('available-paths').textContent = `You can go ${this.location.availablePaths}`;
          document.getElementById('what-now').style.display = 'flex';
          document.getElementById('carried-items').textContent = '';
        },
        { once: true }
      );

      console.log('Vocabulary:');
      return;
    }

    if (inputText === 'G') {
      document.getElementById('available-paths').innerHTML = `The  woodcutter lost  his home key... <br>
		  The butcher likes fruit... The cooper <br>
		  is greedy... Dratewka plans to make a <br>
		  poisoned  bait for the dragon...  The <br>
		  tavern owner is buying food  from the <br>
		  pickers... Making a rag from a bag... <br>`;

      document.getElementById('carried-items').textContent = 'Press any key';
      document.getElementById('what-now').style.display = 'none';
      document.querySelector('body').addEventListener(
        'input',
        () => {
          document.getElementById('available-paths').textContent = `You can go ${this.location.availablePaths}`;
          document.getElementById('what-now').style.display = 'flex';
          document.getElementById('carried-items').textContent = '';
        },
        { once: true }
      );

      console.log('Gossips:');
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
    gfxImg.style.backgroundColor = this.location.color;
    gfxImg.style.borderColor = this.location.color;

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
