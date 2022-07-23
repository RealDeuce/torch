// TODO: Add help for right-click (select source) and shift-click (toggle hold)
const CTRL_REF_HTML = (turnOffLights, ctrlOnClick) => {
  return `
<h3>Torch</h3>
<ol class="hotkey-list">
	<li>
		<h4>${turnOffLights}</h4>
		<div class="keys">${ctrlOnClick}</div>
	</li>
</ol>
`;
};

export default class Settings {
  static get playerTorches() {
    return game.settings.get("torch", "playerTorches");
  }
  static get gmUsesInventory() {
    return game.settings.get("torch", "gmUsesInventory");
  }
  static get userUsesInventory() {
    return game.settings.get("torch", "playerUsesInventory");
  }

  static get inventoryItemName() {
    return game.settings.get("torch", "gmInventoryItemName");
  }
  static get lightRadii() {
    return {
      bright: game.settings.get("torch", "brightRadius"),
      dim: game.settings.get("torch", "dimRadius"),
    };
  }
  static get gameLightSources() {
    return game.settings.get("torch", "gameLightSources");
  }

  static get dancingLightsVision() {
    return game.system.id === "dnd5e"
     ? game.settings.get("torch", "dancingLightVision")
     : false;
  }

  static get helpText() {
    let turnOffLights = game.i18n.localize("torch.turnOffAllLights");
    let ctrlOnClick = game.i18n.localize("torch.holdCtrlOnClick");
    return CTRL_REF_HTML(turnOffLights, ctrlOnClick);
  }

  static register() {
    game.settings.register("torch", "playerTorches", {
      name: game.i18n.localize("torch.playerTorches.name"),
      hint: game.i18n.localize("torch.playerTorches.hint"),
      scope: "world",
      config: true,
      default: true,
      type: Boolean,
    });
    game.settings.register("torch", "gmUsesInventory", {
      name: game.i18n.localize("torch.gmUsesInventory.name"),
      hint: game.i18n.localize("torch.gmUsesInventory.hint"),
      scope: "world",
      config: true,
      default: false,
      type: Boolean,
    });
    game.settings.register("torch", "playerUsesInventory", {
      name: game.i18n.localize("torch.playerUsesInventory.name"),
      hint: game.i18n.localize("torch.playerUsesInventory.hint"),
      scope: "world",
      config: true,
      default: true,
      type: Boolean,
    });
    game.settings.register("torch", "gmInventoryItemName", {
      name: game.i18n.localize("torch.gmInventoryItemName.name"),
      hint: game.i18n.localize("torch.gmInventoryItemName.hint"),
      scope: "world",
      config: true,
      default: "torch",
      type: String,
    });
    game.settings.register("torch", "gameLightSources", {
      name: game.i18n.localize("torch.gameLightSources.name"),
      hint: game.i18n.localize("torch.gameLightSources.hint"),
      filePicker: "any",
      scope: "world",
      config: true,
      default: "",
      type: String,
    });
    game.settings.register("torch", "brightRadius", {
      name: game.i18n.localize("torch.brightRadius.name"),
      hint: game.i18n.localize("torch.brightRadius.hint"),
      scope: "world",
      config: true,
      default: 20,
      type: Number,
    });
    game.settings.register("torch", "dimRadius", {
      name: game.i18n.localize("torch.dimRadius.name"),
      hint: game.i18n.localize("torch.dimRadius.hint"),
      scope: "world",
      config: true,
      default: 40,
      type: Number,
    });
    if (game.system.id === "dnd5e") {
      game.settings.register("torch", "dancingLightVision", {
        name: game.i18n.localize("torch.dancingLightVision.name"),
        hint: game.i18n.localize("torch.dancingLightVision.hint"),
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
      });
    }
  }
}
