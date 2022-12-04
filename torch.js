import Settings from "./settings.js";
import TorchSocket from "./socket.js";
import TokenHUD from "./hud.js";
import TorchToken from "./token.js";
import SourceLibrary from "./library.js";

/*
 * ----------------------------------------------------------------------------
 * "THE BEER-WARE LICENSE" (Revision 42):
 * <shurd@FreeBSD.ORG> wrote this file.  As long as you retain this notice you
 * can do whatever you want with this stuff. If we meet some day, and you think
 * this stuff is worth it, you can buy me a beer in return.        Stephen Hurd
 * ----------------------------------------------------------------------------
 */

let DEBUG = true;

let debugLog = (...args) => {
  if (DEBUG) {
    console.log(...args);
  }
};
class Torch {
  /*
   * Add a torch button to the Token HUD - called from TokenHUD render hook
   */
  static async addTorchButton(hud, hudHtml, hudData) {
    let library = await SourceLibrary.load(
      game.system.id,
      Settings.lightRadii.bright, 
      Settings.lightRadii.dim, 
      Settings.inventoryItemName, 
      Settings.gameLightSources, 
      hud.object.actor.prototypeToken.light,
    );
    let token = new TorchToken(hud.object.document, library);
    let lightSources = token.ownedLightSources;

    // Don't let the tokens we create for light sources have or use their own
    // light sources recursively.
    if (hud.object.document.name in lightSources) return;
	if (!game.user.isGM && !Settings.playerTorches) return;
	if (!token.currentLightSource) return;

	/* Manage torch state */
	TokenHUD.addFlameButton(
	  token,
	  hudHtml,
	  Torch.forceSourceOff,
	  Torch.toggleLightSource,
	  Torch.toggleLightHeld,
	  Torch.changeLightSource
	);
  }

  static async toggleLightSource(token) {
    let newState = await token.advanceState();
    debugLog(`${token.currentLightSource} is now ${newState}`);
  }

  static async forceSourceOff(token) {
    await token.forceSourceOff();
    debugLog(`Forced ${token.currentLightSource} off`);
  }

  static async toggleLightHeld(token) {

  }

  static async changeLightSource(token, name) {
	  await token.setCurrentLightSource(name);
  }

  static setupQuenchTesting() {
    console.log("Torch | --- In test environment - load test code...");
    import("./test/test-hook.js")
      .then((obj) => {
        try {
          obj.hookTests();
          console.log("Torch | --- Tests ready");
        } catch (err) {
          console.log("Torch | --- Error registering test code", err);
        }
      })
      .catch((err) => {
        console.log("Torch | --- No test code found", err);
      });
  }
}

Hooks.on("ready", () => {
  Hooks.on("renderTokenHUD", (app, html, data) => {
    Torch.addTorchButton(app, html, data);
  });
  Hooks.on("renderControlsReference", (app, html, data) => {
    html.find("div").first().append(Settings.helpText);
  });
  game.socket.on("module.torch", (request) => {
    TorchSocket.handleSocketRequest(request);
  });
});

Hooks.once("init", () => {
  // Only load and initialize test suite if we're in a test environment
  if (game.world.id.startsWith("torch-test-")) {
    Torch.setupQuenchTesting();
  }
  Settings.register();
});

console.log("Torch | --- Module loaded");
