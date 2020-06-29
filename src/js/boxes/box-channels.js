
// photoshop.box.channels

{
	els: {},
	toggle(root, state) {
		if (state === "on") {
			this.els.rows = root.find(".row");
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
			Self = APP.box.channels,
			row,
			isOn,
			el;

		switch (event.type) {
			// subscribed events
			case "canvas-update":
				Self.els.root.find(".row canvas").map(cvs => {
					let el = $(cvs),
						channel = el.parents(".row").data("channel");
					Thumb.render({ el, channel });
				});
				break;
			// custom events
			case "select-channel":
				isOn = event.el.data("channel") === "rgb";
				Self.els.rows.map(row => $(row)[isOn ? "removeClass" : "addClass"]("off"));
				event.el.removeClass("off");
				break;
			case "toggle-visibility":
				el = event.el;
				row = el.parents(".row");
				isOn = row.hasClass("off");
				row[isOn ? "removeClass" : "addClass"]("off");

				isOn = Self.els.root.find(".row:not(.off):not([data-channel='rgb'])").length === 3;
				Self.els.root.find(".row[data-channel='rgb']")[isOn ? "removeClass" : "addClass"]("off");
				break;
		}
	}
}
