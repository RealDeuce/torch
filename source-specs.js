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


export default class SourceSpecs {
  static get lightSources() {
    let itemName = Settings.inventoryItemName;
    let sources = {};
    switch (game.system.id) {
      case "dnd5e":
        sources = Object.assign({}, DND5E_LIGHT_SOURCES);
        if (!SourceSpecs.find(itemName, sources)) {
          sources[itemName] = {
            name: itemName,
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
