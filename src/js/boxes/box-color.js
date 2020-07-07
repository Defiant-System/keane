
// photoshop.box.color

{
	els: {},
	toggle(el, state) {
		if (state === "on") {
			// fast references
			this.els.root = root;
		} else {
			// clean up
			this.els = {};
		}
	},
	dispatch(event) {
		let APP = photoshop,
			Self = APP.box.color,
			el;

		switch (event.type) {
			// custom events
			case "custom-event":
				break;
		}
	}
}
