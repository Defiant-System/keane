
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
		}
	}
}
