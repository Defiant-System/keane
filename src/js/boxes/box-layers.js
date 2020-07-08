
// photoshop.box.layers

{
	els: {},
	toggle(root, state) {
		if (state === "on") {
			// fast references
			this.els.layerList = root.find(".box-content-list");
			this.els.root = root;

			window.render({
				template: "layers",
				match: "//File/Layers",
				target: this.els.layerList,
			});
		} else {
			// clean up
			this.els = {};
		}
	},
	dispatch(event) {
		let APP = photoshop,
			Self = APP.box.layers,
			el;

		switch (event.type) {
			// custom events
			case "custom-event":
				break;
		}
	}
}
