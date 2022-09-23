
// keane.sidebar.swatches

{
	init() {

	},
	dispatch(event) {
		let APP = keane,
			Self = APP.sidebar.swatches,
			rgb,
			hex,
			el;
		// console.log(event);
		switch (event.type) {
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
