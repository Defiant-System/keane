
// photoshop.box.navigator

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
			Self = APP.box.navigator,
			el;

		switch (event.type) {
			// custom events
			case "custom-event":
				break;
		}
	}
}
