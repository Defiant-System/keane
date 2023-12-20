
// keane.sidebar.swatches

{
	init() {
		// fast references
		this.els = {
			root: window.find(`.box-body > div[data-box="swatches"]`),
		};

		// subscribe to events
		window.on("set-fg-color", this.dispatch);
	},
	dispatch(event) {
		let APP = keane,
			Self = APP.sidebar.swatches,
			rgb,
			hex,
			el;
		// console.log(event);
		switch (event.type) {
			// subscribed events
			case "set-fg-color":
				Self.els.root.find(".active").removeClass("active");
				Self.els.root.find(`div[style*="background: ${event.detail.hex.slice(0,7)};"]`).addClass("active");
				break;

			// custom events
			case "select-color":
				el = $(event.target);
				rgb = el.css("background-color");
				hex = ColorLib.rgbToHex(rgb);
				// broadcast event
				window.emit("set-fg-color", { hex });
				break;
		}
	}
}
