class Torch {
	static addTorchButton(app, html, data) {
		if (data.isGM === true || game.settings.get("torch", "playerTorches") === true) {
			let dimRadius = game.settings.get("torch", "dimRadius");
			let brightRadius = game.settings.get("torch", "brightRadius");
			let tbutton = $(`<div class="control-icon torch"><i class="fas fa-fire"></i></div>`);
			let allowEvent = true;
			if (data.brightLight === brightRadius && data.dimLight === dimRadius) {
				tbutton.addClass("active");
			}
			else if (data.brightLight !== 0 || data.dimLight !== 0) {
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
		default: false,
		type: Boolean
	});
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
