import TorchSocket from "./socket.js";
import Settings from "./settings.js";
import SourceSpecs from "./source-specs.js";

let DEBUG = true;

let debugLog = (...args) => {
  if (DEBUG) {
    console.log(...args);
  }
};

let getAngle = (shape) => {
  switch (shape) {
    case "cone":
      return 53.13;
    case "sphere":
    default:
      return 360;
  }
};

export default class TorchToken {
  STATE_ON = "on";
  STATE_DIM = "dim";
  STATE_OFF = "off";
  token;

  constructor(token) {
    this.token = token;
  }
  // Flags
  get currentLightSource() {
    let lightSource = this.token.getFlag("torch", "lightSource");
    let owned = this.ownedLightSources;
    if (lightSource && owned.find((item) => item.name === lightSource))
      return lightSource;
    let itemName = Settings.inventoryItemName;
    let sourceData = itemName
      ? owned.find((item) => item.name.toLowerCase() === itemName.toLowerCase())
      : undefined;
	if (itemName &&!!sourceData) {
		return sourceData.name;
	}
	if (owned.length > 0) {
		return owned[0].name;
	}
	return;
  }
  async setCurrentLightSource(value) {
    await this.token.setFlag("torch", "lightSource", value);
  }
  get lightSourceState() {
    let state = this.token.getFlag("torch", "lightSourceState");
    return typeof state === "undefined" ? this.STATE_OFF : state;
  }
  get ownedLightSources() {
    let allSources = SourceSpecs.lightSources;
    let items = Array.from(game.actors.get(this.token.actorId).items).filter(
      (item) => {
        let itemSource = SourceSpecs.find(item.name, allSources);
        if (item.type === "spell") {
          return !!itemSource && itemSource.type === "cantrip";
        } else {
          return !!itemSource && itemSource.type === "equipment";
        }
      }
    );
    if (items.length > 0) {
      return items.map((item) => {
        return Object.assign(
          { image: item.img, quantity: item.quantity },
          allSources[item.name]
        );
      });
    } else if ("Self" in allSources) {
      return [allSources["Self"]];
    }
  }

  get currentLightSourceIsExhausted() {
	  return this.sourceIsExhausted(this.currentLightSource);
  }

  sourceIsExhausted(source) {
    let allSources = SourceSpecs.lightSources;
    if (allSources[source].consumable) {
      // Now we can consume it
      let torchItem = Array.from(
        game.actors.get(this.token.actorId).items
      ).find((item) => item.name.toLowerCase() === source.toLowerCase());
      return torchItem && torchItem.system.quantity === 0;
    }
    return false;
  }

  /* Orchestrate State Management */
  async forceStateOff() {
    // Need to deal with dancing lights
    await this.token.setFlag("torch", "lightSourceState", this.STATE_OFF);
    await this.turnOffSource();
  }

  async advanceState() {
    let source = this.currentLightSource;
    let state = this.lightSourceState;
    let allSources = SourceSpecs.lightSources;
    if (allSources[source].states === 3) {
      state =
        state === this.STATE_OFF
          ? this.STATE_ON
          : state === this.STATE_ON
          ? this.STATE_DIM
          : this.STATE_OFF;
    } else {
      state = state === this.STATE_OFF ? this.STATE_ON : this.STATE_OFF;
    }
    await this.token.setFlag("torch", "lightSourceState", state);
    switch (state) {
      case this.STATE_OFF:
        await this.turnOffSource();
        break;
      case this.STATE_ON:
        await this.turnOnSource();
        break;
      case this.STATE_DIM:
        await this.dimSource();
        break;
      default:
        await this.turnOffSource();
    }
    return state;
  }
  async turnOffSource() {
    if (TorchSocket.requestSupported("delete", this.currentLightSource)) {
      // separate token lighting
      TorchSocket.sendRequest(this.token.id, "delete", this.currentLightSource);
    } else {
      // self lighting
      let sourceData = SourceSpecs.lightSources[this.currentLightSource];
      await this.token.update({
        "light.bright": Settings.offRadii.bright,
        "light.dim": Settings.offRadii.dim,
        "light.angle": 360,
      });
      if (sourceData.consumable && sourceData.type === "equipment") {
        this.consumeSource();
      }
    }
  }
  async turnOnSource() {
    if (TorchSocket.requestSupported("create", this.currentLightSource)) {
      // separate token lighting
      TorchSocket.sendRequest(this.token.id, "create", this.currentLightSource);
    } else {
      // self lighting
      let sourceData = SourceSpecs.lightSources[this.currentLightSource];
      await this.token.update({
        "light.bright": sourceData.light[0].bright,
        "light.dim": sourceData.light[0].dim,
        "light.angle": getAngle(sourceData.shape),
      });
      if (sourceData.consumable && sourceData.type === "spell") {
        this.consumeSource();
      }
    }
  }

  async dimSource() {
    let sourceData = SourceSpecs.lightSources[this.currentLightSource];
    if (sourceData.states === 3) {
      await this.token.update({
        "light.bright": sourceData.light[1].bright,
        "light.dim": sourceData.light[1].dim,
        "light.angle": getAngle(sourceData.shape),
      });
    }
  }

  async consumeSource() {
    let sourceData = SourceSpecs.lightSources[this.currentLightSource];
    let torchItem = Array.from(game.actors.get(this.token.actorId).items).find(
      (item) => item.name === sourceData.name
    );
    if (
      torchItem &&
      sourceData.consumable &&
      (!game.user.isGM || Settings.gmUsesInventory)
    ) {
      if (sourceData.type === "spell" && torchItem.type === "spell") {
        //TODO: Figure out how to consume spell levels - and whether we want to
      } else if (
        sourceData.type === "equipment" &&
        torchItem.type !== "spell"
      ) {
        if (torchItem.system.quantity > 0) {
          await torchItem.update({
            "system.quantity": torchItem.system.quantity - 1,
          });
        }
      }
    }
  }
}
