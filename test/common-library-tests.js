import SourceLibrary from '../library.js';
export let torchCommonLibraryTests = (context) => {
  const {describe, it, assert, afterEach} = context;
  describe('Torch Common Library Tests', () => {
    describe('Library Loading tests', () => {
      afterEach(async() => {
        SourceLibrary.commonLibrary = undefined;
      });
      it('library load for D&D 5e without a user library', async () => {
        assert.notOk(SourceLibrary.commonLibrary, "no common library loaded initially");
        let library = await SourceLibrary.load('dnd5e', 10, 50, 'Torch');
        assert.ok(SourceLibrary.commonLibrary, "common library loaded");
        let candle = library.getLightSource("candle");
        assert.equal(candle.light[0].bright, 5, "common candle bright light level");
        assert.equal(candle.light[0].dim, 10, "common candle dim light level");
        let torch = library.getLightSource("torch");
        assert.equal(torch.light[0].bright, 10, "torch bright light level from settings");
        assert.equal(torch.light[0].dim, 50, "torch dim light level from settings");
        let phantom = library.getLightSource("phantom torch");
        assert.notOk(phantom,"No phantom torch defined as expected");
      });
      it('library load for D&D 5e with no user inventory item set', async () => {
        assert.notOk(SourceLibrary.commonLibrary, "no common library loaded initially");
        let library = await SourceLibrary.load('dnd5e', 50, 10, undefined);
        assert.ok(SourceLibrary.commonLibrary, "common library loaded");
        let candle = library.getLightSource("candle");
        assert.equal(candle.light[0].bright, 5, "common candle bright light level");
        assert.equal(candle.light[0].dim, 10, "common candle dim light level");
        assert.notOk(candle.light[0].alpha, "no candle alph level set");
        let torch = library.getLightSource("torch");
        assert.equal(torch.light[0].bright, 20, "common torch bright light level");
        assert.equal(torch.light[0].dim, 40, "common torch dim light level");
      });
      it('library load for D&D 5e with a user library', async () => {
        assert.notOk(SourceLibrary.commonLibrary, "no common library loaded initially");
        let library = await SourceLibrary.load('dnd5e', 10, 50, 'Torch', './userLights.json');
        assert.ok(SourceLibrary.commonLibrary, "common library loaded");
        let candle = library.getLightSource("candle");
        assert.equal(candle.light[0].bright, 10, "user candle bright light level");
        assert.equal(candle.light[0].dim, 15, "user candle dim light level");
        assert.equal(candle.light[0].alpha, 0.5, "user candle has alpha defined");
        let torch = library.getLightSource("torch");
        assert.equal(torch.light[0].bright, 10, "torch bright light level from settings");
        assert.equal(torch.light[0].dim, 50, "torch dim light level from settings");
        let phantom = library.getLightSource("phantom torch");
        assert.ok(phantom, "The phantom torch light source exists in the data");
        assert.equal(phantom.light[0].bright, 5, "user phantom torch bright light level");
        assert.equal(phantom.light[0].dim, 20, "user phantom torch bright light level");
      });
      it('library load for GURPS with a user library with a GURPS flashlight', async () => {
        assert.notOk(SourceLibrary.commonLibrary, "no common library loaded initially");
        let library = await SourceLibrary.load('test', 50, 10, 'Torch', './userLights.json');
        assert.ok(SourceLibrary.commonLibrary, "common library loaded");
        let candle = library.getLightSource("candle");
        assert.notOk(candle, "No candle defined as expected");
        let selfSource = library.getLightSource("self");
        assert.notOk(selfSource, "No self light source defined as expected");
        let flashlight = library.getLightSource("flashlight");
        assert.ok(flashlight, "Flashlight defined as expected");
        assert.equal(flashlight.light[0].bright, 10, "user flashlight light level");
        assert.equal(flashlight.light[0].dim, 0, "user flashlight light level");
        assert.equal(flashlight.light[0].angle, 3, "user flashlight light angle");
      });
    });
    if (game.system.id === 'dnd5e') {
      describe('Library topology tests for D&D5e actors', () => {
        it('Actor inventory settings for Versatile in D&D5e with a user library', async () => {
          let versatile = game.actors.getName("Versatile");
          assert.ok(versatile, "Actor Versatile found");
          let library = await SourceLibrary.load('dnd5e', 50, 10, 'Torch', './userLights.json');
          let torches = library.getInventory(versatile, "Torch");
          assert.ok(typeof torches === "number", "Count of torches has a numeric value");
          let candles = library.getInventory(versatile, "Candle");
          assert.ok(typeof candles === "number", "Count of candles has a numeric value");
          let lights = library.getInventory(versatile, "Light");
          assert.ok(typeof lights === "undefined", "Light cantrip doesn't have inventory");
          let lamps = library.getInventory(versatile, "Lamp");
          assert.ok(typeof lamps === "undefined", "Lamp doesn't have inventory");
          await library._presetInventory(versatile, "Torch", 2);
          let before = library.getInventory(versatile, "Torch");
          await library.decrementInventory(versatile, "Torch");
          let afterFirst = library.getInventory(versatile, "Torch");
          await library.decrementInventory(versatile, "Torch");
          let afterSecond = library.getInventory(versatile, "Torch");
          await library.decrementInventory(versatile, "Torch");
          let afterThird = library.getInventory(versatile, "Torch");
          assert.equal(before, 2, "Started with set value");
          assert.equal(afterFirst, 1, "Decremented to one");
          assert.equal(afterSecond, 0, "Decremented to zero");
          assert.equal(afterThird, 0, "Remained at zero");
        });
        it('Actor image settings for Versatile in D&D5e with a user library', async () => {
          let versatile = game.actors.getName("Versatile");
          assert.ok(versatile, "Actor Versatile found");
          let library = await SourceLibrary.load('dnd5e', 50, 10, 'Torch', './userLights.json');
          let torchImage = library.getImage(versatile, "Torch");
          assert.ok(torchImage, "Torch should have a defined image");
          assert.notEqual(torchImage,"", "Torch image has a reasonable value");
          let candleImage = library.getImage(versatile, "Candle");
          assert.ok(candleImage, "Candle should have a defined image");
          assert.notEqual(candleImage,"", "Candle image has a reasonable value");
          let lampImage = library.getImage(versatile, "Lamp");
          assert.ok(lampImage, "Lamp should have a defined image");
          assert.notEqual(lampImage,"", "Lamp image has a reasonable value");
          let lightImage = library.getImage(versatile, "Light");
          assert.ok(lightImage, "Light cantrip should have a defined image");
          assert.notEqual(lightImage,"", "Light cantrip image has a reasonable value");
        });
        it('Actor light sources for Lightbearer, Breaker, Empty, and Bic in D&D5e with a user library', async () => {
          let breaker = game.actors.getName("Breaker");
          assert.ok(breaker, "Actor Breaker found");
          let empty = game.actors.getName("Empty");
          assert.ok(empty, "Actor Empty found");
          let bearer = game.actors.getName("Torchbearer");
          assert.ok(bearer, "Actor Torchbearer found");
          let everythingBut = game.actors.getName("Bic");
          assert.ok(everythingBut, "Actor Bic found");
          let library = await SourceLibrary.load('dnd5e', 50, 10, 'Torch', './userLights.json');

          let breakerSources = library.actorLightSources(breaker); 
          assert.equal (breakerSources.length, 2, "Breaker has two known light sources");
          assert.notEqual(breakerSources[0].name, breakerSources[1].name, "Breaker's sources are different");
          assert.ok (["Torch", "Dancing Lights"].includes(breakerSources[0].name), "Breaker's first source is expected");
          assert.ok (["Torch", "Dancing Lights"].includes(breakerSources[1].name), "Breaker's second source is expected");
          assert.equal(library.actorHasLightSource(breaker, "Dancing Lights"), true, "Breaker is reported as having Dancing Lights");

          let bearerSources = library.actorLightSources(bearer);
          assert.equal(bearerSources.length, 1, "Torchbearer has precisely one light source");
          assert.equal(bearerSources[0].name, "Torch", "Torchbearer's light source is Torch, as eqpected");
          assert.equal(library.actorHasLightSource(bearer, "Torch"), true, "Bearer is reported as having the Torch light source");

          let emptySources = library.actorLightSources(empty);
          assert.equal (emptySources.length, 0, "Empty truly has no known light sources");
          assert.equal(library.actorHasLightSource(empty, "Candle"), false, "Empty is reported as not having the candle light source");

          let everythingButSources = library.actorLightSources(everythingBut);
          assert.equal(everythingButSources.length, 0, "Bic has no known light sources, even though it has ways of casting light");
          assert.equal(library.actorHasLightSource(everythingBut, "Candle"), false, "Empty is reported as not having the candle light source");
        });
      });
    }
  });
};
