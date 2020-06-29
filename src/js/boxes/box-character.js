
// photoshop.box.character

{
	els: {},
	toggle(root, state) {
		if (state === "on") {
			this.els.root = root;
		} else {
			// clean up
			this.els = {};
		}
	},
	dispatch(event) {
		let APP = photoshop,
			Self = root.box.character;

		switch (event.type) {
			case "type-of-event":
				break;
		}
	}
}
