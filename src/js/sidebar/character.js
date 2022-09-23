
// keane.sidebar.character

{
	init() {
		// fast references
		this.els = {
			root: window.find(`.box-body > div[data-box="character"]`),
		};

		// subscribe to events
		karaqu.on("set-fg-color", this.dispatch);
	},
	dispatch(event) {
		let APP = keane,
			Self = APP.sidebar.character,
			el;
		// console.log(event);
		switch (event.type) {
			// subscribed events
			case "set-fg-color":
				Self.els.root.find(".option.preset .value").css({ background: event.detail.hex });
				break;

			// custom events
			case "set-color":
				// broadcast event
				karaqu.emit("set-fg-color", { hex: event.value });
				break;
		}
	}
}
