
// photoshop.box.paths

{
	els: {},
	toggle(root, state) {
		if (state === "on") {
			// fast references
			this.els.pathList = root.find(".box-content-list");
			this.els.root = root;

			window.render({
				template: "paths",
				target: this.els.pathList,
			});
		} else {
			// clean up
			this.els = {};
		}
	},
	dispatch(event) {
		let APP = photoshop,
			Self = APP.box.paths,
			el;

		switch (event.type) {
			// custom events
			case "custom-event":
				break;
		}
	}
}
