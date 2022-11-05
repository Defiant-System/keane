
// keane.tools.shape

{
	init() {
		// fast references
		this.handleBox = keane.els.handleBox;
		// defaults
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
				Self.handleBox.on("mousedown", Self.doTransform);
				break;
			case "disable":
				// unset default cursor for this tool
				APP.els.content.removeClass("cursor-crosshair");
				// unbind event handler
				APP.els.content.off("mousedown", ".vector-layer", Self.doMousedown);
				Self.handleBox.off("mousedown", Self.doTransform);
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
		if (!el.length) return Self.handleBox.removeClass("show");

		console.log( el.data("type") );

		let oX = File.oX,
			oY = File.oY,
			top = oY + parseInt(el.css("top"), 10),
			left = oX + parseInt(el.css("left"), 10),
			width = parseInt(el.css("width"), 10),
			height = parseInt(el.css("height"), 10);
		Self.handleBox.addClass("show").css({ top, left, width, height });
	},
	doTransform(event) {
		console.log(222, event);
	}
}
