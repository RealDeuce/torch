class Torch {
	static addTorchButton(app, html, data) {
		console.log(data);
		let tbutton = $(`<div class="control-icon torch"><i class="fas fa-fire"></i></div>`);
		html.find('.col.left').prepend(tbutton);
		tbutton.find('i').click(ev => {
			let update = {};
			ev.preventDefault();
			ev.stopPropagation();
			if (data.brightLight === 0 && data.dimLight === 0) {
				console.log("Turning on the torch...");
				data.brightLight = 20;
				data.dimLight = 40;
			}
			else if (data.brightLight === 20 && data.dimLight === 40) {
				console.log("Turning off the torch...");
				data.brightLight = 0;
				data.dimLight = 0;
			}
			app.object.update(canvas.scene._id, {brightLight: data.brightLight, dimLight: data.dimLight});
		});
	}
}

Hooks.on('ready', () => {
	Hooks.on('renderTokenHUD', (app, html, data) => { Torch.addTorchButton(app, html, data) });
});

console.log("--- Flame on!");
