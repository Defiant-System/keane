
// keane.box.layers

{
	els: {},
	toggle(root, state) {
		if (state === "on") {
			// fast references
			this.els.layerList = root.find(".box-content-list");
			this.els.root = root;

			// subscribe to events
			defiant.on("file-selected", this.dispatch);
		} else {
			// clean up
			this.els = {};

			// unsubscribe to events
			defiant.off("file-selected", this.dispatch);
		}
	},
	dispatch(event) {
		let APP = keane,
			Self = APP.box.layers,
			File = Projector.file,
			index,
			el;

		switch (event.type) {
			// subscribed events
			case "file-selected":
				window.render({
					template: "layers",
					match: `//File[@_id="${File._id}"]/Layers`,
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
