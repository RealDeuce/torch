/*
 * ----------------------------------------------------------------------------
 * "THE BEER-WARE LICENSE" (Revision 42):
 * <shurd@FreeBSD.ORG> wrote this file.  As long as you retain this notice you
 * can do whatever you want with this stuff. If we meet some day, and you think
 * this stuff is worth it, you can buy me a beer in return.        Stephen Hurd
 * ----------------------------------------------------------------------------
 */

class Torch {

	static async createDancingLights(tokenId) {
		let token = canvas.tokens.get(tokenId);
		let v = game.settings.get("torch", "dancingLightVision");
		let dancingLight = {
			"actorData":{}, "actorId":token.actor.id, "actorLink":false, 
			"bar1":{"attribute":""}, "bar2":{"attribute":""}, 
			"brightLight":0, "brightSight":0, "dimLight":10, "dimSight":0, 
			"displayBars":CONST.TOKEN_DISPLAY_MODES.NONE, 
			"displayName":CONST.TOKEN_DISPLAY_MODES.HOVER, 
			"disposition":CONST.TOKEN_DISPOSITIONS.FRIENDLY, 
			"flags":{}, "height":1, "hidden":false, 
			"img":"systems/dnd5e/icons/spells/light-air-fire-1.jpg", 
			"lightAlpha":1, "lightAngle":360, "lockRotation":false, 
			"name":"Dancing Light", "randomimg":false, 
			"rotation":0, "scale":0.25, "mirrorX":false, 
			"sightAngle":360, "vision":v, "width":1
		};
		let voff = token.h;
		let hoff = token.w;
		let c = token.center;
		let tokens = [
			Object.assign({"x": c.x - hoff, "y": c.y - voff}, dancingLight),
			Object.assign({"x": c.x,        "y": c.y - voff}, dancingLight),
			Object.assign({"x": c.x - hoff, "y": c.y       }, dancingLight),
			Object.assign({"x": c.x,        "y": c.y       }, dancingLight)
		];

		if (canvas.scene.createEmbeddedDocuments) { // 0.8 or higher
			await canvas.scene.createEmbeddedDocuments(
				"Token", tokens, {"temporary":false, "renderSheet":false});
		} else { // 0.7 or lower
			await canvas.scene.createEmbeddedEntity(
				"Token", tokens, {"temporary":false, "renderSheet":false});
		}
	}

	/*
	 * Send a request to the GM to perform the operation or (if you are a GM)
	 * perform it yourself.
	 */
	static async sendRequest(tokenId, req) {
		req.sceneId = canvas.scene.id ? canvas.scene.id : canvas.scene._id;
		req.tokenId = tokenId;

		if (game.user.isGM) {
			Torch.handleSocketRequest(req);
		} else {
			let recipient;
			if (game.users.contents) { // 0.8 and up
				for (let i=0; i<game.users.contents.length; i++) {
					if (game.users.contents[i].data.role >= 4 && 
						game.users.contents[i].active)
						recipient = game.users.contents[i].data._id;
				}
			} else { // 0.7 and down
				for (let i=0; i<game.users.entities.length; i++) {
					if (game.users.entities[i].data.role >= 4 && 
						game.users.entities[i].active)
						recipient = game.users.entities[i].data._id;
				}
			}
			if (recipient) {
				req.addressTo = recipient;
				game.socket.emit("module.torch", req);
			} else {
				ui.notifications.error("No GM available for Dancing Lights!");
			}
		}
	}

	/*
	 * Identify the type of light source we will be using.
	 * If not D&D5e, either a player or GM "fiat-lux".
	 * IF DND5e:
	 * - One of the spells if you've got it - first Dancing Lights then Light.
	 * - Otherwise, the specified torch item if you've got it.
	 * - Failing all of those, a GM "fiat-lux" or none.
	 */
	static getLightSourceType(actorId, itemName) {
		if (game.system.id !== 'dnd5e') {
			let playersControlTorches = game.settings.get("torch", "playerTorches");
			return game.user.isGM ? 'GM' : playersControlTorches ? 'Player' :  '';
		} else {
			let items = Array.from(game.actors.get(actorId).data.items);
			let interestingItems = items
			.filter( item => 
				(item.type === 'spell' && 
					(item.name === 'Light' || item.name === 'Dancing Lights')) ||
				(item.type !== 'spell' && 
					itemName.toLowerCase() === item.name.toLowerCase()))
			.map( item => item.name);

			// Spells
			if (interestingItems.includes('Dancing Lights')) 
				return 'Dancing Lights';
			if (interestingItems.includes('Light')) 
				return 'Light';
			
			// Item if available
			if (interestingItems.length > 0) {
				let torchItem = items.find( (item) => {
					return item.name.toLowerCase() === itemName.toLowerCase();
				});
				let quantity = torchItem.data.data 
					? torchItem.data.data.quantity 
					: item.data.quantity;
				return quantity > 0 ? itemName : '0';
			}
			// GM can always deliver light by fiat without an item
			return game.user.isGM ? 'GM' : '';
		}
	}

	/*
	* Track inventory for torch uses if we are using a torch as our light source.
	*/
	static async consumeTorch(actorId) {
		// Protect against all conditions where we should not consume a torch
		if (game.system.id !== 'dnd5e')
			return;
		if (game.user.isGM && !game.settings.get("torch", "gmUsesInventory"))
			return;
		if (game.actors.get(actorId) === undefined) 
			return;
		let itemName = game.settings.get("torch", "gmInventoryItemName");
		if (Torch.getLightSourceType(actorId, itemName) !== itemName) 
			return;

		// Now we can consume it
		let torchItem = Array.from(game.actors.get(actorId).data.items)
			.find( (item) => item.name.toLowerCase() === itemName.toLowerCase());
		if (torchItem) {
			if (torchItem.data.data) { //0.8 and up
				if (torchItem.data.data.quantity > 0) {
					await torchItem.update(
						{"data.quantity": torchItem.data.data.quantity - 1}
					);
				}
			} else { //0.7 and down
				if (torchItem.data.quantity > 0) {
					await game.actors.get(actorId).updateOwnedItem(
						{"_id": torchItem._id, "data.quantity": torchItem.data.quantity - 1}
					);
				}
			}
		}
	}

	/*
	 * Add a torch button to the Token HUD - called from TokenHUD render hook
	 */
	static async addTorchButton(tokenHUD, hudHtml, hudData) {

		let tokenId = tokenHUD.object.id;
		let tokenDoc = tokenHUD.object.document ? tokenHUD.object.document : tokenHUD.object;
		let tokenData = tokenDoc.data;
		let itemName = game.settings.get("torch", "gmInventoryItemName");
		let torchDimRadius = game.settings.get("torch", "dimRadius");
		let torchBrightRadius = game.settings.get("torch", "brightRadius");

		// Don't let the tokens we create for Dancing Lights have or use torches. :D
		if (tokenData.name === 'Dancing Light' && 
		    tokenData.dimLight === 10 && tokenData.brightLight === 0) {
			return;
		}

		let lightSource = Torch.getLightSourceType(tokenData.actorId, itemName);
		if (lightSource !== '') {
			let tbutton = $(
				`<div class="control-icon torch"><i class="fas fa-fire"></i></div>`);
			let allowEvent = true;
			let oldTorch = tokenDoc.getFlag("torch", "oldValue");
			let newTorch = tokenDoc.getFlag("torch", "newValue");
			let tokenTooBright = lightSource !== 'Dancing Lights' 
				&& tokenData.brightLight > torchBrightRadius 
				&& tokenData.dimLight > torchDimRadius;

			// Clear torch flags if light has been changed somehow.
			let expectedTorch = tokenData.brightLight + '/' + tokenData.dimLight;
			if (newTorch !== undefined && newTorch !== null && 
					newTorch !== 'Dancing Lights' && newTorch !== expectedTorch) {
				await tokenDoc.setFlag("torch", "oldValue", null);
				await tokenDoc.setFlag("torch", "newValue", null);
				oldTorch = null;
				newTorch = null;
				ui.notifications.warn(
					`Torch: Resetting out-of-sync torch - current light: ${expectedTorch}, light in flag: ${newTorch}`);
			}

			if (newTorch !== undefined && newTorch !== null) {
				// If newTorch is still set, light hasn't changed.
				tbutton.addClass("active");
			}
			else if (
				  lightSource === '0' || tokenTooBright) {
				let disabledIcon = $(
					`<i class="fas fa-slash" style="position: absolute; color: tomato"></i>`);
				tbutton.addClass("fa-stack");
				tbutton.find('i').addClass('fa-stack-1x');
				disabledIcon.addClass('fa-stack-1x');
				tbutton.append(disabledIcon);
				allowEvent = false;
			}
			hudHtml.find('.col.left').prepend(tbutton);
			if (allowEvent) {
				tbutton.find('i').click(async (ev) => {
					let buttonElement = $(ev.currentTarget.parentElement);
					ev.preventDefault();
					ev.stopPropagation();
					Torch.clickedTorchButton(
						buttonElement, ev.altKey, tokenId, tokenDoc, lightSource);
				});
			}
		}
	}

	/*
	 * Called when the torch button is clicked
	 */
	static async clickedTorchButton(button, forceOff, tokenId, tokenDoc, lightSource) {
		let torchOnDimRadius = game.settings.get("torch", "dimRadius");
		let torchOnBrightRadius = game.settings.get("torch", "brightRadius");
		let torchOffDimRadius = game.settings.get("torch", "offDimRadius");
		let torchOffBrightRadius = game.settings.get("torch", "offBrightRadius");
		let oldTorch = tokenDoc.getFlag("torch", "oldValue");
		let tokenData = tokenDoc.data;

		if (forceOff) {	// Forcing light off...
			await tokenDoc.setFlag("torch", "oldValue", null);
			await tokenDoc.setFlag("torch", "newValue", null);
			await Torch.sendRequest(tokenId, {"requestType": "removeDancingLights"});
			button.removeClass("active");
			await tokenDoc.update(
				{ brightLight: torchOffBrightRadius, dimLight: torchOffDimRadius });

		} else if (oldTorch === null || oldTorch === undefined) {	// Turning light on...
			if (tokenData.brightLight === torchOnBrightRadius && tokenData.dimLight === torchOnDimRadius) {
				await tokenDoc.setFlag(
					"torch", "oldValue", torchOffBrightRadius + '/' + torchOnDimRadius);
				ui.notifications.warn(`Torch: Turning on torch already turned on?`);
			} else {
				await tokenDoc.setFlag(
					"torch", "oldValue", tokenData.brightLight + '/' + tokenData.dimLight);	
			}
			if (lightSource === 'Dancing Lights') {
				await Torch.createDancingLights(tokenId);
				await tokenDoc.setFlag("torch", "newValue", 'Dancing Lights');
			} else {
				let newBrightLight = Math.max(torchOnBrightRadius, tokenData.brightLight);
				let newDimLight = Math.max(torchOnDimRadius, tokenData.dimLight);
				await tokenDoc.setFlag(
					"torch", "newValue", newBrightLight + '/' + newDimLight);
				await tokenDoc.update({ 
					brightLight: newBrightLight, dimLight: newDimLight 
				});		
			}
			// Any token light data update must happen before we call consumeTorch(), 
			// because the quantity change in consumeTorch() triggers the HUD to re-render,
			// which triggers addTorchButton again. addTorchButton won't work right unless
			// the change in light from the click is already a "done deal". 
			button.addClass("active");
			await Torch.consumeTorch(tokenData.actorId);

		} else { // Turning light off...
			let oldTorch = tokenDoc.getFlag("torch", "oldValue");
			let newTorch = tokenDoc.getFlag("torch", "newValue");
			if (newTorch === 'Dancing Lights') {
				await Torch.sendRequest(tokenId, {"requestType": "removeDancingLights"});
			} else {
				let thereBeLight = oldTorch.split('/');
				if (oldTorch === newTorch) { // Something got lost - avoiding getting stuck
					await tokenDoc.update({ 
						brightLight: torchOffBrightRadius, 
						dimLight: torchOffDimRadius 
					});
					ui.notifications.warn(`Torch: Turning off torch to turned on value?`);
				} else {
					await tokenDoc.update({
						brightLight: parseFloat(thereBeLight[0]),
						dimLight: parseFloat(thereBeLight[1])
					});
				}
			}
			await tokenDoc.setFlag("torch", "newValue", null);
			await tokenDoc.setFlag("torch", "oldValue", null);
			button.removeClass("active");
			if (lightSource === "0" ){ 
				await canvas.tokens.hud.render(); 
			}
		}
	}

	/* 
	 * Called from socket request and also directly when used by GM                                                                                                                                                                                                                                        
	 */
	static async handleSocketRequest(req) {
		if (req.addressTo === undefined || req.addressTo === game.user._id) {
			let scene = game.scenes.get(req.sceneId);
			let reqToken = scene.data.tokens.find((token) => {
				return token.id ? (token.id === req.tokenId) : (token._id === req.tokenId);
			});
			let actorId = reqToken.actor ? reqToken.actor.id : reqToken.actorId;
			let dltoks=[];

			switch(req.requestType) {
				case 'removeDancingLights':
					scene.data.tokens.forEach(token => {
						let tokenData = token.data ?  token.data : token;
						let tokenActorId = (token.actor ? token.actor.id : token.actorId);
						// If the token is a dancing light owned by this actor
						if (actorId === tokenActorId  && token.name === 'Dancing Light' &&
						    	10 === tokenData.dimLight && 0 === tokenData.brightLight) {
							if (scene.getEmbeddedDocument) { // 0.8 or higher
								dltoks.push(scene.getEmbeddedDocument("Token", token.id).id);
							} else { // 0.7 or lower
								dltoks.push(scene.getEmbeddedEntity("Token", token._id)._id);
							}
						}
					});
					if (scene.deleteEmbeddedDocuments) { // 0.8 or higher
						await scene.deleteEmbeddedDocuments("Token", dltoks);
					} else { // 0.7 or lower
						await scene.deleteEmbeddedEntity("Token", dltoks);
					}
					break;
			}
		}
	}
}

Hooks.on('ready', () => {
	Hooks.on('renderTokenHUD', (app, html, data) => { 
		Torch.addTorchButton(app, html, data) 
	});
	Hooks.on('renderControlsReference', (app, html, data) => {
		html.find('div').first().append(
			'<h3>Torch</h3><ol class="hotkey-list"><li><h4>'+
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
