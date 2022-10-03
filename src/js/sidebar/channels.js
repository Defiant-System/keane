
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
			File = Projector.file,
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
				// finalize file render
				Self.dispatch({ type: "render-file" });
				break;
			case "toggle-red-channel":
			case "toggle-green-channel":
			case "toggle-blue-channel":
				event.el.toggleClass("icon-eye-off", event.el.hasClass("icon-eye-off"));
				// toggles RGB "eye" if 0 or 3
				value = Self.els.channelsList.find(".row:not(:first-child) .icon-eye-off").length;
				if (value === 0) {
					Self.els.channelsList.find(".row:first-child .icon-eye-on").removeClass("icon-eye-off");
				} else if (value === 3) {
					Self.els.channelsList.find(".row:first-child .icon-eye-on").addClass("icon-eye-off");
				}
				// finalize file render
				Self.dispatch({ type: "render-file" });
				break;
			case "render-file":
				File.channels  = !Self.els.channelsList.find(`.row[data-channel="red"] .icon-eye-on`).hasClass("icon-eye-off") ? "1" : "0";
				File.channels += !Self.els.channelsList.find(`.row[data-channel="green"] .icon-eye-on`).hasClass("icon-eye-off") ? "1" : "0";
				File.channels += !Self.els.channelsList.find(`.row[data-channel="blue"] .icon-eye-on`).hasClass("icon-eye-off") ? "1" : "0";
				// trigger file render
				File.render();
				break;
		}
	}
}
