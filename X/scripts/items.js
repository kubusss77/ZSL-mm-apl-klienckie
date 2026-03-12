const items = {
  10: {
    name: 'KEY',
    aName: 'a KEY',
    flag: 1,
  },
  11: {
    name: 'AXE',
    aName: 'an AXE',
    flag: 1,
  },
  12: {
    name: 'STICKS',
    aName: 'STICKS',
    flag: 1,
  },
  13: {
    name: 'sheeplegs',
    aName: 'sheeplegs',
    flag: 0,
  },
  14: {
    name: 'MUSHROOMS',
    aName: 'MUSHROOMS',
    flag: 1,
  },
  15: {
    name: 'MONEY',
    aName: 'MONEY',
    flag: 1,
  },
  16: {
    name: 'BARREL',
    aName: 'a BARREL',
    flag: 1,
  },
  17: {
    name: 'sheeptrunk',
    aName: 'a sheeptrunk',
    flag: 0,
  },
  18: {
    name: 'BERRIES',
    aName: 'BERRIES',
    flag: 1,
  },
  19: {
    name: 'WOOL',
    aName: 'WOOL',
    flag: 1,
  },
  20: {
    name: 'sheepskin',
    aName: 'a sheepskin',
    flag: 0,
  },
  21: {
    name: 'BAG',
    aName: 'a BAG',
    flag: 1,
  },
  22: {
    name: 'RAG',
    aName: 'a RAG',
    flag: 1,
  },
  23: {
    name: 'sheephead',
    aName: 'a sheephead',
    flag: 0,
  },
  24: {
    name: 'SPADE',
    aName: 'a SPADE',
    flag: 1,
  },
  25: {
    name: 'SULPHUR',
    aName: 'SULPHUR',
    flag: 1,
  },
  26: {
    name: 'solid poison',
    aName: 'a solid poison',
    flag: 0,
  },
  27: {
    name: 'BUCKET',
    aName: 'a BUCKET',
    flag: 1,
  },
  28: {
    name: 'TAR',
    aName: 'TAR',
    flag: 1,
  },
  29: {
    name: 'liquid poison',
    aName: 'a liquid poison',
    flag: 0,
  },
  30: {
    name: 'dead dragon',
    aName: 'a dead dragon',
    flag: 0,
  },
  31: {
    name: 'STONE',
    aName: 'a STONE',
    flag: 1,
  },
  32: {
    name: 'FISH',
    aName: 'a FISH',
    flag: 1,
  },
  33: {
    name: 'KNIFE',
    aName: 'a KNIFE',
    flag: 1,
  },
  34: {
    name: 'DRAGONSKIN',
    aName: 'a DRAGONSKIN',
    flag: 1,
  },
  35: {
    name: 'SHOES',
    aName: 'a dragonskin SHOES',
    flag: 1,
  },
  36: {
    name: 'PRIZE',
    aName: 'a PRIZE',
    flag: 1,
  },
  37: {
    name: 'SHEEP',
    aName: 'a SHEEP',
    flag: 1,
  },
};

class Items {
  carriedItem;

  constructor() {
    this.carriedItem = null;
  }

  carry(itemName) {
    const itemId = Object.keys(items).find((id) => items[id].name.toUpperCase() === itemName);
    if (!itemId) {
      throw new Error('ITEM_NOT_FOUND');
    }
    if (items[itemId].flag === 0) {
      throw new Error('ITEM_UNCARRIABLE');
    }
    if (this.carriedItem) {
      throw new Error('INVENTORY_FULL');
    }
    this.carriedItem = itemId;
  }

  get carriedItem() {
    return items[this.carriedItem].aName;
  }

  static defaultPositions() {
    return {
      13: [31],
      15: [27],
      17: [14],
      23: [10],
      27: [18],
      32: [32],
      44: [21],
      55: [33],
      64: [24],
    };
  }

  static idToFullName(id) {
    return items[id].aName;
  }
}

export default Items;
