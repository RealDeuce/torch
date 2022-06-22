export default function getTopology(type, quantityField) {
    const TOPOLOGIES = {
        "standard": StandardLightTopology,
        "gurps": GURPSLightTopology
      }
    if (type in TOPOLOGIES) {
      return new TOPOLOGIES[type](quantityField);    
    } else {
      return new DefaultLightTopology();
    } 
}

const DEFAULT_IMAGE_URL = "/icons/svg/light.svg";

/* Topologies to use */

class StandardLightTopology {
    quantityField = "quantity";
    constructor(quantityField) {
      this.quantityField = quantityField ?? "quantity";
    }
    _findMatchingItem(actorId, lightSourceName) {
      return Array.from(game.actors.get(actorId).items).find(
        (item) => item.name.toLowerCase() === lightSourceName.toLowerCase()
      );
    }

    actorHasLightSource(actorId, lightSource) {
      return !!this._findMatchingItem(actorId, lightSource.name);
    }
  
    getImage (actorId, lightSource) {
      let item = this._findMatchingItem(actorId, lightSource.name);
      return item ? item.img : DEFAULT_IMAGE_URL;
    }
  
    getInventory (actorId, lightSource) {
      if (!lightSource.consumable) return;
      let item = this._findMatchingItem(actorId, lightSource.name);
      return item ? item.system[this.quantityField] : undefined;
    }
  
    async decrementInventory (actorId, lightSource) {
      if (!lightSource.consumable) return;
      let item = this._findMatchingItem(actorId, lightSource.name);
      if (item && item.system[this.quantityField] > 0) {
        let fieldsToUpdate = {};
        fieldsToUpdate["system." + this.quantityField] = item.system[this.quantityField] - 1;
        return item.update(fieldsToUpdate);
      } else {
        return Promise.resolve();
      }
    }
    async setInventory (actorId, lightSource, count) {
      if (!lightSource.consumable) return;
      let item = this._findMatchingItem(actorId, lightSource.name);
      let fieldsToUpdate = {};
      fieldsToUpdate["system." + this.quantityField] = count;
      return item.update(fieldsToUpdate);
    }
  }


  class GURPSLightTopology {
    quantityField = "quantity";
    constructor(quantityField) {
      this.quantityField = quantityField ?? "quantity";
    }

    _findMatchingItem(actorId, lightSourceName) {
      let actor = game.actors.get(actorId);
      return actor.findEquipmentByName(lightSourceName);
    }

    actorHasLightSource(actorId, lightSource) {
      let [item] = this._findMatchingItem (actorId, lightSource.name);
      return !!item;
    }

    getImage (/*actorId, lightSource*/) {
      // We always use the same image because the system doesn't supply them
      return DEFAULT_IMAGE_URL;
    }
  
    getInventory (actorId, lightSource) {
      let [item] = this._findMatchingItem (actorId, lightSource.name);
      return item ? item.count : undefined;
    }

    async decrementInventory (actorId, lightSource) {
      let [item, key] = this._findMatchingItem (actorId, lightSource.name);
      if (item && item.count > 0) {
        game.actors.get(actorId).updateEqtCount(key, item.count - 1 );
      } else {
        return Promise.resolve();
      }
    }
  }
  
  class DefaultLightTopology {
    quantityField = "quantity";
    constructor(/*quantityField*/) {}
    actorHasLightSource(actorId, lightSource) { 
      return lightSource.name === "Self";
    }
    getImage (actorId, lightSource) {
      return DEFAULT_IMAGE_URL;
    }
    getInventory (actorId, lightSource) {
      return 1;
    }
    async decrementInventory (actorId, lightSource) {
      return Promise.resolve();
    }
  }
  