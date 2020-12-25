
// keane.box.channels

{
	els: {},
	toggle(root, state) {
		if (state === "on") {
			// fast references
			this.els.channelList = root.find(".box-content-list");
			this.els.root = root;

			window.render({
				template: "channels",
				target: this.els.channelList,
			});
		} else {
			// clean up
			this.els = {};
		}
	},
	dispatch(event) {
		let APP = keane,
			Self = APP.box.channels,
			el;

		switch (event.type) {
			// custom events
			case "custom-event":
				break;
		}
	}
}
