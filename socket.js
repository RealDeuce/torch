import LightSource from "./sources.js";

export default class TorchSocket {
  /*
   * Handle any requests that might have been remoted to a GM via a socket
   */
  static async handleSocketRequest(req) {
    if (req.addressTo === undefined || req.addressTo === game.user.id) {
      let scene = game.scenes.get(req.sceneId);
      let token = scene.tokens.get(req.tokenId);
      if (LightSource.supports(req.requestType)) {
        await LightSource.perform(req.requestType, scene, token);
      } else {
        console.warning(
          `Torch | --- Attempted unregistered socket action ${req.requestType}`
        );
      }
    }
  }

  /* 
   * See if this light source supports a socket request for this action
   */
  static requestSupported(action, lightSource) {
    return LightSource.supports(`${action}:${lightSource}`);
  }

  /*
   * Send a request to a user permitted to perform the operation or
   * (if you are permitted) perform it yourself.
   */
  static async sendRequest(tokenId, action, lightSource) {
    let req = {
      requestType: `${action}:${lightSource}`,
      sceneId: canvas.scene.id,
      tokenId: tokenId,
    };

    if (LightSource.supports(req.requestType)) {
      if (LightSource.isPermitted(game.user, req.requestType)) {
        TorchSocket.handleSocketRequest(req);
        return true;
      } else {
        let recipient = game.users.contents.find((user) => {
          return (
            user.active && LightSource.isPermitted(user, req.requestType)
          );
        });
        if (recipient) {
          req.addressTo = recipient.id;
          game.socket.emit("module.torch", req);
          return true;
        } else {
          ui.notifications.error("No GM available for Dancing Lights!");
          return false;
        }
      }
    } else {
      console.warning(
        `Torch | --- Requested unregistered socket action ${req.requestType}`
      );
    }
  }
}
