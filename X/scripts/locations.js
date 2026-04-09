export const locations = {
  11: { paths: ['E'], desc: 'You are inside a brimstone mine', img: '11.gif', color: 'rgb(235, 211, 64)' },
  12: { paths: ['E', 'W'], desc: 'You are at the entrance to the mine', img: '12.gif', color: 'rgb(89, 93, 87)' },
  13: { paths: ['E', 'S', 'W'], desc: 'A hill', img: '13.gif', color: 'rgb(117, 237, 243)' },
  14: { paths: ['E', 'W'], desc: 'Some bushes', img: '14.gif', color: 'rgb(202, 230, 51)' },
  15: { paths: ['E', 'W'], desc: 'An old deserted hut', img: '15.gif', color: 'rgb(220, 204, 61)' },
  16: { paths: ['E', 'W'], desc: 'The edge of a forest', img: '16.gif', color: 'rgb(167, 245, 63)' },
  17: { paths: ['S', 'W'], desc: 'A dark forest', img: '17.gif', color: 'rgb(140, 253, 99)' },
  21: { paths: ['E', 'S'], desc: 'A man nearby making tar', img: '21.gif', color: 'rgb(255, 190, 99)' },
  22: { paths: ['E', 'S', 'W'], desc: 'A timber yard', img: '22.gif', color: 'rgb(255, 190, 99)' },
  23: { paths: ['N', 'E', 'S', 'W'], desc: 'You are by a roadside shrine', img: '23.gif', color: 'rgb(167, 245, 63)' },
  24: { paths: ['E', 'W'], desc: 'You are by a small chapel', img: '24.gif', color: 'rgb(212, 229, 36)' },
  25: {
    paths: ['E', 'S', 'W'],
    desc: 'You are on a road leading to a wood',
    img: '25.gif',
    color: 'rgb(167, 245, 63)',
  },
  26: { paths: ['E', 'W'], desc: 'You are in a forest', img: '26 i 65.gif', color: 'rgb(167, 245, 63)' },
  27: { paths: ['N', 'W'], desc: 'You are in a deep forest', img: '27 i 67.gif', color: 'rgb(140, 253, 99)' },
  31: { paths: ['N', 'E'], desc: 'You are by the Vistula River', img: '31.gif', color: 'rgb(122, 232, 252)' },
  32: { paths: ['N', 'W'], desc: 'You are by the Vistula River', img: '32.gif', color: 'rgb(140, 214, 255)' },
  33: { paths: ['N', 'S'], desc: 'You are on a bridge over river', img: '33.gif', color: 'rgb(108, 181, 242)' },
  34: { paths: ['E'], desc: 'You are by the old tavern', img: '34.gif', color: 'rgb(255, 189, 117)' },
  35: { paths: ['N', 'S', 'W'], desc: "You are at the town\'s end", img: '35.gif', color: 'rgb(255, 190, 99)' },
  36: { paths: ['S'], desc: "You are in a butcher\'s shop", img: '36.gif', color: 'rgb(255, 188, 102)' },
  37: { paths: ['S'], desc: "You are in a cooper\'s house", img: '37.gif', color: 'rgb(255, 188, 102)' },
  41: { paths: ['N', 'E'], desc: 'You are in the Wawel Castle', img: '41.gif', color: 'rgb(255, 176, 141)' },
  42: {
    paths: ['E'],
    desc: "You are inside a dragon\'s cave",
    img: '42.gif',
    color: 'rgb(198, 205, 193)',
    restricted: true,
  },
  43: { paths: ['E'], desc: 'A perfect place to set a trap', img: '43.gif', color: 'rgb(255, 176, 141)' },
  44: { paths: ['E'], desc: 'You are by the water mill', img: '44.gif', color: 'rgb(255, 190, 99)' },
  45: { paths: ['N', 'E', 'S', 'W'], desc: 'You are at a main crossroad', img: '45.gif', color: 'rgb(255, 190, 99)' },
  46: { paths: ['N', 'E', 'W'], desc: 'You are on a town street', img: '46.gif', color: 'rgb(255, 190, 99)' },
  47: {
    paths: ['N', 'S', 'W'],
    desc: 'You are in a frontyard of your house',
    img: '47.gif',
    color: 'rgb(255, 190, 99)',
  },
  54: { paths: ['E'], desc: 'You are by a swift stream', img: '54.gif', color: 'rgb(108, 181, 242)' },
  55: { paths: ['N', 'S', 'W'], desc: 'You are on a street leading forest', img: '55.gif', color: 'rgb(255, 190, 99)' },
  56: { paths: ['S'], desc: "You are in a woodcutter\'s backyard", img: '56.gif', color: 'rgb(255, 190, 99)' },
  57: { paths: ['N'], desc: "You are in a shoemaker\'s house", img: '57.gif', color: 'rgb(254, 194, 97)' },
  64: { paths: ['E'], desc: 'You are in a bleak funeral house', img: '64.gif', color: 'rgb(254, 194, 97)' },
  65: {
    paths: ['N', 'E', 'W'],
    desc: 'You are on a path leading to the wood',
    img: '26 i 65.gif',
    color: 'rgb(167, 245, 63)',
  },
  66: { paths: ['N', 'E', 'W'], desc: 'You are at the edge of a forest', img: '66.gif', color: 'rgb(167, 245, 63)' },
  67: { paths: ['W'], desc: 'You are in a deep forest', img: '27 i 67.gif', color: 'rgb(140, 253, 99)' },
};

class Location {
  constructor(x, y, itemsManager) {
    this.x = x;
    this.y = y;
    this.itemsManager = itemsManager;
  }

  get id() {
    return this.y * 10 + this.x;
  }

  paths() {
    const loc = locations[this.id];
    if (!loc) return [];
    let pathList = [...loc.paths];
    // Unlock west path to location 42 after dragon is defeated
    if (this.id === 43 && this.itemsManager.dragonDefeated) {
      if (!pathList.includes('W')) {
        pathList.push('W');
      }
    }
    return pathList;
  }

  get availablePaths() {
    return this.paths().map(Location.fullPathName).join(', ');
  }

  get desc() {
    return locations[this.id]?.desc || 'Unknown location';
  }

  get img() {
    return locations[this.id]?.img || 'default.gif';
  }

  get color() {
    return locations[this.id]?.color || 'rgb(0, 0, 0)';
  }

  #canGoWest() {
    if (this.id === 43) {
      return this.itemsManager.dragonDefeated;
    }
    return true;
  }

  go(path) {
    if (!this.paths().includes(path)) {
      throw new Error('PATH_UNAVAILABLE');
    }

    // Block access to dragon cave unless ready
    if (path === 'E' && this.id === 41) {
      // Check if trying to enter dragon cave (42)
      const nextId = this.y * 10 + (this.x + 1);
      if (nextId === 42) {
        throw new Error('DRAGON_BLOCKS_PATH');
      }
    }

    switch (path) {
      case 'N':
        this.y--;
        break;
      case 'E':
        this.x++;
        break;
      case 'S':
        this.y++;
        break;
      case 'W':
        this.x--;
        break;
    }

    // Prevent entry to cave from west unless dragon is defeated
    if (this.id === 42 && path === 'W' && !this.itemsManager.dragonDefeated) {
      throw new Error('DRAGON_BLOCKS_PATH');
    }
  }

  updateDragonImg() {
    locations[43].img = '43 smok.bmp';
  }

  static fullPathName(path) {
    const names = { N: 'NORTH', E: 'EAST', S: 'SOUTH', W: 'WEST' };
    return names[path];
  }

  itemsInSight() {
    return this.itemsManager.getItemsAtLocation(this.id);
  }
}

export default Location;
