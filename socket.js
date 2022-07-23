import TorchRequest from "./request.js";

export default class TorchSocket {
  /*
   * Handle any requests that might have been remoted to a GM via a socket
   */
  static async handleSocketRequest(req) {
    if (req.addressTo === undefined || req.addressTo === game.user.id) {
      let scene = game.scenes.get(req.sceneId);
      let token = scene.tokens.get(req.tokenId);
      if (TorchRequest.supports(req.requestType)) {
        await TorchRequest.perform(req.requestType, scene, token, req.lightSettings);
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
    return TorchRequest.supports(`${action}:${lightSource}`);
  }

  /*
   * Send a request to a user permitted to perform the operation or
   * (if you are permitted) perform it yourself.
   */
  static async sendRequest(tokenId, action, lightSource, lightSettings) {
    let req = {
      requestType: `${action}:${lightSource}`,
      sceneId: canvas.scene.id,
      tokenId: tokenId,
      lightSettings: lightSettings
    };

    if (TorchRequest.supports(req.requestType)) {
      if (TorchRequest.isPermitted(game.user, req.requestType)) {
        TorchSocket.handleSocketRequest(req);
        return true;
      } else {
        let recipient = game.users.contents.find((user) => {
          return (
            user.active && TorchRequest.isPermitted(user, req.requestType)
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
