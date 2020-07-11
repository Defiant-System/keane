
// photoshop.box.layers

{
	els: {},
	toggle(root, state) {
		if (state === "on") {
			// fast references
			this.els.layerList = root.find(".box-content-list");
			this.els.root = root;

			window.render({
				template: "layers",
				match: "//File/Layers",
				target: this.els.layerList,
			});

			// temp
			this.els.layerList.find(".row:nth-child(1)").addClass("active");
		} else {
			// clean up
			this.els = {};
		}
	},
	dispatch(event) {
		let APP = photoshop,
			Self = APP.box.layers,
			el;

		switch (event.type) {
			// custom events
			case "select-row":
				event.el.parent().find(".active").removeClass("active");
				event.el.addClass("active");

				console.log( event.el.index() );
				break;
		}
	}
}
