
// keane.sidebar.channels

{
	init() {
		let root = window.find(`.box-body > div[data-box="channels"]`);
		// fast references
		this.els = {
			root,
			channelsList: root.find(".box-content-list"),
		};

		// subscribe to events
		karaqu.on("file-selected", this.dispatch);
	},
	dispatch(event) {
		let APP = keane,
			Self = APP.sidebar.channels,
			channels,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			// custom events
			case "file-selected":
				window.render({
					data: File.xData,
					template: "channels",
					target: Self.els.channelsList,
				});
				break;
			case "toggle-rgb-channel":
				channels = Self.els.channelsList.find(".row");
				value = channels.find(".icon-eye-off").length === 0;
				channels.find(".icon-eye-on").map(icon => $(icon)[value ? "addClass" : "removeClass"]("icon-eye-off"));
				break;
			case "toggle-red-channel":
			case "toggle-green-channel":
			case "toggle-blue-channel":
				event.el.toggleClass("icon-eye-off", event.el.hasClass("icon-eye-off"));
				break;
		}
	}
}
