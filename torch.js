/*
 * ----------------------------------------------------------------------------
 * "THE BEER-WARE LICENSE" (Revision 42):
 * <shurd@FreeBSD.ORG> wrote this file.  As long as you retain this notice you
 * can do whatever you want with this stuff. If we meet some day, and you think
 * this stuff is worth it, you can buy me a beer in return.        Stephen Hurd
 * ----------------------------------------------------------------------------
 */

class Torch {
	static async addTorchButton(app, html, data) {
		async function createDancingLights() {
			let tkn = canvas.tokens.get(app.object.id);
			let voff = tkn.h;
			let hoff = tkn.w;
			let c = tkn.center;
			let v = game.settings.get("torch", "dancingLightVision")
			let tokens = [
				{"actorData":{}, "actorId":tkn.actor.id, "actorLink":false, "bar1":{"attribute":""}, "bar2":{"attribute":""}, "brightLight":0, "brightSight":0, "dimLight":10, "dimSight":0, "displayBars":CONST.TOKEN_DISPLAY_MODES.NONE, "displayName":CONST.TOKEN_DISPLAY_MODES.HOVER, "disposition":CONST.TOKEN_DISPOSITIONS.FRIENDLY, "flags":{}, "height":1, "hidden":false, "img":"systems/dnd5e/icons/spells/light-air-fire-1.jpg", "lightAlpha":1, "lightAngle":360, "lockRotation":false, "mirrorX":false, "name":"Dancing Light", "randomimg":false, "rotation":0, "scale":0.25, "sightAngle":360, "vision":v, "width":1, "x":c.x - hoff, "y":c.y - voff},
				{"actorData":{}, "actorId":tkn.actor.id, "actorLink":false, "bar1":{"attribute":""}, "bar2":{"attribute":""}, "brightLight":0, "brightSight":0, "dimLight":10, "dimSight":0, "displayBars":CONST.TOKEN_DISPLAY_MODES.NONE, "displayName":CONST.TOKEN_DISPLAY_MODES.HOVER, "disposition":CONST.TOKEN_DISPOSITIONS.FRIENDLY, "flags":{}, "height":1, "hidden":false, "img":"systems/dnd5e/icons/spells/light-air-fire-1.jpg", "lightAlpha":1, "lightAngle":360, "lockRotation":false, "mirrorX":false, "name":"Dancing Light", "randomimg":false, "rotation":0, "scale":0.25, "sightAngle":360, "vision":v, "width":1, "x":c.x, "y":c.y - voff},
				{"actorData":{}, "actorId":tkn.actor.id, "actorLink":false, "bar1":{"attribute":""}, "bar2":{"attribute":""}, "brightLight":0, "brightSight":0, "dimLight":10, "dimSight":0, "displayBars":CONST.TOKEN_DISPLAY_MODES.NONE, "displayName":CONST.TOKEN_DISPLAY_MODES.HOVER, "disposition":CONST.TOKEN_DISPOSITIONS.FRIENDLY, "flags":{}, "height":1, "hidden":false, "img":"systems/dnd5e/icons/spells/light-air-fire-1.jpg", "lightAlpha":1, "lightAngle":360, "lockRotation":false, "mirrorX":false, "name":"Dancing Light", "randomimg":false, "rotation":0, "scale":0.25, "sightAngle":360, "vision":v, "width":1, "x":c.x - hoff, "y":c.y},
				{"actorData":{}, "actorId":tkn.actor.id, "actorLink":false, "bar1":{"attribute":""}, "bar2":{"attribute":""}, "brightLight":0, "brightSight":0, "dimLight":10, "dimSight":0, "displayBars":CONST.TOKEN_DISPLAY_MODES.NONE, "displayName":CONST.TOKEN_DISPLAY_MODES.HOVER, "disposition":CONST.TOKEN_DISPOSITIONS.FRIENDLY, "flags":{}, "height":1, "hidden":false, "img":"systems/dnd5e/icons/spells/light-air-fire-1.jpg", "lightAlpha":1, "lightAngle":360, "lockRotation":false, "mirrorX":false, "name":"Dancing Light", "randomimg":false, "rotation":0, "scale":0.25, "sightAngle":360, "vision":v, "width":1, "x":c.x, "y":c.y}];
			
			if (canvas.scene.createEmbeddedDocuments) { // 0.8
				await canvas.scene.createEmbeddedDocuments("Token", tokens, {"temporary":false, "renderSheet":false});
			} else {
				await canvas.scene.createEmbeddedEntity("Token", tokens, {"temporary":false, "renderSheet":false});
			}
		}

		/*
		 * Returns the first GM id.
		 */
		function firstGM() {
			let i;
			if (game.users.contents) { // 0.8
				for (i=0; i<game.users.contents.length; i++) {
					if (game.users.contents[i].data.role >= 4 && game.users.contents[i].active)
						return game.users.contents[i].data._id;
				}
			} else {
				for (i=0; i<game.users.entities.length; i++) {
					if (game.users.entities[i].data.role >= 4 && game.users.entities[i].active)
						return game.users.entities[i].data._id;
				}
			}
			ui.notifications.error("No GM available for Dancing Lights!");
		}

		async function sendRequest(req) {
			req.sceneId = canvas.scene.id ? canvas.scene.id : canvas.scene._id;
			req.tokenId = app.object.id;

			if (!data.isGM) {
				req.addressTo = firstGM();
				game.socket.emit("module.torch", req);
			}
			else {
				Torch.handleSocketRequest(req);
			}
		}

		/*
		 * Returns true if a torch can be used... ie:
		 * 1) If the user is the GM.
		 * 2) If the system is not dnd5e, and the playerTorches setting is enabled.
		 * 3) If a dnd5e player knows the Light spell.
		 * 4) if a dnd5e player has at least one torch in inventory
		 */
		function hasTorch() {
			let torches = null;

			if (game.system.id !== 'dnd5e') {
				if (game.settings.get("torch", "playerTorches"))
					torches = 'Player';
				if (data.isGM)
					torches = 'GM';
			}
			else {
				let actor = game.actors.get(data.actorId);
				if (actor === undefined)
					return false;
				actor.data.items.forEach(item => {
					if (item.type === 'spell') {
						if (item.name === 'Light') {
							torches = 'Light';
							return;
						}
						if (item.name === 'Dancing Lights') {
							torches = 'Dancing Lights';
							return;
						}
					}
					else {
						if (torches === null) {
							var itemToCheck = game.settings.get("torch", "gmInventoryItemName");
							if (item.name.toLowerCase() === itemToCheck.toLowerCase()) {
								let quantity = typeof item.data.quantity !== "undefined" ? item.data.quantity : item.data.data.quantity;
								if (quantity > 0) {
									torches = itemToCheck;
									return;
								}
							}
						}
					}
				});
				if (torches === null && data.isGM)
					torches = 'GM';
			}
			return torches;
		}

		/*
		 * Performs inventory tracking for torch uses.  Deducts one
		 * torch from inventory if all of the following are true:
		 * 1) The system is dnd5e.
		 * 2) The player doesn't know the Light spell.
		 * 3) The player has at least one torch.
		 * 4) The user is not the GM or the gmUsesInventory setting is enabled.
		 */
		async function useTorch() {
			let torch = -1;
			let torchItem;

			if (game.system.id !== 'dnd5e')
				return;
			if (data.isGM && !game.settings.get("torch", "gmUsesInventory"))
				return;
			let actor = game.actors.get(data.actorId);
			if (actor === undefined)
				return;

			// First, check for the cantrips...
			actor.data.items.forEach((item) => { 
				if (item.type === 'spell') {
					if (item.name === 'Light') {
						torch = -2;
						return;
					}
					if (item.name === 'Dancing Lights') {
						torch = -3;
						return;
					}
				}
				else { 
					var itemToCheck = game.settings.get("torch", "gmInventoryItemName");
					if (torch === -1 && item.name.toLowerCase() === itemToCheck.toLowerCase() && 
						(item.data.data ? item.data.data.quantity : item.data.quantity) > 0) {
						torchItem = item;
					}
				}
			});
			if (!torchItem)
				return;

			// Now, remove a torch from inventory...
			if (torchItem.data.data) { //0.8
				await torchItem.update({"data.quantity": torchItem.data.data.quantity - 1});
			} else {
				await actor.updateOwnedItem({"_id": torchItem._id, "data.quantity": torchItem.data.quantity - 1});
			}
		}

		// Don't let Dancing Lights have/use torches. :D
		if (data.name === 'Dancing Light' &&
		    data.dimLight === 10 &&
		    data.brightLight === 0) {
			return;
		}

		if (data.isGM === true || game.settings.get("torch", "playerTorches") === true) {
			let dimRadius = game.settings.get("torch", "dimRadius");
			let brightRadius = game.settings.get("torch", "brightRadius");
			let tbutton = $(`<div class="control-icon torch"><i class="fas fa-fire"></i></div>`);
			let allowEvent = true;
			let ht = hasTorch();
			let tokenFlagHolder = app.object.document ? app.object.document : app.object;
			let oldTorch = tokenFlagHolder.getFlag("torch", "oldValue");
			let newTorch = tokenFlagHolder.getFlag("torch", "newValue");

			// Clear torch flags if light has been changed somehow.
			if (newTorch !== undefined && newTorch !== null && newTorch !== 'Dancing Lights' && (newTorch !== data.brightLight + '/' + data.dimLight)) {
				await tokenFlagHolder.setFlag("torch", "oldValue", null);
				await tokenFlagHolder.setFlag("torch", "newValue", null);
				oldTorch = null;
				newTorch = null;
			}

			if (newTorch !== undefined && newTorch !== null) {
				// If newTorch is still set, light hasn't changed.
				tbutton.addClass("active");
			}
			else if ((data.brightLight >= brightRadius && data.dimLight >= dimRadius && ht !== 'Dancing Lights') || ht === null) {
				/*
				 * If you don't have a torch, *or* you're already emitting more light than a torch,
				 * disallow the torch button
				 */
				let disabledIcon = $(`<i class="fas fa-slash" style="position: absolute; color: tomato"></i>`);
				tbutton.addClass("fa-stack");
				tbutton.find('i').addClass('fa-stack-1x');
				disabledIcon.addClass('fa-stack-1x');
				tbutton.append(disabledIcon);
				allowEvent = false;
			}
			html.find('.col.left').prepend(tbutton);
			if (allowEvent) {
				tbutton.find('i').click(async (ev) => {
					let btn = $(ev.currentTarget.parentElement);
					let dimRadius = game.settings.get("torch", "dimRadius");
					let brightRadius = game.settings.get("torch", "brightRadius");
					let oldTorch = tokenFlagHolder.getFlag("torch", "oldValue");
					let newTorch = tokenFlagHolder.getFlag("torch", "newValue");

					ev.preventDefault();
					ev.stopPropagation();
					if (ev.ctrlKey) {	// Forcing light off...
						data.brightLight = game.settings.get("torch", "offBrightRadius");
						data.dimLight = game.settings.get("torch", "offDimRadius");
						await tokenFlagHolder.setFlag("torch", "oldValue", null);
						await tokenFlagHolder.setFlag("torch", "newValue", null);
						await sendRequest({"requestType": "removeDancingLights"});
						btn.removeClass("active");
					}
					else if (oldTorch === null || oldTorch === undefined) {	// Turning light on...
						await tokenFlagHolder.setFlag("torch", "oldValue", data.brightLight + '/' + data.dimLight);
						if (ht === 'Dancing Lights') {
							await createDancingLights();
							await tokenFlagHolder.setFlag("torch", "newValue", 'Dancing Lights');
						}
						else {
							if (brightRadius > data.brightLight)
								data.brightLight = brightRadius;
							if (dimRadius > data.dimLight)
								data.dimLight = dimRadius;
							await tokenFlagHolder.setFlag("torch", "newValue", data.brightLight + '/' + data.dimLight);
						}
						btn.addClass("active");
						// The token light data update must happen before we call useTorch(). 
						// Updating the quantity on the token's embedded torch item, which happens inside useTorch(), triggers a HUD refresh. 
						// If the token light data isn't updated before that happens, the fresh HUD won't reflect the torch state we just changed.
						await tokenFlagHolder.update({brightLight: data.brightLight, dimLight: data.dimLight});
						await useTorch();
					}
					else { // Turning light off...
						if (newTorch === 'Dancing Lights') {
							await sendRequest({"requestType": "removeDancingLights"});
						}
						else {
							let thereBeLight = oldTorch.split('/');
							data.brightLight = parseFloat(thereBeLight[0]);
							data.dimLight = parseFloat(thereBeLight[1]);
						}
						await tokenFlagHolder.setFlag("torch", "newValue", null);
						await tokenFlagHolder.setFlag("torch", "oldValue", null);
						btn.removeClass("active");
						await tokenFlagHolder.update({brightLight: data.brightLight, dimLight: data.dimLight});
					}
				});
			}
		}
	}

	static async handleSocketRequest(req) {
		if (req.addressTo === undefined || req.addressTo === game.user._id) {
			let scn = game.scenes.get(req.sceneId);
			let tkn = scn.data.tokens.find((tokx) => tokx.id ? (tokx.id === req.tokenId) : (tokx._id === req.tokenId));
			let tknActorId = tkn.actor ? tkn.actor.id : tkn.actorId;
			let dltoks=[];

			switch(req.requestType) {
				case 'removeDancingLights':
					scn.data.tokens.forEach(tok => {
						if (tknActorId === (tok.actor ? tok.actor.id : tok.actorId) &&
						    tok.name === 'Dancing Light' &&
						    10 === (tok.data ? tok.data.dimLight : tok.dimLight) &&
						    0 === (tok.data ? tok.data.brightLight : tok.brightLight)) {
							//let dltok = canvas.tokens.get(tok._id);
							if (scn.getEmbeddedDocument) { // 0.8
								dltoks.push(scn.getEmbeddedDocument("Token", tok.id).id);
							} else {
								dltoks.push(scn.getEmbeddedEntity("Token", tok._id)._id);
							}
						}
					});
					if (scn.deleteEmbeddedDocuments) { // 0.8
						await scn.deleteEmbeddedDocuments("Token", dltoks);
					} else {
						await scn.deleteEmbeddedEntity("Token", dltoks);
					}
					break;
			}
		}
	}
}

Hooks.on('ready', () => {
	Hooks.on('renderTokenHUD', (app, html, data) => { Torch.addTorchButton(app, html, data) });
	Hooks.on('renderControlsReference', (app, html, data) => {
		html.find('div').first().append('<h3>Torch</h3><ol class="hotkey-list"><li><h4>'+
			game.i18n.localize("torch.turnOffAllLights")+
			'</h4><div class="keys">'+
			game.i18n.localize("torch.holdCtrlOnClick")+
			'</div></li></ol>');
	});
	game.socket.on("module.torch", request => {
		Torch.handleSocketRequest(request);
	});
});
Hooks.once("init", () => {
	game.settings.register("torch", "playerTorches", {
		name: game.i18n.localize("torch.playerTorches.name"),
		hint: game.i18n.localize("torch.playerTorches.hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean
	});
	if (game.system.id === 'dnd5e') {
		game.settings.register("torch", "gmUsesInventory", {
			name: game.i18n.localize("torch.gmUsesInventory.name"),
			hint: game.i18n.localize("torch.gmUsesInventory.hint"),
			scope: "world",
			config: true,
			default: false,
			type: Boolean
		});
		game.settings.register("torch", "gmInventoryItemName", {
			name: game.i18n.localize("torch.gmInventoryItemName.name"),
			hint: game.i18n.localize("torch.gmInventoryItemName.hint"),
			scope: "world",
			config: true,
			default: "torch",
			type: String
		});
	}
	game.settings.register("torch", "brightRadius", {
		name: game.i18n.localize("LIGHT.LightBright"),
		hint: game.i18n.localize("torch.brightRadius.hint"),
		scope: "world",
		config: true,
		default: 20,
		type: Number
	});
	game.settings.register("torch", "dimRadius", {
		name: game.i18n.localize("LIGHT.LightDim"),
		hint: game.i18n.localize("torch.dimRadius.hint"),
		scope: "world",
		config: true,
		default: 40,
		type: Number
	});
	game.settings.register("torch", "offBrightRadius", {
		name: game.i18n.localize("torch.offBrightRadius.name"),
		hint: game.i18n.localize("torch.offBrightRadius.hint"),
		scope: "world",
		config: true,
		default: 0,
		type: Number
	});
	game.settings.register("torch", "offDimRadius", {
		name: game.i18n.localize("torch.offDimRadius.name"),
		hint: game.i18n.localize("torch.offDimRadius.hint"),
		scope: "world",
		config: true,
		default: 0,
		type: Number
	});
	game.settings.register("torch", "dancingLightVision", {
		name: game.i18n.localize("torch.dancingLightVision.name"),
		hint: game.i18n.localize("torch.dancingLightVision.hint"),
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});
});

console.log("--- Flame on!");
