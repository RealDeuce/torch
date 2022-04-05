import Settings from "./settings.js";

const DND5E_LIGHT_SOURCES = {
  Candle: {
    name: "Candle",
    light: [{ bright: 5, dim: 10 }],
    shape: "sphere",
    type: "equipment",
    consumable: true,
    states: 2,
  },
  Torch: {
    name: "Torch",
    light: [{ bright: 20, dim: 40 }],
    shape: "sphere",
    type: "equipment",
    consumable: true,
    states: 2,
  },
  Lamp: {
    name: "Lamp",
    light: [{ bright: 15, dim: 45 }],
    shape: "sphere",
    type: "equipment",
    consumable: false,
    states: 2,
  },
  "Bullseye Lantern": {
    name: "Bullseye Lantern",
    light: [{ bright: 15, dim: 45 }],
    shape: "cone",
    type: "equipment",
    consumable: false,
    states: 2,
  },
  "Hooded Lantern": {
    name: "Hooded Lantern",
    light: [
      { bright: 30, dim: 60 },
      { bright: 0, dim: 5 },
    ],
    shape: "sphere",
    type: "equipment",
    consumable: false,
    states: 3,
  },
  Light: {
    name: "Light",
    light: [{ bright: 20, dim: 40 }],
    shape: "sphere",
    type: "cantrip",
    consumable: false,
    states: 2,
  },
  "Dancing Lights": {
    name: "Dancing Lights",
    light: [{ bright: 0, dim: 10 }],
    shape: "sphere",
    type: "cantrip",
    consumable: false,
    states: 2,
  },
};

const SWADE_LIGHT_SOURCES = {
  "Candle": {
    name: "Candle",
    light: [{bright: 0, dim: 2}],
    shape: "sphere",
    type: "equipment",
    consumable: true,
    states: 2,
  },
  "Flashlight": {
    name: "Flashlight",
    light: [{bright: 10, dim: 10}],
    shape: "beam",
    type: "equipment",
    consumable: false,
    states: 2
  },
  "Lantern": {
    name: "Lantern",
    light: [{bright: 4, dim: 4}],
    shape: "sphere",
    type: "equipment",
    consumable: false,
    states: 2,
  },
  "Torch": {
    name: "Torch",
    light: [{bright: 4, dim: 4}],
    shape: "sphere",
    type: "equipment",
    consumable: true,
    states: 2,
  }
};

const ED4E_LIGHT_SOURCES = {
  "Candle": {
    name: "Candle",
    light: [{bright: 0, dim: 3}],
    shape: "sphere",
    type: "equipment",
    consumable: true,
    states: 2,
  },
  "Lantern (Hooded)": {
    name: "Lantern (Hooded)",
    light: [{bright: 10, dim: 10}, {bright: 0, dim: 10}],
    shape: "sphere",
    type: "equipment",
    consumable: false,
    states: 3
  },
  "Lantern (Bullseye)": {
    name: "Lantern (Bullseye)",
    light: [{bright: 20, dim: 20}],
    shape: "beam",
    type: "equipment",
    consumable: false,
    states: 2,
  },
  "Torch": {
    name: "Torch",
    light: [{bright: 10, dim: 10}],
    shape: "sphere",
    type: "equipment",
    consumable: true,
    states: 2,
  }
};

const PF2E_LIGHT_SOURCES = {
  "Candle": {
    name: "Candle",
    light: [{bright: 0, dim: 10}],
    shape: "sphere",
    type: "equipment",
    consumable: true,
    states: 2,
  },
  "Lantern (Hooded)": {
    name: "Lantern (Hooded)",
    light: [{bright: 30, dim: 60}, {bright: 0, dim: 5}],
    shape: "sphere",
    type: "equipment",
    consumable: false,
    states: 3
  },
  "Lantern (Bull's Eye)": {
    name: "Lantern (Bull's Eye)",
    light: [{bright: 60, dim: 120}],
    shape: "cone",
    type: "equipment",
    consumable: false,
    states: 2,
  },
  "Torch": {
    name: "Torch",
    light: [{bright: 20, dim: 40}],
    shape: "sphere",
    type: "equipment",
    consumable: true,
    states: 2,
  }
};

const PF1_LIGHT_SOURCES = {
  "Candle": {
    name: "Candle",
    light: [{bright: 0, dim: 5}],
    shape: "sphere",
    type: "equipment",
    consumable: true,
    states: 2,
  },
  "Lamp": {
    name: "Lamp",
    light: [{bright: 15, dim: 30}],
    shape: "sphere",
    type: "equipment",
    consumable: false,
    states: 2
  },
  "Lantern": {
    name: "Lantern",
    light: [{bright: 30, dim: 60}],
    shape: "sphere",
    type: "equipment",
    consumable: false,
    states: 2,
  },
  "Bullseye Lantern": {
    name: "Bullseye Lantern",
    light: [{bright: 60, dim: 120}],
    shape: "cone",
    type: "equipment",
    consumable: false,
    states: 2,
  },
  "Hooded Lantern": {
    name: "Hooded Lantern",
    light: [{bright: 30, dim: 60}],
    shape: "sphere",
    type: "equipment",
    consumable: false,
    states: 2,
  },
  "Miner's Lantern": {
    name: "Miner's Lantern",
    light: [{bright: 30, dim: 60}],
    shape: "cone",
    type: "equipment",
    consumable: false,
    states: 2,
  },
  "Torch": {
    name: "Torch",
    light: [{bright: 20, dim: 40}],
    shape: "sphere",
    type: "equipment",
    consumable: true,
    states: 2,
  }
};

export default class SourceSpecs {
  static augmentSources(sourceSet) {
    let sources = Object.assign({}, sourceSet);
    let inventoryItem = Settings.inventoryItemName;
    if (!inventoryItem) {
      return sources;
    } else {
      if (!SourceSpecs.find(inventoryItem, sources)) {
        sources[inventoryItem] = {
          name: inventoryItem,
          light: [
            {
              bright: Settings.litRadii.bright,
              dim: Settings.litRadii.dim,
            },
          ],
          shape: "sphere",
          type: "none",
          consumable: false,
          states: 2,
        };
      }  
    }
    return sources;
  }

  static get lightSources() {
    let itemName = Settings.inventoryItemName;
    let sources = {};
    switch (game.system.id) {
      case "dnd5e":
        sources = SourceSpecs.augmentSources(DND5E_LIGHT_SOURCES);
        break;
      case "swade":
        sources = SourceSpecs.augmentSources(SWADE_LIGHT_SOURCES);
        break;
      case "earthdawn4e":
        sources = SourceSpecs.augmentSources(ED4E_LIGHT_SOURCES);
        break;
      case "pf2e":
        sources = SourceSpecs.augmentSources(PF2E_LIGHT_SOURCES);
        break;
      case "pf1":
        sources = SourceSpecs.augmentSources(PF1_LIGHT_SOURCES);
        break;
      default:
        sources["Self"] = {
          name: "Self",
          light: [
            { bright: Settings.litRadii.bright, dim: Settings.litRadii.dim },
          ],
          shape: "sphere",
          type: "none",
          consumable: false,
          states: 2,
        };
    }
    return sources;
  }
  static find(name, sources) {
    for (let sourceName in sources) {
      if (sourceName.toLowerCase() === name.toLowerCase()) {
        return sources[sourceName];
      }
    }
    return false;
  };
  
}
