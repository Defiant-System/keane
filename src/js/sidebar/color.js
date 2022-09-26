
// keane.sidebar.color

{
	init() {
		let root = window.find(`.box-body > div[data-box="color"]`);
		this.els = {
			root,
			colorValues: root.find(".color-values"),
		};

		// subscribe to events
		karaqu.on("set-fg-color", this.dispatch);
	},
	dispatch(event) {
		let APP = keane,
			Self = APP.sidebar.color,
			el;
		// console.log(event);
		switch (event.type) {
			// subscribed events
			case "set-fg-color":
				console.log( event.detail.hex );
				break;

			// custom events
			case "show-color-values":
				event.el.parent().find(".active").removeClass("active");
				event.el.addClass("active");
				
				Self.els.colorValues
					.removeClass("show-rgb show-hsl")
					.addClass(`show-${event.arg}`);
				break;
			case "color-wheel-shape":
				// TODO (!?)
				break;
		}
	}
}
