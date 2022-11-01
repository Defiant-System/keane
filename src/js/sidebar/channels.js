
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
				// more fast references
				Self.els.chRGB = Self.els.channelsList.find(`.row[data-channel="rgb"]`);
				Self.els.chR = Self.els.channelsList.find(`.row[data-channel="red"]`);
				Self.els.chG = Self.els.channelsList.find(`.row[data-channel="green"]`);
				Self.els.chB = Self.els.channelsList.find(`.row[data-channel="blue"]`);

				Self.els.chR.find(".icon-eye-on").toggleClass("icon-eye-off", File.channels[0] === "1");
				Self.els.chG.find(".icon-eye-on").toggleClass("icon-eye-off", File.channels[1] === "1");
				Self.els.chB.find(".icon-eye-on").toggleClass("icon-eye-off", File.channels[2] === "1");
				
				Self.dispatch({ type: "check-channel-visibility" });
				break;
			case "toggle-rgb-channel":
				channels = Self.els.channelsList.find(".row");
				value = channels.find(".icon-eye-off").length === 0;
				channels.find(".icon-eye-on").map(icon => $(icon)[value ? "addClass" : "removeClass"]("icon-eye-off"));
				// finalize file render
				Self.dispatch({ type: "render-file" });
				break;
			case "toggle-channel":
				event.el.toggleClass("icon-eye-off", event.el.hasClass("icon-eye-off"));
				Self.dispatch({ type: "check-channel-visibility" });
				// finalize file render
				Self.dispatch({ type: "render-file" });
				break;
			case "check-channel-visibility":
				// toggles RGB "eye" if 0 or 3
				value = Self.els.channelsList.find(".row:not(:first-child) .icon-eye-off").length;
				if (value === 0) {
					Self.els.chRGB.find(".icon-eye-on").removeClass("icon-eye-off");
				} else if (value === 3) {
					Self.els.chRGB.find(".icon-eye-on").addClass("icon-eye-off");
				}
				break;
			case "render-file":
				channels  = !Self.els.chR.find(`.icon-eye-on`).hasClass("icon-eye-off") ? "1" : "0";
				channels += !Self.els.chG.find(`.icon-eye-on`).hasClass("icon-eye-off") ? "1" : "0";
				channels += !Self.els.chB.find(`.icon-eye-on`).hasClass("icon-eye-off") ? "1" : "0";
				File.channels = channels; // will auto-trigger render
				break;
		}
	}
}
