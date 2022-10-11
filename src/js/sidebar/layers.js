
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

		// temp
		setTimeout(() => {
			// return;
			// root.find(`.icon[data-click="add-layer"]`).trigger("click");
			// setTimeout(() => keane.dispatch({ type: "filter-render", arg: "clouds" }), 200);

			// setTimeout(() => keane.dispatch({ type: "filter-render", arg: "clouds" }), 200);
			// setTimeout(() => keane.dispatch({ type: "filter-render", arg: "invert" }), 400);
			// setTimeout(() => keane.dispatch({ type: "filter-render", arg: "dither" }), 400);
			// setTimeout(() => keane.dispatch({ type: "filter-render", arg: "brightSteps,3" }), 400);
			// setTimeout(() => keane.dispatch({ type: "filter-render", arg: "brightness,-25" }), 400);

			// dlgBrightnessContrast
			// dlgGaussianBlur
			// dlgThreshold
			// dlgMosaic
			// dlgSponge
			// dlgPixelator
			UI.doDialog({
				type: "dlg-open",
				name: "dlgPixelator",
				// callback: ev => console.log(ev),
			});
		}, 500);
	},
	dispatch(event) {
		let APP = keane,
			Self = APP.sidebar.layers,
			File = Projector.file,
			index,
			value,
			id,
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
				// auto select active layer
				Self.els.layerList.find(`.row[data-id="${File._activeLayer._id}"]`).trigger("click");
				break;

			// custom events
			case "select-row":
				event.el.parent().find(".active").removeClass("active");
				event.el.addClass("active");

				id = event.el.data("id");
				File.dispatch({ type: "select-layer", id });
				break;
			case "toggle-visibility":
				value = event.el.hasClass("icon-eye-off");
				event.el.toggleClass("icon-eye-off", value);

				id = event.el.parents(".row:first").data("id");
				File.dispatch({ type: "toggle-layer-visibility", id, value });
				break;
			case "add-layer-folder":
			case "remove-layer":
				console.log(event.type);
				break;
			case "add-layer":
				el = File.dispatch({ type: "add-layer", content: { name: "test", type: "fill", color: "#ffffff00" } });
				// console.log( el );

				// add new row and auto focus (make active)
				window.render({
					data: File.xData,
					match: `Layers/*[@id="${el.id}"]`,
					template: "single-layer",
					prepend: Self.els.layerList,
				}).trigger("click");

				// render file
				File.render();
				break;
		}
	}
}
