class Torch {
	static addTorchButton(app, html, data) {
		if (data.isGM === true || game.settings.get("torch", "playerTorches") === true) {
			let tbutton = $(`<div class="control-icon torch"><i class="fas fa-fire"></i></div>`);
			if (data.brightLight === 20 && data.dimLight === 40) {
				tbutton.addClass("active");
			}
			html.find('.col.left').prepend(tbutton);
			tbutton.find('i').click(ev => {
				let btn = $(ev.currentTarget.parentElement);
				ev.preventDefault();
				ev.stopPropagation();
				if (data.brightLight === 0 && data.dimLight === 0) {
					data.brightLight = 20;
					data.dimLight = 40;
					btn.addClass("active");
				}
				else if (data.brightLight === 20 && data.dimLight === 40) {
					data.brightLight = 0;
					data.dimLight = 0;
					btn.removeClass("active");
				}
				else {
					console.log("Schrödinger's Torch... cowardly refusing to open the box.");
				}
				app.object.update(canvas.scene._id, {brightLight: data.brightLight, dimLight: data.dimLight});
			});
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
});

console.log("--- Flame on!");
