
// keane.tools.shape

{
	init() {
		this.option = "shape";
	},
	dispatch(event) {
		let APP = keane,
			Self = APP.tools.shape;
		// console.log(event);
		switch (event.type) {
			// custom events
			case "select-option":
				Self.option = event.arg || "shape";
				break;
			case "enable":
				// set default cursor for this tool
				APP.els.content.addClass("cursor-crosshair");
				// bind event handler
				APP.els.content.on("mousedown", ".vector-layer", Self.doMousedown);
				APP.els.handleBox.on("mousedown", Self.doTransform);
				break;
			case "disable":
				// unset default cursor for this tool
				APP.els.content.removeClass("cursor-crosshair");
				// unbind event handler
				APP.els.content.off("mousedown", ".vector-layer", Self.doMousedown);
				APP.els.handleBox.off("mousedown", Self.doTransform);
				break;
		}
	},
	doMousedown(event) {
		let Self = keane.tools.shape,
			File = Projector.file,
			el = $(event.target);
		// prevent default behaviour
		event.preventDefault();
		
		if (!el.hasClass("shape")) el = el.parents(".shape");
		if (!el.length) return;

		switch (Self.option) {
			case "elliptic":
				break;
		}
	},
	doTransform(event) {
		console.log(222, event);
	}
}
