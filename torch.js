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
		function sendRequest(req) {
			req.from = game.user._id;
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
		 * Returns the first GM id.
		 */
		function firstGM() {
			let i;

			for (i=0; i<game.users.entities.length; i++) {
				if (game.users.entities[i].data.role >= 4 && game.users.entities[i].data.active)
					return game.users.entities[i].data._id;
			}
			ui.notifications.error("No GM available for Dancing Lights!");
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
							if (item.name.toLowerCase() === 'torch') {
								if (item.data.quantity > 0) {
									torches = 'Torch';
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
					if (torch === -1 && item.name.toLowerCase() === 'torch' && item.data.quantity > 0) {
						torch = offset;
					}
				}
			});
			if (torch < 0)
				return;

			// Now, remove a torch from inventory...
			actor.data.items[torch].data.quantity -= 1;
			await actor.updateOwnedItem(actor.data.items[torch]);
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
						sendRequest({"requestType": "removeDancingLights"});
						btn.removeClass("active");
					}
					else if (oldTorch === null || oldTorch === undefined) {	// Turning light on...
						await app.object.setFlag("torch", "oldValue", data.brightLight + '/' + data.dimLight);
						if (ht === 'Dancing Lights') {
							sendRequest({"requestType": "createDancingLights"});
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
							sendRequest({"requestType": "removeDancingLights"});
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
					await app.object.update(canvas.scene._id, {brightLight: data.brightLight, dimLight: data.dimLight});
				});
			}
		}
	}

	static async handleSocketRequest(req) {
		if (req.addressTo === undefined || req.addressTo === game.user._id) {
			let scn = game.scenes.get(req.sceneId);
			let frm = game.users.get(req.from);
			let tkn = canvas.tokens.get(req.tokenId);
			let c = tkn.center;
			let voff = tkn.h;
			let hoff = tkn.w;
			let dltoks=[];
			let i;

			switch(req.requestType) {
				case 'removeDancingLights':
					scn.data.tokens.forEach(tok => {
						if (tok.actorId === tkn.actor._id &&
						    tok.name === 'Dancing Light' &&
						    tok.dimLight === 20 &&
						    tok.brightLight === 10) {
							let dltok = canvas.tokens.get(tok.id);
							dltoks.push(dltok);
						}
					});
					for (i=0; i<dltoks.length; i++) {
						await dltoks[i].delete(req.sceneId);
					}
					break;
				case 'createDancingLights':
					await Token.create(req.sceneId, {"name":"Dancing Light","actorId":tkn.actor._id,"disposition":1,"brightLight":10,"dimLight":20,"x":c.x - hoff, "y":c.y - voff, "img":"systems/dnd5e/icons/spells/light-air-fire-1.jpg", "scale":0.25});
					await Token.create(req.sceneId, {"name":"Dancing Light","actorId":tkn.actor._id,"disposition":1,"brightLight":10,"dimLight":20,"x":c.x, "y":c.y - voff, "img":"systems/dnd5e/icons/spells/light-air-fire-1.jpg", "scale":0.25});
					await Token.create(req.sceneId, {"name":"Dancing Light","actorId":tkn.actor._id,"disposition":1,"brightLight":10,"dimLight":20,"x":c.x - hoff, "y":c.y, "img":"systems/dnd5e/icons/spells/light-air-fire-1.jpg", "scale":0.25});
					await Token.create(req.sceneId, {"name":"Dancing Light","actorId":tkn.actor._id,"disposition":1,"brightLight":10,"dimLight":20,"x":c.x, "y":c.y, "img":"systems/dnd5e/icons/spells/light-air-fire-1.jpg", "scale":0.25});
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
	}
	game.settings.register("torch", "brightRadius", {
		name: game.i18n.localize("TOKEN.VisionBrightEmit"),
		hint: game.i18n.localize("torch.brightRadius.hint"),
		scope: "world",
		config: true,
		default: 20,
		type: Number
	});
	game.settings.register("torch", "dimRadius", {
		name: game.i18n.localize("TOKEN.VisionDimEmit"),
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
		name: game.i18n.localize("torch.offBrightRadius.name"),
		hint: game.i18n.localize("torch.offBrightRadius.hint"),
		scope: "world",
		config: true,
		default: 0,
		type: Number
	});
});

console.log("--- Flame on!");
