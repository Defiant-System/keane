
// photoshop.box.channels

{
	els: {},
	toggle(root, state) {
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
			Self = APP.box.channels,
			el;

		switch (event.type) {
			// custom events
			case "custom-event":
				break;
		}
	}
}
