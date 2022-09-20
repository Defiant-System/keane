
// keane.sidebar.layers

{
	init() {
		let root = window.find(`.box-body > div[data-box="layers"]`);
		// fast references
		this.els = {
			root,
			layerList: root.find(".box-content-list"),
		};
		// subscribe to events
		karaqu.on("file-selected", this.dispatch);
	},
	dispatch(event) {
		let APP = keane,
			Self = APP.sidebar.layers,
			File = Projector.file,
			index,
			el;
		// console.log(event);
		switch (event.type) {
			// subscribed events
			case "file-selected":
				window.render({
					data: File.xData,
					template: "layers",
					// match: `//File/Layers`,
					target: Self.els.layerList,
				});
				// temp
				Self.els.layerList.find(".row:nth-child(1)").addClass("active");
				break;
			// custom events
			case "select-row":
				event.el.parent().find(".active").removeClass("active");
				event.el.addClass("active");

				index = Self.els.layerList.find(".row").length - event.el.index();
				File.dispatch({ type: "select-layer", index });
				break;
		}
	}
}
