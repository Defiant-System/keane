
// photoshop.box.channels

{
	els: {},
	toggle(root, state) {
		if (state === "on") {
			this.els.root = root;

			// subscribe to events
			defiant.on("cavas-update", this.dispatch);
		} else {
			// subscribe to events
			defiant.off("cavas-update", this.dispatch);

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
			case "cavas-update":
				Self.els.root.find(".row canvas").map(cvs => {
					let el = $(cvs),
						channel = el.parents(".row").data("channel");
					Thumb.render({ el, channel });
				});
				break;
			case "toggle-visibility":
				el = event.el;
				row = el.parents(".row");
				isOn = el.hasClass("icon-eye-on");
				el.removeClass("icon-eye-on icon-eye-off")
					.addClass(isOn ? "icon-eye-off" : "icon-eye-on");

				if (row.data("channel") === "rgb") {
					row.parent().find(".row .icon")
						.removeClass("icon-eye-on icon-eye-off")
						.addClass(isOn ? "icon-eye-off" : "icon-eye-on");
				}

				isOn = row.parent().find(".row:not([data-channel='rgb']) .icon-eye-on").length === 3;
				row.parent().find(".row[data-channel='rgb'] .icon")
					.removeClass("icon-eye-on icon-eye-off")
					.addClass(isOn ? "icon-eye-on" : "icon-eye-off");
				break;
		}
	}
}
