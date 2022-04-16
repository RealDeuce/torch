import TorchToken from '../token.js';
import SourceLibrary from '../library.js';

let initiateWith = async function(name, item, count, assert) {
  let foundryToken = game.scenes.active.tokens.getName(name);
  assert.ok(foundryToken, "Token for "+ name + " found in scene");
  let library = await SourceLibrary.load("dnd5e", 10, 20);
  assert.ok(library, "Library successfully created");
  library._presetInventory(foundryToken.actor.id, item, count);
  return new TorchToken(foundryToken, library);
}
export let torchCommonTokenTests = (context) => {
  const {describe, it, assert, afterEach} = context;
  describe('Torch Common Token Tests', () => {
    if (game.system.id === 'dnd5e') {
      describe('Token tests for D&D5e actors, scene, and tokens', () => {
        afterEach(async() => {
          SourceLibrary.commonLibrary = undefined;
        });
        it('Light source selection', async () => {
          let token = await initiateWith("Versatile", "Torch", 1, assert);
          let sources = token.ownedLightSources;
          let currentSource = token.currentLightSource;
          assert.ok(sources, "Owned light sources came back in one piece");
          assert.ok(currentSource, "The token has a current source");
        });
        it('Cycle of token states - torch', async () => {
          let token = await initiateWith("Versatile", "Torch", 1, assert);
          await token.forceStateOff()
          assert.equal(token.lightSourceState, token.STATE_OFF, "Token is off");
          await token.setCurrentLightSource("Torch");
          let exhausted = token.lightSourceIsExhausted("Torch");
          assert.equal(exhausted, false, "Torches are not exhausted when we start");
          await token.advanceState();
          assert.equal(token.lightSourceState, token.STATE_ON, "Token is on");
          await token.advanceState();
          assert.equal(token.lightSourceState, token.STATE_OFF, "Token is off");
          exhausted = token.lightSourceIsExhausted("Torch");
          assert.equal(exhausted, true, "Torches are exhausted when we're done");

        });
        it('Cycle of token states - hooded lantern', async () => {
          let token = await initiateWith("Versatile", "Torch", 1, assert);
          await token.forceStateOff()
          assert.equal(token.lightSourceState, token.STATE_OFF, "Token is off");
          await token.setCurrentLightSource("Hooded Lantern");
          let exhausted = token.lightSourceIsExhausted("Hooded Lantern");
          assert.equal(exhausted, false, "Hooded Lanterns are not exhausted when we start");
          await token.advanceState();
          assert.equal(token.lightSourceState, token.STATE_ON, "Token is on");
          await token.advanceState();
          assert.equal(token.lightSourceState, token.STATE_DIM, "Token is dim");
          await token.advanceState();
          assert.equal(token.lightSourceState, token.STATE_OFF, "Token is off");
          exhausted = token.lightSourceIsExhausted("Hooded Lantern");
          assert.equal(exhausted, false, "Hooded Lanterns are not exhausted when we're done either");
        });
      });
    }
  });
};
