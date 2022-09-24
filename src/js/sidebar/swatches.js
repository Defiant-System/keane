
// keane.sidebar.swatches

{
	init() {
		// fast references
		this.els = {
			root: window.find(`.box-body > div[data-box="swatches"]`),
		};

		// subscribe to events
		karaqu.on("set-fg-color", this.dispatch);

		// temp
		setTimeout(() => this.els.root.find(".swatches-wrapper > div:nth(4)").trigger("click"), 300);
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
				hex = Color.rgbToHex(rgb);
				// broadcast event
				karaqu.emit("set-fg-color", { hex });
				break;
		}
	}
}
