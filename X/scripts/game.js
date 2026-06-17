import Location, { locations } from './locations.js';
import Items, { items, itemDependencies } from './items.js';

const allowedDirections = ['N', 'E', 'S', 'W', 'NORTH', 'EAST', 'SOUTH', 'WEST'];
const mapDirections = {
  N: { dx: 0, dy: -1 },
  E: { dx: 1, dy: 0 },
  S: { dx: 0, dy: 1 },
  W: { dx: -1, dy: 0 },
};

function wait(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

export class Game {
  constructor() {
    this.location = null;
    this.itemsManager = null;
    this.mapOpen = false;
    this.godMode = false;
    document.querySelector('body').addEventListener('keydown', this.handleUserInput.bind(this));
    document.getElementById('user-input').addEventListener('blur', function (e) {
      setTimeout(() => {
        this.focus();
      });
    });
    this.setupMap();
  }

  start() {
    console.log('start');
    this.itemsManager = new Items();
    this.location = new Location(7, 4, this.itemsManager);

    this.updateUI();
  }

  async intro() {
    console.log('intro');
    document.getElementById('location-desc').style.display = 'none';
    document.getElementById('gfx').style.display = 'none';
    document.getElementById('available-paths').style.display = 'none';
    document.getElementById('visible-items').style.display = 'none';
    document.getElementById('carried-item').style.display = 'none';
    document.getElementById('what-now').style.display = 'none';

    document.querySelector('body').addEventListener(
      'keydown',
      async () => {
        document.getElementById('audio-intro').play();
        document.getElementById('intro-text').style.display = 'none';

        await wait(5000);
        document.getElementById('czolowka').style.opacity = '0';
        await wait(1000);
        document.getElementById('czolowka').style.display = 'none';

        const opisA = document.getElementById('opis_A');

        opisA.style.display = 'block';
        opisA.style.opacity = '0';
        await wait(100);
        opisA.style.opacity = '1';
        await wait(15000);
        opisA.style.opacity = '0';
        await wait(1000);
        opisA.style.display = 'none';

        const opisB = document.getElementById('opis_B');

        opisB.style.display = 'block';
        opisB.style.opacity = '0';
        await wait(100);
        opisB.style.opacity = '1';
        await wait(15000);
        opisB.style.opacity = '0';
        await wait(1000);
        opisB.style.display = 'none';

        document.getElementById('location-desc').style.display = 'block';
        document.getElementById('gfx').style.display = 'flex';
        document.getElementById('available-paths').style.display = 'block';
        document.getElementById('visible-items').style.display = 'block';
        document.getElementById('carried-item').style.display = 'block';
        document.getElementById('what-now').style.display = 'block';

        this.start();
      },
      { once: true }
    );
  }

  updateUI() {
    document.getElementById('location-desc').textContent = this.location.desc;
    document.getElementById('available-paths').textContent = `You can go ${this.location.availablePaths}`;

    const visibleItems = 'You see ' + (this.location.itemsInSight().map(Items.idToFullName).join(', ') || 'nothing');
    document.getElementById('visible-items').textContent = visibleItems;

    const carriedItem = 'You are carrying ' + this.itemsManager.getCarriedItemName();
    document.getElementById('carried-item').textContent = carriedItem;

    const gfxImg = document.getElementById('gfx-img');
    gfxImg.src = `assets/img/${this.location.img}`;
    gfxImg.style.backgroundColor = this.location.color;
    gfxImg.style.borderColor = this.location.color;

    const allowedPaths = this.location.paths();
    const allPaths = ['N', 'E', 'S', 'W'];
    for (const p of allPaths) {
      const el = document.getElementById('compass-' + p.toLowerCase());
      if (allowedPaths.includes(p)) {
        el.style.display = 'block';
      } else {
        el.style.display = 'none';
      }
    }

    this.updateMapCurrentLocation();
    this.updateMapTileDetails();
  }

  setupMap() {
    const map = document.getElementById('location-map');
    const toggle = document.getElementById('map-toggle');
    const close = document.getElementById('map-close');
    const overlay = document.getElementById('map-overlay');
    const godModeToggle = document.getElementById('godmode-toggle');

    if (!map || !toggle || !close || !overlay || !godModeToggle) return;

    this.renderMap(map);

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMap();
    });

    close.addEventListener('click', (e) => {
      e.stopPropagation();
      this.hideMap();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.hideMap();
      }
    });

    godModeToggle.addEventListener('change', () => {
      this.setGodMode(godModeToggle.checked);
    });
  }

  renderMap(map) {
    const locationEntries = Object.entries(locations).map(([id, location]) => {
      const numericId = Number(id);
      return {
        id: numericId,
        x: numericId % 10,
        y: Math.floor(numericId / 10),
        location,
      };
    });

    const xs = locationEntries.map(({ x }) => x);
    const ys = locationEntries.map(({ y }) => y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const locationsById = new Map(locationEntries.map((entry) => [entry.id, entry]));

    map.style.gridTemplateColumns = `repeat(${maxX - minX + 1}, var(--map-tile-width))`;
    map.replaceChildren();

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const id = y * 10 + x;
        const entry = locationsById.get(id);

        if (!entry) {
          const emptyTile = document.createElement('div');
          emptyTile.className = 'map-empty';
          map.appendChild(emptyTile);
          continue;
        }

        map.appendChild(this.createMapTile(entry, locationsById));
      }
    }
  }

  createMapTile({ id, x, y, location }, locationsById) {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'map-tile';
    tile.dataset.locationId = id;
    tile.dataset.x = x;
    tile.dataset.y = y;
    tile.dataset.desc = location.desc;
    tile.setAttribute('aria-label', location.desc);
    tile.style.setProperty('--tile-color', location.color);

    const img = document.createElement('img');
    img.src = `assets/img/${location.img}`;
    img.alt = location.desc;
    tile.appendChild(img);

    for (const path of location.paths) {
      const direction = mapDirections[path];
      const targetId = (y + direction.dy) * 10 + x + direction.dx;

      if (locationsById.has(targetId)) {
        const pathMarker = document.createElement('span');
        pathMarker.className = `map-path ${path.toLowerCase()}`;
        tile.appendChild(pathMarker);
      }
    }

    const idLabel = document.createElement('span');
    idLabel.className = 'map-location-id';
    idLabel.textContent = id;
    tile.appendChild(idLabel);

    const godModeBadge = document.createElement('span');
    godModeBadge.className = 'map-godmode-badge';
    tile.appendChild(godModeBadge);

    tile.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.godMode) {
        this.teleportToLocation(x, y);
      }
      this.showMapTooltip(tile);
    });

    tile.addEventListener('mouseenter', () => {
      this.showMapTooltip(tile);
    });

    tile.addEventListener('mousemove', () => {
      this.positionMapTooltip(tile);
    });

    tile.addEventListener('mouseleave', () => {
      this.hideMapTooltip();
    });

    tile.addEventListener('focus', () => {
      this.showMapTooltip(tile);
    });

    tile.addEventListener('blur', () => {
      this.hideMapTooltip();
    });

    return tile;
  }

  teleportToLocation(x, y) {
    if (!this.location) return;

    this.location.x = x;
    this.location.y = y;
    this.updateUI();
    document.getElementById('user-input').focus();
  }

  toggleMap() {
    if (this.mapOpen) {
      this.hideMap();
    } else {
      this.showMap();
    }
  }

  setGodMode(enabled) {
    const overlay = document.getElementById('map-overlay');
    const godModeToggle = document.getElementById('godmode-toggle');

    this.godMode = enabled;
    overlay.classList.toggle('godmode', enabled);
    godModeToggle.checked = enabled;
    this.updateMapTileDetails();
  }

  showMap() {
    const overlay = document.getElementById('map-overlay');
    const toggle = document.getElementById('map-toggle');

    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    this.mapOpen = true;
    document.getElementById('godmode-toggle').checked = this.godMode;
    overlay.classList.toggle('godmode', this.godMode);
    this.updateMapCurrentLocation();
    this.updateMapTileDetails();
  }

  hideMap() {
    const overlay = document.getElementById('map-overlay');
    const toggle = document.getElementById('map-toggle');

    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    this.mapOpen = false;
    this.hideMapTooltip();
    document.getElementById('user-input').focus();
  }

  updateMapCurrentLocation() {
    document.querySelectorAll('.map-tile.current').forEach((tile) => {
      tile.classList.remove('current');
    });

    if (!this.location) return;

    const currentTile = document.querySelector(`.map-tile[data-location-id="${this.location.id}"]`);
    if (currentTile) {
      currentTile.classList.add('current');
    }
  }

  updateMapTileDetails() {
    document.querySelectorAll('.map-tile').forEach((tile) => {
      const locationId = Number(tile.dataset.locationId);
      const location = locations[locationId];
      const itemNames = this.itemsManager
        ? this.itemsManager.getItemsAtLocation(locationId).map(Items.idToFullName).join(', ')
        : '';
      const itemsText = `Items: ${itemNames || 'nothing'}`;
      const godModeEvents = this.getLocationGodModeEvents(locationId);
      const godModeText = godModeEvents.length ? `Events:\n${godModeEvents.join('\n')}` : 'Events: nothing';
      const img = tile.querySelector('img');
      const godModeBadge = tile.querySelector('.map-godmode-badge');

      tile.dataset.desc = location.desc;
      tile.dataset.items = itemsText;
      tile.dataset.godmode = godModeText;
      tile.dataset.tooltip = this.godMode ? `${location.desc}\n${itemsText}\n${godModeText}` : `${location.desc}\n${itemsText}`;
      tile.style.setProperty('--tile-color', location.color);
      tile.setAttribute('aria-label', `${location.desc}. ${itemsText}`);
      tile.classList.toggle('godmode-location', godModeEvents.length > 0);

      if (godModeBadge) {
        godModeBadge.textContent = godModeEvents.length;
      }

      if (img) {
        img.src = `assets/img/${location.img}`;
        img.alt = location.desc;
      }
    });

    const activeTile = document.querySelector('.map-tile:hover, .map-tile:focus-visible');
    if (activeTile && this.mapOpen) {
      this.showMapTooltip(activeTile);
    }
  }

  getLocationGodModeEvents(locationId) {
    return Object.entries(itemDependencies)
      .filter(([, dependency]) => dependency.location === locationId)
      .map(([itemId, dependency]) => this.formatGodModeEvent(Number(itemId), dependency));
  }

  formatGodModeEvent(itemId, dependency) {
    const sourceItem = items[itemId]?.name || `ITEM ${itemId}`;
    const resultItem = items[dependency.resultId]?.aName || `item ${dependency.resultId}`;
    const flags = [];

    if (dependency.dragonRequired) {
      flags.push('after dragon');
    }
    if (dependency.milestone) {
      flags.push('sheep part');
    }
    if (dependency.winGame) {
      flags.push('final');
    }

    return `USE ${sourceItem} -> ${resultItem}${flags.length ? ` (${flags.join(', ')})` : ''}`;
  }

  showMapTooltip(tile) {
    const tooltip = document.getElementById('map-tooltip');
    if (!tooltip || !this.mapOpen) return;

    tooltip.textContent = tile.dataset.tooltip || tile.dataset.desc;
    tooltip.classList.add('visible');
    this.positionMapTooltip(tile);
  }

  positionMapTooltip(tile) {
    const tooltip = document.getElementById('map-tooltip');
    if (!tooltip || !tooltip.classList.contains('visible')) return;

    const gap = 10;
    const viewportPadding = 8;
    const tileRect = tile.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    let left = tileRect.left + tileRect.width / 2 - tooltipRect.width / 2;
    let top = tileRect.top - tooltipRect.height - gap;

    if (top < viewportPadding) {
      top = tileRect.bottom + gap;
    }

    if (top + tooltipRect.height > window.innerHeight - viewportPadding) {
      top = window.innerHeight - tooltipRect.height - viewportPadding;
    }

    left = Math.max(viewportPadding, Math.min(left, window.innerWidth - tooltipRect.width - viewportPadding));
    top = Math.max(viewportPadding, top);

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  hideMapTooltip() {
    const tooltip = document.getElementById('map-tooltip');
    if (!tooltip) return;

    tooltip.classList.remove('visible');
  }

  handleUserInput(e) {
    const userInput = document.getElementById('user-input');

    if (this.mapOpen && e.key === 'Escape') {
      e.preventDefault();
      this.hideMap();
      return;
    }

    if (e.target !== userInput) {
      userInput.focus();
      return;
    }

    const inputText = userInput.value.trim().toUpperCase();

    if (e.key.length > 1) {
      e.preventDefault();
    }

    if (e.key === 'Backspace') {
      userInput.value = userInput.value.slice(0, -1);
    }

    if (e.key !== 'Enter') return;
    console.log(`User input: '${inputText}'`);
    userInput.value = '';

    if (this.itemsManager.hasGameWon()) {
      return;
    }

    if (inputText === 'V') {
      this.showVocabulary();
      return;
    }

    if (inputText === 'G') {
      this.showGossips();
      return;
    }

    const parts = inputText.split(' ');
    const command = parts[0];
    const arg = parts.slice(1).join(' ');

    if (command === 'TAKE' || command === 'T') {
      this.handleTake(arg);
      return;
    }

    if (command === 'DROP' || command === 'D') {
      this.handleDrop(arg);
      return;
    }

    if (command === 'USE' || command === 'U') {
      this.handleUse(arg);
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

    this.handleMove(inputText[0]);
  }

  showVocabulary() {
    document.getElementById('available-paths').innerHTML = `NORTH or N, SOUTH or S, <br>
      WEST or W, EAST or E <br>
      TAKE (object) or T (object) <br>
      DROP (object) or D (object) <br>
      USE (object) or U (object) <br>
      GOSSIPS or G, VOCABULARY or V<br>
      Press any key`;

    document.getElementById('what-now').style.display = 'none';
    document.getElementById('carried-item').style.display = 'none';
    document.getElementById('visible-items').style.display = 'none';
    const handler = () => {
      document.getElementById('available-paths').textContent = `You can go ${this.location.availablePaths}`;
      document.getElementById('carried-item').style.display = 'block';
      document.getElementById('visible-items').style.display = 'block';
      document.getElementById('what-now').style.display = 'flex';
      document.querySelector('body').removeEventListener('input', handler);
    };
    document.querySelector('body').addEventListener('input', handler);
  }

  showGossips() {
    document.getElementById('available-paths').innerHTML = `The woodcutter lost his home key... <br>
      The butcher likes fruit... The cooper <br>
      is greedy... Dratewka plans to make a <br>
      poisoned bait for the dragon... The <br>
      tavern owner is buying food from the <br>
      pickers... Making a rag from a bag...<br>
      Press any key`;

    document.getElementById('what-now').style.display = 'none';
    document.getElementById('carried-item').style.display = 'none';
    document.getElementById('visible-items').style.display = 'none';
    const handler = () => {
      document.getElementById('available-paths').textContent = `You can go ${this.location.availablePaths}`;
      document.getElementById('carried-item').style.display = 'block';
      document.getElementById('visible-items').style.display = 'block';
      document.getElementById('what-now').style.display = 'flex';
      document.querySelector('body').removeEventListener('input', handler);
    };
    document.querySelector('body').addEventListener('input', handler);
  }

  handleTake(itemName) {
    if (!itemName) {
      this.showMessage('You must specify an item to take');
      return;
    }

    const itemId = Items.nameToId(itemName);
    if (!itemId) {
      this.showMessage("There isn\'t anything like that here");
      return;
    }

    const locItems = this.location.itemsInSight();
    if (!locItems.includes(itemId)) {
      this.showMessage("There isn\'t anything like that here");
      return;
    }

    if (items[itemId].flag === 0) {
      this.showMessage("You can\'t carry it");
      return;
    }

    if (this.itemsManager.getCarriedItemId() !== null) {
      this.showMessage('You are carrying something');
      return;
    }

    this.itemsManager.removeItemFromLocation(this.location.id, itemId);
    this.itemsManager.carry(itemId);
    this.showMessage(`You are taking ${items[itemId].aName}`);
    setTimeout(() => {
      this.updateUI();
    }, 1000);
  }

  handleDrop(itemName) {
    if (!itemName) {
      this.showMessage('You must specify an item to drop');
      return;
    }

    if (this.itemsManager.getCarriedItemId() === null) {
      this.showMessage('You are not carrying anything');
      return;
    }

    const itemId = Items.nameToId(itemName);
    if (!itemId || itemId !== this.itemsManager.getCarriedItemId()) {
      this.showMessage('You are not carrying it');
      return;
    }

    const carryableCount = this.location.itemsInSight().filter((id) => items[id].flag === 1).length;
    if (carryableCount >= 3) {
      this.showMessage("You can\'t store any more here");
      return;
    }

    this.itemsManager.drop(this.location.id);
    this.showMessage(`You are about to drop ${items[itemId].aName}`);
    setTimeout(() => {
      this.updateUI();
    }, 1000);
  }

  handleUse(itemName) {
    if (!itemName) {
      this.showMessage('You must specify an item to use');
      return;
    }

    const itemId = Items.nameToId(itemName);
    if (!itemId || itemId !== this.itemsManager.getCarriedItemId()) {
      this.showMessage("You aren\'t carrying anything like that");
      return;
    }

    const dep = itemDependencies[itemId];
    if (!dep) {
      this.showMessage('Nothing happened');
      return;
    }

    // Check if at the right location
    if (dep.location !== this.location.id) {
      this.showMessage('Nothing happened');
      return;
    }

    // Check if dragon is required and not defeated
    if (dep.dragonRequired && !this.itemsManager.dragonDefeated) {
      this.showMessage('Nothing happened');
      return;
    }

    // Special case: use sheep when all milestones complete
    if (itemId === 37) {
      if (!this.itemsManager.isAllMilestonesComplete()) {
        this.showMessage('Nothing happened');
        return;
      }
      this.itemsManager.defeatDragon(this.location.id);
      this.itemsManager.carriedItemId = null;
      this.showMessage('The dragon noticed your gift...');
      setTimeout(() => {
        this.showMessage('The dragon ate your sheep and died!');
        this.location.updateDragonImg();
        setTimeout(() => {
          this.updateUI();
        }, 2000);
      }, 2000);
      return;
    }

    // Check if special final use case - ending image
    if (itemId === 36) {
      this.itemsManager.winGame();
      this.showMessage('You have won the game. Thanks for playing!');

      document.getElementById('gfx').style.display = 'none';
      document.getElementById('available-paths').style.display = 'none';
      document.getElementById('visible-items').style.display = 'none';
      document.getElementById('carried-item').style.display = 'none';
      document.getElementById('what-now').style.display = 'none';
      return;
    }

    // Normal use
    this.itemsManager.carriedItemId = null;
    if (dep.milestone) {
      this.itemsManager.markMilestone(itemId);
    }

    const resultId = dep.resultId;
    this.showMessage(dep.message);

    setTimeout(() => {
      // Drop result items at location
      if (dep.parts && dep.parts.length > 0) {
        for (let part of dep.parts) {
          this.itemsManager.addItemToLocation(this.location.id, resultId);
        }
      } else {
        this.itemsManager.carry(resultId);
      }

      // Check if all milestones complete to generate sheep
      if (this.itemsManager.isAllMilestonesComplete() && !this.location.itemsInSight().includes(37)) {
        setTimeout(() => {
          this.showMessage('Your fake sheep is full of poison and ready to be eaten by the dragon');
          this.itemsManager.addItemToLocation(this.location.id, 37);
          setTimeout(() => {
            this.updateUI();
          }, 1000);
        }, 1000);
      } else {
        this.updateUI();
      }
    }, 1000);
  }

  handleMove(path) {
    const locDesc = document.getElementById('location-desc');

    try {
      const dirName = Location.fullPathName(path);
      locDesc.textContent = `You are going ${dirName}...`;
      this.location.go(path);
      setTimeout(() => {
        this.updateUI();
      }, 500);
    } catch (error) {
      if (error.message === 'PATH_UNAVAILABLE') {
        locDesc.textContent = "You can\'t go that way";
        setTimeout(() => {
          this.updateUI();
        }, 1500);
      } else if (error.message === 'DRAGON_BLOCKS_PATH') {
        locDesc.textContent = "You can\'t go that way...";
        setTimeout(() => {
          locDesc.textContent = 'The dragon sleeps in a cave!';
        }, 2000);
        setTimeout(() => {
          this.updateUI();
        }, 4000);
      } else {
        console.error(error);
      }
    }
  }

  showMessage(msg) {
    const locDesc = document.getElementById('location-desc');
    locDesc.textContent = msg;
    setTimeout(() => {
      if (!this.itemsManager.hasGameWon()) {
        locDesc.textContent = this.location.desc;
      }
    }, 2000);
  }

  static fullPathName(path) {
    const names = { N: 'NORTH', E: 'EAST', S: 'SOUTH', W: 'WEST' };
    return names[path];
  }
}
