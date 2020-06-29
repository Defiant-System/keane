
// photoshop.box.layers

{
	els: {},
	toggle(root, state) {
		if (state === "on") {
			this.els.root = root;

			// subscribe to events
			defiant.on("canvas-update", this.dispatch);

			// auto trigger
			this.dispatch({ type: "canvas-update" });
		} else {
			// subscribe to events
			defiant.off("canvas-update", this.dispatch);

			// clean up
			this.els = {};
		}
	},
	dispatch(event) {
		let APP = photoshop,
			Self = APP.box.layers,
			row,
			isOn,
			el;

		switch (event.type) {
			// subscribed events
			case "canvas-update":
				Self.els.root.find(".row canvas").map(cvs =>
					Thumb.render({ el: $(cvs) }));
				break;
			// custom events
			case "toggle-visibility":
				el = event.el;
				row = el.parents(".row");
				isOn = row.hasClass("off");
				row[isOn ? "removeClass" : "addClass"]("off");
				break;
		}
	}
}
