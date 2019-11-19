class Torch {
	static addTorchButton(app, html, data) {

		function hasTorch() {
			let torches = false;

			if (data.isGM)
				return true;
			if (game.system.id !== 'dnd5e') {
				return game.settings.get("torch", "playerTorches");
			}

			let actor = game.actors.get(data.actorId);
			if (actor === undefined)
				return false;
			actor.data.items.forEach(item => {
				if (item.type === 'spell') {
					if (item.name === 'Light') {
						torches = true;
						return;
					}
				}
				else {
					if (item.name.toLowerCase() === 'torch') {
						if (item.data.quantity.value > 0) {
							torches = true;
							return;
						}
					}
				}
			});
			return torches;
		}

		function useTorch() {
			let torch = -1;

			if (data.isGM && !game.settings.get("torch", "gmUsesInventory"))
				return;
			if (game.system.id !== 'dnd5e')
				return;
			let actor = game.actors.get(data.actorId);
			if (actor === undefined)
				return false;

			// First, check for the light cantrip...
			actor.data.items.forEach((item, offset) => {
				if (item.type === 'spell') {
					if (item.name === 'Light') {
						torch = -2;
						return;
					}
				}
				else {
					if (torch === -1 && item.name.toLowerCase() === 'torch' && item.data.quantity.value > 0) {
						torch = offset;
					}
				}
			});
			if (torch < 0)
				return;

			// Now, remove a torch from inventory...
			actor.data.items[torch].data.quantity.value -= 1;
			actor.updateOwnedItem(actor.data.items[torch]);
		}

		if (data.isGM === true || game.settings.get("torch", "playerTorches") === true) {
			let dimRadius = game.settings.get("torch", "dimRadius");
			let brightRadius = game.settings.get("torch", "brightRadius");
			let tbutton = $(`<div class="control-icon torch"><i class="fas fa-fire"></i></div>`);
			let allowEvent = true;
			let ht = hasTorch();

			if (ht && data.brightLight === brightRadius && data.dimLight === dimRadius) {
				tbutton.addClass("active");
			}
			else if (data.brightLight !== 0 || data.dimLight !== 0 || !ht) {
				let disabledIcon = $(`<i class="fas fa-slash" style="position: absolute; color: tomato"></i>`);
				tbutton.addClass("fa-stack");
				tbutton.find('i').addClass('fa-stack-1x');
				disabledIcon.addClass('fa-stack-1x');
				tbutton.append(disabledIcon);
				allowEvent = false;
			}
			html.find('.col.left').prepend(tbutton);
			if (allowEvent) {
				tbutton.find('i').click(ev => {
					let btn = $(ev.currentTarget.parentElement);
					let dimRadius = game.settings.get("torch", "dimRadius");
					let brightRadius = game.settings.get("torch", "brightRadius");
					ev.preventDefault();
					ev.stopPropagation();
					if (data.brightLight === 0 && data.dimLight === 0) {
						data.brightLight = brightRadius;
						data.dimLight = dimRadius;
						btn.addClass("active");
						useTorch();
					}
					else if (data.brightLight === brightRadius && data.dimLight === dimRadius) {
						data.brightLight = 0;
						data.dimLight = 0;
						btn.removeClass("active");
					}
					else {
						ui.notifications.error(game.i18n.localize("torch.schrodingersTorch"));
					}
					app.object.update(canvas.scene._id, {brightLight: data.brightLight, dimLight: data.dimLight});
				});
			}
		}
	}
}

Hooks.on('ready', () => {
	Hooks.on('renderTokenHUD', (app, html, data) => { Torch.addTorchButton(app, html, data) });
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
	if (game.system.id !== 'dnd5e') {
		game.settings.register("torch", "gmUsesInventory", {
			name: game.i18n.localize("torch.gmUsesInventory.name"),
			hint: game.i18n.localize("torch.gmUsesInventory.hint"),
			scope: "world",
			config: true,
			default: true,
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
});

console.log("--- Flame on!");
