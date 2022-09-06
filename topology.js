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
    _findMatchingItem(actor, lightSourceName) {
      return Array.from(actor.items).find(
        (item) => item.name.toLowerCase() === lightSourceName.toLowerCase()
      );
    }

    actorHasLightSource(actor, lightSource) {
      return !!this._findMatchingItem(actor, lightSource.name);
    }
  
    getImage (actor, lightSource) {
      let item = this._findMatchingItem(actor, lightSource.name);
      return item ? item.img : DEFAULT_IMAGE_URL;
    }
  
    getInventory (actor, lightSource) {
      if (!lightSource.consumable) return;
      let item = this._findMatchingItem(actor, lightSource.name);
      return item ? item.system[this.quantityField] : undefined;
    }
  
    async decrementInventory (actor, lightSource) {
      if (!lightSource.consumable) return Promise.resolve();
      let item = this._findMatchingItem(actor, lightSource.name);
      if (item && item.system[this.quantityField] > 0) {
        let fieldsToUpdate = {};
        fieldsToUpdate["system." + this.quantityField] = item.system[this.quantityField] - 1;
        return item.update(fieldsToUpdate);
      } else {
        return Promise.resolve();
      }
    }
    async setInventory (actor, lightSource, count) {
      if (!lightSource.consumable) return Promise.resolve();
      let item = this._findMatchingItem(actor, lightSource.name);
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

    actorHasLightSource(actor, lightSource) {
      let [item] = actor.findEquipmentByName(lightSource.name);
      return !!item;
    }

    getImage (/*actor, lightSource*/) {
      // We always use the same image because the system doesn't supply them
      return DEFAULT_IMAGE_URL;
    }
  
    getInventory (actor, lightSource) {
      let [item] = actor.findEquipmentByName(lightSource.name);
      return item ? item.count : undefined;
    }

    async decrementInventory (actor, lightSource) {
      if (!lightSource.consumable) return Promise.resolve();
      let [item, key] = actor.findEquipmentByName(lightSource.name);
      if (item && item.count > 0) {
        actor.updateEqtCount(key, item.count - 1);
      }
      return Promise.resolve();
    }

    async setInventory (actor, lightSource, count) {
      if (!lightSource.consumable) return Promise.resolve();
      let [item, key] = actor.findEquipmentByName(lightSource.name);
      if (item) {
        actor.updateEqtCount(key, count);
      }
      return Promise.resolve();
    }
  }
  
  class DefaultLightTopology {
    quantityField = "quantity";
    constructor(/*quantityField*/) {}
    actorHasLightSource(actor, lightSource) { 
      return lightSource.name === "Self";
    }
    getImage (actor, lightSource) {
      return DEFAULT_IMAGE_URL;
    }
    getInventory (actor, lightSource) {
      return 1;
    }
    async decrementInventory (actor, lightSource) {
      return Promise.resolve();
    }
  }
  