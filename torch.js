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

			await canvas.scene.createEmbeddedEntity("Token", [
				{"actorData":{}, "actorId":tkn.actor._id, "actorLink":false, "bar1":{"attribute":""}, "bar2":{"attribute":""}, "brightLight":0, "brightSight":0, "dimLight":10, "dimSight":0, "displayBars":CONST.TOKEN_DISPLAY_MODES.NONE, "displayName":CONST.TOKEN_DISPLAY_MODES.HOVER, "disposition":CONST.TOKEN_DISPOSITIONS.FRIENDLY, "flags":{}, "height":1, "hidden":false, "img":"systems/dnd5e/icons/spells/light-air-fire-1.jpg", "lightAlpha":1, "lightAngle":360, "lockRotation":false, "mirrorX":false, "name":"Dancing Light", "randomimg":false, "rotation":0, "scale":0.25, "sightAngle":360, "vision":v, "width":1, "x":c.x - hoff, "y":c.y - voff},
				{"actorData":{}, "actorId":tkn.actor._id, "actorLink":false, "bar1":{"attribute":""}, "bar2":{"attribute":""}, "brightLight":0, "brightSight":0, "dimLight":10, "dimSight":0, "displayBars":CONST.TOKEN_DISPLAY_MODES.NONE, "displayName":CONST.TOKEN_DISPLAY_MODES.HOVER, "disposition":CONST.TOKEN_DISPOSITIONS.FRIENDLY, "flags":{}, "height":1, "hidden":false, "img":"systems/dnd5e/icons/spells/light-air-fire-1.jpg", "lightAlpha":1, "lightAngle":360, "lockRotation":false, "mirrorX":false, "name":"Dancing Light", "randomimg":false, "rotation":0, "scale":0.25, "sightAngle":360, "vision":v, "width":1, "x":c.x, "y":c.y - voff},
				{"actorData":{}, "actorId":tkn.actor._id, "actorLink":false, "bar1":{"attribute":""}, "bar2":{"attribute":""}, "brightLight":0, "brightSight":0, "dimLight":10, "dimSight":0, "displayBars":CONST.TOKEN_DISPLAY_MODES.NONE, "displayName":CONST.TOKEN_DISPLAY_MODES.HOVER, "disposition":CONST.TOKEN_DISPOSITIONS.FRIENDLY, "flags":{}, "height":1, "hidden":false, "img":"systems/dnd5e/icons/spells/light-air-fire-1.jpg", "lightAlpha":1, "lightAngle":360, "lockRotation":false, "mirrorX":false, "name":"Dancing Light", "randomimg":false, "rotation":0, "scale":0.25, "sightAngle":360, "vision":v, "width":1, "x":c.x - hoff, "y":c.y},
				{"actorData":{}, "actorId":tkn.actor._id, "actorLink":false, "bar1":{"attribute":""}, "bar2":{"attribute":""}, "brightLight":0, "brightSight":0, "dimLight":10, "dimSight":0, "displayBars":CONST.TOKEN_DISPLAY_MODES.NONE, "displayName":CONST.TOKEN_DISPLAY_MODES.HOVER, "disposition":CONST.TOKEN_DISPOSITIONS.FRIENDLY, "flags":{}, "height":1, "hidden":false, "img":"systems/dnd5e/icons/spells/light-air-fire-1.jpg", "lightAlpha":1, "lightAngle":360, "lockRotation":false, "mirrorX":false, "name":"Dancing Light", "randomimg":false, "rotation":0, "scale":0.25, "sightAngle":360, "vision":v, "width":1, "x":c.x, "y":c.y}],
				{"temporary":false, "renderSheet":false});
		}

		/*
		 * Returns the first GM id.
		 */
		function firstGM() {
			let i;

			for (i=0; i<game.users.entities.length; i++) {
				if (game.users.entities[i].data.role >= 4 && game.users.entities[i].active)
					return game.users.entities[i].data._id;
			}
			ui.notifications.error("No GM available for Dancing Lights!");
		}

		async function sendRequest(req) {
			req.sceneId = canvas.scene._id
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
								if (item.data.quantity > 0) {
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

			if (data.isGM && !game.settings.get("torch", "gmUsesInventory"))
				return;
			if (game.system.id !== 'dnd5e')
				return;
			let actor = game.actors.get(data.actorId);
			if (actor === undefined)
				return;

			// First, check for the light cantrip...
			actor.data.items.forEach((item, offset) => {
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
					if (torch === -1 && item.name.toLowerCase() === itemToCheck.toLowerCase() && item.data.quantity > 0) {
						torch = offset;
					}
				}
			});
			if (torch < 0)
				return;

			// Now, remove a torch from inventory...
			await actor.updateOwnedItem({"_id": actor.data.items[torch]._id, "data.quantity": actor.data.items[torch].data.quantity - 1});
		}

		// Don't let Dancing Lights have/use torches. :D
		if (data.name === 'Dancing Light' &&
		    data.dimLight === 20 &&
		    data.brightLight === 10) {
			return;
		}

		if (data.isGM === true || game.settings.get("torch", "playerTorches") === true) {
			let dimRadius = game.settings.get("torch", "dimRadius");
			let brightRadius = game.settings.get("torch", "brightRadius");
			let tbutton = $(`<div class="control-icon torch"><i class="fas fa-fire"></i></div>`);
			let allowEvent = true;
			let ht = hasTorch();
			let oldTorch = app.object.getFlag("torch", "oldValue");
			let newTorch = app.object.getFlag("torch", "newValue");

			// Clear torch flags if light has been changed somehow.
			if (newTorch !== undefined && newTorch !== null && newTorch !== 'Dancing Lights' && (newTorch !== data.brightLight + '/' + data.dimLight)) {
				await app.object.setFlag("torch", "oldValue", null);
				await app.object.setFlag("torch", "newValue", null);
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
					let oldTorch = app.object.getFlag("torch", "oldValue");
					let newTorch = app.object.getFlag("torch", "newValue");

					ev.preventDefault();
					ev.stopPropagation();
					if (ev.ctrlKey) {	// Forcing light off...
						data.brightLight = game.settings.get("torch", "offBrightRadius");
						data.dimLight = game.settings.get("torch", "offDimRadius");
						await app.object.setFlag("torch", "oldValue", null);
						await app.object.setFlag("torch", "newValue", null);
						await sendRequest({"requestType": "removeDancingLights"});
						btn.removeClass("active");
					}
					else if (oldTorch === null || oldTorch === undefined) {	// Turning light on...
						await app.object.setFlag("torch", "oldValue", data.brightLight + '/' + data.dimLight);
						if (ht === 'Dancing Lights') {
							await createDancingLights();
							await app.object.setFlag("torch", "newValue", 'Dancing Lights');
						}
						else {
							if (brightRadius > data.brightLight)
								data.brightLight = brightRadius;
							if (dimRadius > data.dimLight)
								data.dimLight = dimRadius;
							await app.object.setFlag("torch", "newValue", data.brightLight + '/' + data.dimLight);
						}
						btn.addClass("active");
						useTorch();
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
						await app.object.setFlag("torch", "newValue", null);
						await app.object.setFlag("torch", "oldValue", null);
						btn.removeClass("active");
					}
					await app.object.update({brightLight: data.brightLight, dimLight: data.dimLight});
				});
			}
		}
	}

	static async handleSocketRequest(req) {
		if (req.addressTo === undefined || req.addressTo === game.user._id) {
			let scn = game.scenes.get(req.sceneId);
			let tkn = scn.data.tokens.find(({_id}) => _id === req.tokenId);
			let dltoks=[];

			switch(req.requestType) {
				case 'removeDancingLights':
					scn.data.tokens.forEach(tok => {
						if (tok.actorId === tkn.actorId &&
						    tok.name === 'Dancing Light' &&
						    tok.dimLight === 20 &&
						    tok.brightLight === 10) {
							//let dltok = canvas.tokens.get(tok._id);
							dltoks.push(scn.getEmbeddedEntity("Token", tok._id)._id);
						}
					});
					await scn.deleteEmbeddedEntity("Token", dltoks);
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
