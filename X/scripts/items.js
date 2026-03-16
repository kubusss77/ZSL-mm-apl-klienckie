const items = {
  10: { name: 'KEY', aName: 'a KEY', flag: 1 },
  11: { name: 'AXE', aName: 'an AXE', flag: 1 },
  12: { name: 'STICKS', aName: 'STICKS', flag: 1 },
  13: { name: 'sheeplegs', aName: 'sheeplegs', flag: 0 },
  14: { name: 'MUSHROOMS', aName: 'MUSHROOMS', flag: 1 },
  15: { name: 'MONEY', aName: 'MONEY', flag: 1 },
  16: { name: 'BARREL', aName: 'a BARREL', flag: 1 },
  17: { name: 'sheeptrunk', aName: 'a sheeptrunk', flag: 0 },
  18: { name: 'BERRIES', aName: 'BERRIES', flag: 1 },
  19: { name: 'WOOL', aName: 'WOOL', flag: 1 },
  20: { name: 'sheepskin', aName: 'a sheepskin', flag: 0 },
  21: { name: 'BAG', aName: 'a BAG', flag: 1 },
  22: { name: 'RAG', aName: 'a RAG', flag: 1 },
  23: { name: 'sheephead', aName: 'a sheephead', flag: 0 },
  24: { name: 'SPADE', aName: 'a SPADE', flag: 1 },
  25: { name: 'SULPHUR', aName: 'SULPHUR', flag: 1 },
  26: { name: 'solid poison', aName: 'a solid poison', flag: 0 },
  27: { name: 'BUCKET', aName: 'a BUCKET', flag: 1 },
  28: { name: 'TAR', aName: 'TAR', flag: 1 },
  29: { name: 'liquid poison', aName: 'a liquid poison', flag: 0 },
  30: { name: 'dead dragon', aName: 'a dead dragon', flag: 0 },
  31: { name: 'STONE', aName: 'a STONE', flag: 1 },
  32: { name: 'FISH', aName: 'a FISH', flag: 1 },
  33: { name: 'KNIFE', aName: 'a KNIFE', flag: 1 },
  34: { name: 'DRAGONSKIN', aName: 'a DRAGONSKIN', flag: 1 },
  35: { name: 'SHOES', aName: 'a dragonskin SHOES', flag: 1 },
  36: { name: 'PRIZE', aName: 'a PRIZE', flag: 1 },
  37: { name: 'SHEEP', aName: 'a SHEEP', flag: 1 },
};

// Dependencies: item_id -> [location, result_id, message]
const itemDependencies = {
  10: { location: 56, resultId: 11, message: 'You opened a tool shed and took an axe' },
  11: { location: 67, resultId: 12, message: 'You cut sticks for sheeplegs' },
  12: { location: 43, resultId: 13, message: 'You prepared legs for your fake sheep', parts: ['L'], milestone: true },
  14: { location: 34, resultId: 15, message: 'The tavern owner paid you money' },
  15: { location: 37, resultId: 16, message: 'The cooper sold you a new barrel' },
  16: { location: 43, resultId: 17, message: 'You made a nice sheeptrunk', parts: ['L'], milestone: true },
  18: { location: 36, resultId: 19, message: 'The butcher gave you wool' },
  19: { location: 43, resultId: 20, message: 'You prepared skin for your fake sheep', parts: ['L'], milestone: true },
  21: { location: 57, resultId: 22, message: 'You used your tools to make a rag' },
  22: { location: 43, resultId: 23, message: 'You made a fake sheephead', parts: ['L'], milestone: true },
  24: {
    location: 11,
    resultId: 25,
    message: "You are digging... and digging... That's enough sulphur for you",
  },
  25: { location: 43, resultId: 26, message: 'You prepared a solid poison', parts: ['L'], milestone: true },
  27: { location: 21, resultId: 28, message: 'You got a bucket full of tar' },
  28: { location: 43, resultId: 29, message: 'You prepared a liquid poison', parts: ['L'], milestone: true },
  33: { location: 43, resultId: 34, message: "You cut a piece of dragon's skin", dragonRequired: true },
  34: { location: 57, resultId: 35, message: 'You used your tools to make shoes' },
  35: { location: 41, resultId: 36, message: 'The King is impressed by your shoes', winGame: true },
};

class Items {
  constructor() {
    this.carriedItemId = null;
    this.itemsOnLocation = Items.defaultPositions();
    this.completedMilestones = [];
    this.gameWon = false;
    this.dragonDefeated = false;
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

  addItemToLocation(locationId, itemId) {
    const locStr = String(locationId);
    if (!this.itemsOnLocation[locStr]) {
      this.itemsOnLocation[locStr] = [];
    }
    this.itemsOnLocation[locStr].push(itemId);
  }

  removeItemFromLocation(locationId, itemId) {
    const locStr = String(locationId);
    if (this.itemsOnLocation[locStr]) {
      const idx = this.itemsOnLocation[locStr].indexOf(itemId);
      if (idx > -1) {
        this.itemsOnLocation[locStr].splice(idx, 1);
      }
    }
  }

  getItemsAtLocation(locationId) {
    return this.itemsOnLocation[String(locationId)] || [];
  }

  carry(itemId) {
    if (this.carriedItemId !== null) {
      throw new Error('INVENTORY_FULL');
    }
    this.carriedItemId = itemId;
  }

  drop(locationId) {
    if (this.carriedItemId === null) {
      throw new Error('NOT_CARRYING');
    }
    const locStr = String(locationId);
    if (!this.itemsOnLocation[locStr]) {
      this.itemsOnLocation[locStr] = [];
    }
    const carryableCount = this.itemsOnLocation[locStr].filter((id) => items[id].flag === 1).length;
    if (carryableCount >= 3) {
      throw new Error('LOCATION_FULL');
    }
    this.itemsOnLocation[locStr].push(this.carriedItemId);
    this.carriedItemId = null;
  }

  getCarriedItemName() {
    if (this.carriedItemId === null) return 'nothing';
    return items[this.carriedItemId].aName;
  }

  getCarriedItemId() {
    return this.carriedItemId;
  }

  static idToFullName(id) {
    return items[id].aName;
  }

  static nameToId(name) {
    const upperName = name.toUpperCase();
    for (let id in items) {
      if (items[id].name.toUpperCase() === upperName) {
        return parseInt(id);
      }
    }
    return null;
  }

  markMilestone(itemId) {
    if (!this.completedMilestones.includes(itemId)) {
      this.completedMilestones.push(itemId);
    }
  }

  getMilestoneCount() {
    return this.completedMilestones.length;
  }

  isAllMilestonesComplete() {
    return this.completedMilestones.length === 6;
  }

  completePoisonedSheep(locationId) {
    if (this.isAllMilestonesComplete()) {
      this.addItemToLocation(locationId, 37);
      return true;
    }
    return false;
  }

  defeatDragon(locationId) {
    this.dragonDefeated = true;
    this.addItemToLocation(locationId, 30);
  }

  winGame() {
    this.gameWon = true;
  }

  hasGameWon() {
    return this.gameWon;
  }
}

export default Items;
export { items, itemDependencies };
