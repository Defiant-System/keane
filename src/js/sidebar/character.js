
// keane.sidebar.character

{
	init() {
		// fast references
		this.els = {
			root: window.find(`.box-body > div[data-box="character"]`),
		};

		// subscribe to events
		window.on("set-fg-color", this.dispatch);
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
				window.emit("set-fg-color", { hex: event.value });
				break;
			case "select-font-style":
				// event.el.find("> .active").removeClass("active");
				el = $(event.target);
				el.toggleClass("active", el.hasClass("active"));
				break;
		}
	}
}
