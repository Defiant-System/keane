
// photoshop.box.layers

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
			Self = APP.box.layers,
			isOn,
			el;

		switch (event.type) {
			case "toggle-visibility":
				el = event.el;
				isOn = el.hasClass("icon-eye-on");
				el.removeClass("icon-eye-on icon-eye-off")
					.addClass(isOn ? "icon-eye-off" : "icon-eye-on");
				break;
		}
	}
}
