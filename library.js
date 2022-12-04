import getTopology from './topology.js';

/* Library of light sources to use for this system */

export default class SourceLibrary {
  static commonLibrary;
  library;
  constructor(library) { // Only invoke through static factory method load()
    this.library = library;
  }
  
  static async load(systemId, selfBright, selfDim, selfItem, userLibrary, protoLight) {
    // The common library is cached - to update it, you must reload the game.
    if (!SourceLibrary.commonLibrary) {
      SourceLibrary.commonLibrary = await fetch('/modules/torch/sources.json')
        .then( response => { return response.json(); });
    }
    let defaultLight = Object.assign({}, protoLight);
    defaultLight.bright = selfBright;
    defaultLight.dim = selfDim;
    let configuredLight = { 
      system: systemId,
      name: selfItem, 
      states: 2,
      light: [ defaultLight ]
    };
    // The user library reloads every time you open the HUD to permit cut and try.
    let mergedLibrary = userLibrary ? await fetch(userLibrary)
      .then( response => { return response.json(); })
      .then( userData => { return mergeLibraries (userData, SourceLibrary.commonLibrary, configuredLight); })
      .catch(reason => {
        console.warn("Failed loading user library: ", reason);
      }) : mergeLibraries (
        {}, SourceLibrary.commonLibrary, configuredLight);
    // All local changes here take place against the merged data, which is a copy, 
    // not against the common or user libraries.
    if (mergedLibrary[systemId]) {
      mergedLibrary[systemId].topology = getTopology(
        mergedLibrary[systemId].topology, 
        mergedLibrary[systemId].quantity);
      let library = new SourceLibrary(mergedLibrary[systemId]);
      return library;
    } else {
      mergedLibrary["default"].topology = getTopology(
        mergedLibrary["default"].topology, 
        mergedLibrary["default"].quantity);

      let defaultLibrary = mergedLibrary["default"];
      defaultLibrary.sources["Self"].light[0].bright = selfBright;
      defaultLibrary.sources["Self"].light[0].dim = selfDim;
      return new SourceLibrary(defaultLibrary);
    }
  }

  /* Instance methods */
  get lightSources() {
    return this.library.sources;
  }
  getLightSource(name) {
    if (name) {
      for (let sourceName in this.library.sources) {
        if (sourceName.toLowerCase() === name.toLowerCase()) {
          return this.library.sources[sourceName];
        }
      }
    }
    return;
  }
  getInventory(actor, lightSourceName) {
    let source = this.getLightSource(lightSourceName);
    return this.library.topology.getInventory(actor, source);
  }
  async _presetInventory(actor, lightSourceName, quantity) { // For testing
    let source = this.getLightSource(lightSourceName);
    return this.library.topology.setInventory(actor, source, quantity);
  }
  async decrementInventory(actor, lightSourceName) {
    let source = this.getLightSource(lightSourceName);
    return this.library.topology.decrementInventory(actor, source);
  }
  getImage(actor, lightSourceName) {
    let source = this.getLightSource(lightSourceName);
    return this.library.topology.getImage(actor, source);
  }
  actorHasLightSource(actor, lightSourceName) {
    let source = this.getLightSource(lightSourceName);
    return this.library.topology.actorHasLightSource(actor, source);
  }
  actorLightSources(actor) {
    let result = []
    for (let source in this.library.sources) {
      if (this.library.topology.actorHasLightSource(actor, this.library.sources[source])) {
        let actorSource = Object.assign({
          image: this.library.topology.getImage(actor, this.library.sources[source])
        }, this.library.sources[source]);
        result.push(actorSource);
      }
    }
    return result;
  }
}

/* 
 * Create a merged copy of two libraries.
 */
let mergeLibraries = function (userLibrary, commonLibrary, configuredLight) {
  let mergedLibrary = {}

  // Merge systems - system properties come from common library unless the system only exists in user library
  for (let system in commonLibrary) {
    mergedLibrary[system] = {
      system: commonLibrary[system].system,
      topology: commonLibrary[system].topology,
      quantity: commonLibrary[system].quantity,
      sources: {}      
    }
  }
  if (userLibrary) {
    for (let system in userLibrary) {
      if (!(system in commonLibrary)) {
        mergedLibrary[system] = {
          system: userLibrary[system].system,
          topology: userLibrary[system].topology,
          quantity: userLibrary[system].quantity,
          sources: {}      
        }  
      }
    }
  }

  // Merge sources - source properties in user library override properties in common library
  for (let system in mergedLibrary) {
    if (userLibrary && (system in userLibrary)) {
      for (let source in userLibrary[system].sources) {
        let userSource = userLibrary[system].sources[source];
        mergedLibrary[system].sources[source] = {
          "name": userSource["name"],
          "type": userSource["type"],
          "consumable": userSource["consumable"],
          "states": userSource["states"],
          "light": Object.assign({}, userSource["light"] )
        };
      }
    }
    // Source properties for configured source override common library but not user library
    let configuredName = "";
    if (configuredLight.name) {
      let inUserLibrary = false;
      let template = null;
      if (system === configuredLight.system) {
        for (let source in mergedLibrary[system].sources) {
          if (source.toLowerCase() === configuredLight.name.toLowerCase()) {
            inUserLibrary = true;
            break;
          }
        }
        if (!inUserLibrary && commonLibrary[system]) {
          for (let source in commonLibrary[system].sources) {
            if (source.toLowerCase() === configuredLight.name.toLowerCase()) {
              configuredName = source;
              template = commonLibrary[system].sources[source];
              break;
            }
          }
          if (!configuredName) { 
            configuredName = configuredLight.name; //But might be blank
          }
          // We finally have the best name to use and perhaps a template
          // We can build one
          mergedLibrary[system].sources[configuredName] = {
            "name": configuredName,
            "type": template ? template["type"] :"equipment",
            "consumable": template ? template["consumable"] : true,
            "states": configuredLight.states,
            "light": configuredLight.light
          };          
        }
      }
    }
    // Finally, we will deal with the common library for whatever is left
    if (system in commonLibrary) {
      for (let source in commonLibrary[system].sources) {
        if ((!userLibrary || !(system in userLibrary) || 
             !(source in userLibrary[system].sources)) &&  
             (!configuredName || source !== configuredName)) {
          let commonSource = commonLibrary[system].sources[source];
          mergedLibrary[system].sources[source] = {
            "name": commonSource["name"],
            "type": commonSource["type"],
            "consumable": commonSource["consumable"],
            "states": commonSource["states"],
            "light":  Object.assign({}, commonSource["light"] )
          } 
        }
      }
    }
  }  
  return mergedLibrary;
};
