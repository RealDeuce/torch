// Note: requests.js operates statically purely at the Foundry level, so scene and 
// token are Foundry objects. Token is *not* Torch's light source token object.

const NEEDED_PERMISSIONS = {
  // Don't want to do yourself something you can't undo without a GM -
  // so check for delete on create
  "create:Dancing Lights": ["TOKEN_CREATE", "TOKEN_DELETE"],
  "delete:Dancing Lights": ["TOKEN_DELETE"],
};

export default class TorchRequest {
	static ACTIONS = {
		"create:Dancing Lights": TorchRequest.createDancingLights,
		"delete:Dancing Lights": TorchRequest.removeDancingLights,
	};
	static isPermitted(user, requestType) {
    if (requestType in NEEDED_PERMISSIONS) {
      return NEEDED_PERMISSIONS[requestType].every((permission) => {
        return user.can(permission);
      });
    } else {
      return true;
    }
  }

  static supports(requestType) {
    return requestType in TorchRequest.ACTIONS;
  }

  static perform(requestType, scene, token, lightSettings) {
    TorchRequest.ACTIONS[requestType](scene, token, lightSettings);
  }

  // Dancing lights

  static async createDancingLights(scene, token, lightSettings) {
    let v = game.settings.get("torch", "dancingLightVision");
    let dancingLight = {
      actorData: {},
      actorId: token.actor.id,
      actorLink: false,
      bar1: { attribute: "" },
      bar2: { attribute: "" },
      displayBars: CONST.TOKEN_DISPLAY_MODES.NONE,
      displayName: CONST.TOKEN_DISPLAY_MODES.HOVER,
      disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
      flags: {},
      height: 1,
      hidden: false,
      light: lightSettings,
      lockRotation: false,
      name: "Dancing Light",
      randomimg: false,
      rotation: 0,
      sight: {
        bright: 0,
        dim: 0,
        angle: 360
      },
      texture: {
        src: "icons/magic/light/explosion-star-glow-orange.webp",
        scaleX: 0.25,
        scaleY: 0.25,
        rotation: 0
      },
      mirrorX: false,
      vision: v,
      width: 1,
    };
    let voff = scene.grid.size * token.height;
    let hoff = scene.grid.size * token.width;
    let c = { x: token.x + hoff / 2, y: token.y + voff / 2 };
    let tokens = [
      Object.assign({ x: c.x - hoff, y: c.y - voff }, dancingLight),
      Object.assign({ x: c.x, y: c.y - voff }, dancingLight),
      Object.assign({ x: c.x - hoff, y: c.y }, dancingLight),
      Object.assign({ x: c.x, y: c.y }, dancingLight),
    ];
    await scene.createEmbeddedDocuments("Token", tokens, {
      temporary: false,
      renderSheet: false,
    });
  }

  static async removeDancingLights(scene, reqToken, lightSettings) {
    let dltoks = [];
    scene.tokens.forEach((token) => {
      // If the token is a dancing light owned by this actor
      if (
        reqToken.actor.id === token.actor.id &&
        token.name === "Dancing Light"
      ) {
        dltoks.push(scene.getEmbeddedDocument("Token", token.id).id);
      }
    });
    await scene.deleteEmbeddedDocuments("Token", dltoks);
  }
}
