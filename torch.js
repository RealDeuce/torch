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
		console.log (...args);
	}
}

const BUTTON_HTML = 
	`<div class="control-icon torch"><i class="fas fa-fire"></i></div>`;
const DISABLED_ICON_HTML = 
	`<i class="fas fa-slash" style="position: absolute; color: tomato"></i>`;
const CTRL_REF_HTML = (turnOffLights, ctrlOnClick) => {
	return `
<h3>Torch</h3>
<ol class="hotkey-list">
	<li>
		<h4>${turnOffLights}</h4>
		<div class="keys">${ctrlOnClick}</div>
	</li>
</ol>
`
}
const NEEDED_PERMISSIONS = {
	// Don't want to do yourself something you can't undo without a GM - 
	// so check for delete on create
	'createDancingLights': ['TOKEN_CREATE','TOKEN_DELETE'], 
	'removeDancingLights': ['TOKEN_DELETE']
}

let isPermittedTo = (user, requestType)  => {
	if (requestType in NEEDED_PERMISSIONS) {
		return NEEDED_PERMISSIONS[requestType].every( permission => {
			return user.can(permission);
		})	
	} else {
		return true;
	}
}
class Torch {

	// Dancing lights support (including GM request)

	static async createDancingLights(scene, token) {
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
		let voff = scene.grid.size * token.height;
		let hoff = scene.grid.size * token.width;
		let c = { x: token.x + hoff / 2, y: token.y + voff / 2 };
		let tokens = [
			Object.assign({"x": c.x - hoff, "y": c.y - voff}, dancingLight),
			Object.assign({"x": c.x,        "y": c.y - voff}, dancingLight),
			Object.assign({"x": c.x - hoff, "y": c.y       }, dancingLight),
			Object.assign({"x": c.x,        "y": c.y       }, dancingLight)
		];
		await scene.createEmbeddedDocuments(
			"Token", tokens, { "temporary":false, "renderSheet":false });
	}
	static async removeDancingLights (scene, reqToken) {
		let dltoks=[];
		scene.tokens.forEach(token => {
			// If the token is a dancing light owned by this actor
			if (reqToken.actor.id === token.actor.id && 
				token.name === 'Dancing Light' 
			) {
				dltoks.push(scene.getEmbeddedDocument("Token", token.id).id);
			}
		});
		await scene.deleteEmbeddedDocuments("Token", dltoks);
	}

	/* 
	 * Handle any requests that might have been remoted to a GM via a socket
	 */
	static async handleSocketRequest(req) {
		if (req.addressTo === undefined || req.addressTo === game.user.id) {
			let scene = game.scenes.get(req.sceneId);
			let token = scene.tokens.get(req.tokenId);
			switch(req.requestType) {
				case 'removeDancingLights':
					await Torch.removeDancingLights(scene, token);
					break;
				case 'createDancingLights':
					await Torch.createDancingLights(scene, token);
					break;
			}
		}
	}

	/*
	 * Send a request to a user permitted to perform the operation or 
	 * (if you are permitted) perform it yourself.
	 */
	static async sendRequest(tokenId, req) {
		req.sceneId = canvas.scene.id;
		req.tokenId = tokenId;

		if (isPermittedTo(game.user, req.requestType)) {
			Torch.handleSocketRequest(req);
			return true;
		} else {
			let recipient = game.users.contents.find( user => {
				return user.active && isPermittedTo(user, req.requestType);
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
	}

	/*
	 * Identify the type of light source we will be using.
	 * Outside of D&D5e, either a player or GM can call for "fiat-lux".
	 * Within DND5e, it invokes:
	 * - One of the spells if you've got it - first Dancing Lights then Light.
	 * - Otherwise, the specified torch item if you've got it.
	 * - An indicator if you ran out of torches.
	 * - Failing all of those, a player doesn't even get a button to click.
	 * - However, a GM can always call for "fiat-lux".
	 */
	static getLightSourceType(actorId, itemName) {
		if (game.system.id !== 'dnd5e') {
			let playersControlTorches = 
				game.settings.get("torch", "playerTorches");
			return game.user.isGM ? 'GM' : playersControlTorches ? 'Player' :  '';
		} else {
			let items = Array.from(game.actors.get(actorId).items);
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
				return torchItem.system.quantity > 0 ? itemName : '0';
			}
			// GM can always deliver light by fiat without an item
			return game.user.isGM ? 'GM' : '';
		}
	}

	/*
	* Track consumable inventory if we are using a consumable as our light source.
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
		let torchItem = Array.from(game.actors.get(actorId).items)
			.find( (item) => item.name.toLowerCase() === itemName.toLowerCase());
		if (torchItem && torchItem.system.quantity > 0) {
			await torchItem.update(
				{"system.quantity": torchItem.system.quantity - 1}
			);
		}
	}

	/*
	 * Add a torch button to the Token HUD - called from TokenHUD render hook
	 */
	static async addTorchButton(tokenHUD, hudHtml, hudData) {

		let token = tokenHUD.object.document;
		let itemName = game.system.id === 'dnd5e' 
			? game.settings.get("torch", "gmInventoryItemName") : "";
		let torchDimRadius = game.settings.get("torch", "dimRadius");
		let torchBrightRadius = game.settings.get("torch", "brightRadius");
	
		// Don't let the tokens we create for Dancing Lights have or use their own torches.
		if (token.name === 'Dancing Light') {
			return;
		}

		let lightSource = Torch.getLightSourceType(token.actor.id, itemName);
		if (lightSource !== '') {
			let tbutton = $(BUTTON_HTML);
			let allowEvent = true;
			let oldTorch = token.getFlag("torch", "oldValue");
			let newTorch = token.getFlag("torch", "newValue");
			let tokenTooBright = lightSource !== 'Dancing Lights' 
				&& token.light.bright > torchBrightRadius 
				&& token.light.dim > torchDimRadius;

			// Clear torch flags if light has been changed somehow.
			let expectedTorch = token.light.bright + '/' + token.light.dim;
			if (newTorch !== undefined && newTorch !== null && 
					newTorch !== 'Dancing Lights' && newTorch !== expectedTorch) {
				await token.setFlag("torch", "oldValue", null);
				await token.setFlag("torch", "newValue", null);
				oldTorch = null;
				newTorch = null;
				console.warn(
					`Torch: Resynchronizing - ${expectedTorch}, ${newTorch}`);
			}

			if (newTorch !== undefined && newTorch !== null) {
				// If newTorch is still set, light hasn't changed.
				tbutton.addClass("active");
			}
			else if (lightSource === '0' || tokenTooBright) {
				let disabledIcon = $(DISABLED_ICON_HTML);
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
					await Torch.clickedTorchButton(
						buttonElement, ev.altKey, token, lightSource);
				});
			}
		}
	}

	/*
	 * Called when the torch button is clicked
	 */
	static async clickedTorchButton(button, forceOff, token, lightSource) {
		debugLog("Torch clicked");
		let torchOnDimRadius = game.settings.get("torch", "dimRadius");
		let torchOnBrightRadius = game.settings.get("torch", "brightRadius");
		let torchOffDimRadius = game.settings.get("torch", "offDimRadius");
		let torchOffBrightRadius = game.settings.get("torch", "offBrightRadius");
		let oldTorch = token.getFlag("torch", "oldValue");

		if (forceOff) {	// Forcing light off...
			await token.setFlag("torch", "oldValue", null);
			await token.setFlag("torch", "newValue", null);
			await Torch.sendRequest(
				token.id, {"requestType": "removeDancingLights"});
			button.removeClass("active");
			await token.update({
				"light.bright": torchOffBrightRadius, 
				"light.dim": torchOffDimRadius
			});
			debugLog("Force torch off");

		// Turning light on...
		} else if (oldTorch === null || oldTorch === undefined) {	
			if (token.light.bright === torchOnBrightRadius 
				&& token.light.dim === torchOnDimRadius
			) {
				await token.setFlag(
					"torch", "oldValue", 
					torchOffBrightRadius + '/' + torchOffDimRadius);
				console.warn(`Torch: Turning on torch that's already turned on?`);
			} else {
				await token.setFlag(
					"torch", "oldValue", 
					token.light.bright + '/' + token.light.dim);	
			}
			if (lightSource === 'Dancing Lights') {
				if (await Torch.sendRequest(
						token.id, {"requestType": "createDancingLights"})
				) {
					await token.setFlag("torch", "newValue", 'Dancing Lights');
					debugLog("Torch dance on");
					button.addClass("active");		
				} else {
					await token.setFlag("torch", "oldValue", null);	
					debugLog("Torch dance failed");
				}
			} else {
				let newBrightLight = 
					Math.max(torchOnBrightRadius, token.light.bright);
				let newDimLight = 
					Math.max(torchOnDimRadius, token.light.dim);
				await token.setFlag(
					"torch", "newValue", newBrightLight + '/' + newDimLight);
				await token.update({
					"light.bright": newBrightLight, 
					"light.dim": newDimLight
				});
				debugLog("Torch on");
				await Torch.consumeTorch(token.actor.id);
			}
			// Any token light data update must happen before we call 
			// consumeTorch(), because the quantity change in consumeTorch() 
			// triggers the HUD to re-render, which triggers addTorchButton again. 
			// addTorchButton won't work right unless the change in light from 
			// the click is already a "done deal". 

		} else { // Turning light off...
			let oldTorch = token.getFlag("torch", "oldValue");
			let newTorch = token.getFlag("torch", "newValue");
			let success = true;
			if (newTorch === 'Dancing Lights') {
				success = await Torch.sendRequest(
					token.id, {"requestType": "removeDancingLights"});
				if (success) {
					debugLog("Torch dance off");
				} else {
					debugLog("Torch dance off failed");
				}
			} else {
				// Something got lost - avoiding getting stuck
				if (oldTorch === newTorch) { 
					await token.update({
						"light.bright": torchOffBrightRadius,
						"light.dim": torchOffDimRadius
					});
				} else {
					let thereBeLight = oldTorch.split('/');
					await token.update({
						"light.bright": parseFloat(thereBeLight[0]),
						"light.dim": parseFloat(thereBeLight[1])
					});
				}
				debugLog("Torch off");
			}
			if (success) {
				await token.setFlag("torch", "newValue", null);
				await token.setFlag("torch", "oldValue", null);
				button.removeClass("active");
				if (lightSource === "0" ){ 
					await canvas.tokens.hud.render(); 
				}	
			}
		}
	}
}

Hooks.on('ready', () => {
	Hooks.on('renderTokenHUD', (app, html, data) => { 
		Torch.addTorchButton(app, html, data) 
	});
	Hooks.on('renderControlsReference', (app, html, data) => {
		let turnOffLights = game.i18n.localize("torch.turnOffAllLights");
		let ctrlOnClick = game.i18n.localize("torch.holdCtrlOnClick");
		html.find('div').first().append(
			CTRL_REF_HTML(turnOffLights, ctrlOnClick)
		);
	});
	game.socket.on("module.torch", request => {
		Torch.handleSocketRequest(request);
	});
});

Hooks.once("init", () => {
	// Only load and initialize test suite if we're in a test environment
	if (game.world.data.name.startsWith("torch-test-")) {
		console.log("Torch | --- In test environment - load test code...")
		import('./test/test-hook.js')
		.then(obj => {
			try {
				obj.hookTests();
				console.log("Torch | --- Tests ready");
			}  catch (err) {
				console.log("Torch | --- Error registering test code", err);
			}
		})
		.catch(err => { console.log("Torch | --- No test code found", err); });
	}

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

console.log("Torch | --- Module loaded");
