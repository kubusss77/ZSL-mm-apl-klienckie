const locations = {
  11: {
    paths: ['e'],
    desc: 'You are inside a brimstone mine',
    img: '11.gif',
    color: [235, 211, 64],
  },
  12: {
    paths: ['e', 'w'],
    desc: 'You are at the entrance to the mine',
    img: '12.gif',
    color: [89, 93, 87],
  },
  13: {
    paths: ['e', 's', 'w'],
    desc: 'A hill',
    img: '13.gif',
    color: [117, 237, 243],
  },
  14: {
    paths: ['e', 'w'],
    desc: 'Some bushes',
    img: '14.gif',
    color: [202, 230, 51],
  },
  15: {
    paths: ['e', 'w'],
    desc: 'An old deserted hut',
    img: '15.gif',
    color: [220, 204, 61],
  },
  16: {
    paths: ['e', 'w'],
    desc: 'The edge of a forest',
    img: '16.gif',
    color: [167, 245, 63],
  },
  17: {
    paths: ['s', 'w'],
    desc: 'A dark forest',
    img: '17.gif',
    color: [140, 253, 99],
  },
  21: {
    paths: ['e', 's'],
    desc: 'A man nearby making tar',
    img: '21.gif',
    color: [255, 190, 99],
  },
  22: {
    paths: ['e', 's', 'w'],
    desc: 'A timber yard',
    img: '22.gif',
    color: [255, 190, 99],
  },
  23: {
    paths: ['n', 'e', 's', 'w'],
    desc: 'You are by a roadside shrine',
    img: '23.gif',
    color: [167, 245, 63],
  },
  24: {
    paths: ['e', 'w'],
    desc: 'You are by a small chapel',
    img: '24.gif',
    color: [212, 229, 36],
  },
  25: {
    paths: ['e', 's', 'w'],
    desc: 'You are on a road leading to a wood',
    img: '25.gif',
    color: [167, 245, 63],
  },
  26: {
    paths: ['e', 'w'],
    desc: 'You are in a forest',
    img: '26 i 65.gif',
    color: [167, 245, 63],
  },
  27: {
    paths: ['n', 'w'],
    desc: 'You are in a deep forest',
    img: '27 i 67.gif',
    color: [140, 253, 99],
  },
  31: {
    paths: ['n', 'e'],
    desc: 'You are by the Vistula River',
    img: '31.gif',
    color: [122, 232, 252],
  },
  32: {
    paths: ['n', 'w'],
    desc: 'You are by the Vistula River',
    img: '32.gif',
    color: [140, 214, 255],
  },
  33: {
    paths: ['n', 's'],
    desc: 'You are on a bridge over river',
    img: '33.gif',
    color: [108, 181, 242],
  },
  34: {
    paths: ['e'],
    desc: 'You are by the old tavern',
    img: '34.gif',
    color: [255, 189, 117],
  },
  35: {
    paths: ['n', 's', 'w'],
    desc: "You are at the town's end",
    img: '35.gif',
    color: [255, 190, 99],
  },
  36: {
    paths: ['s'],
    desc: "You are in a butcher's shop",
    img: '36.gif',
    color: [255, 188, 102],
  },
  37: {
    paths: ['s'],
    desc: "You are in a cooper's house",
    img: '37.gif',
    color: [255, 188, 102],
  },
  41: {
    paths: ['n', 'e'],
    desc: 'You are in the Wawel Castle',
    img: '41.gif',
    color: [255, 176, 141],
  },
  42: {
    paths: ['e'],
    desc: "You are inside a dragon's cave",
    img: '42.gif',
    color: [198, 205, 193],
  },
  43: {
    paths: ['e'], // 'w' is unlocked later
    desc: 'A perfect place to set a trap',
    img: '43.gif',
    color: [255, 176, 141],
  },
  44: {
    paths: ['e'],
    desc: 'You are by the water mill',
    img: '44.gif',
    color: [255, 190, 99],
  },
  45: {
    paths: ['n', 'e', 's', 'w'],
    desc: 'You are at a main crossroad',
    img: '45.gif',
    color: [255, 190, 99],
  },
  46: {
    paths: ['n', 'e', 'w'],
    desc: 'You are on a town street',
    img: '46.gif',
    color: [255, 190, 99],
  },
  47: {
    paths: ['n', 's', 'w'],
    desc: 'You are in a frontyard of your house',
    img: '47.gif',
    color: [255, 190, 99],
  },
  // 51-53 don't exist
  54: {
    paths: ['e'],
    desc: 'You are by a swift stream',
    img: '54.gif',
    color: [108, 181, 242],
  },
  55: {
    paths: ['n', 's', 'w'],
    desc: 'You are on a street leading forest',
    img: '55.gif',
    color: [255, 190, 99],
  },
  56: {
    paths: ['s'],
    desc: "You are in a woodcutter's backyard",
    img: '56.gif',
    color: [255, 190, 99],
  },
  57: {
    paths: ['n'],
    desc: "You are in a shoemaker's house",
    img: '57.gif',
    color: [254, 194, 97],
  },
  // 61-63 don't exist
  64: {
    paths: ['e'],
    desc: 'You are in a bleak funeral house',
    img: '64.gif',
    color: [254, 194, 97],
  },
  65: {
    paths: ['n', 'e', 'w'],
    desc: 'You are on a path leading to the wood',
    img: '26 i 65.gif',
    color: [167, 245, 63],
  },
  66: {
    paths: ['n', 'e', 'w'],
    desc: 'You are at the edge of a forest',
    img: '66.gif',
    color: [167, 245, 63],
  },
  67: {
    paths: ['w'],
    desc: 'You are in a deep forest',
    img: '27 i 67.gif',
    color: [140, 253, 99],
  },
};

class Location {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  get id() {
    return `${this.y * 10 + this.x}`;
  }

  #paths() {
    return locations[this.id].paths;
  }

  get availablePaths() {
    return this.#paths().map(Location.fullPathName).join(', ');
  }

  get desc() {
    return locations[this.id].desc;
  }

  get img() {
    return locations[this.id].img;
  }

  get color() {
    return locations[this.id].color;
  }

  go(path) {
    if (!this.#paths().includes(path)) {
      throw new Error('PATH_UNAVAILABLE');
    }

    switch (path) {
      case 'n':
        this.y--;
        break;
      case 'e':
        this.x++;
        break;
      case 's':
        this.y++;
        break;
      case 'w':
        this.x--;
        break;
    }
  }

  static fullPathName(path) {
    switch (path) {
      case 'n':
        return 'NORTH';
      case 'e':
        return 'EAST';
      case 's':
        return 'SOUTH';
      case 'w':
        return 'WEST';
    }
  }
}

export default Location;
