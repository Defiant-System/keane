
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
				APP.els.content.on("mousedown", ".vector-layer", Self.doMove);
				Self.handleBox.on("mousedown", Self.doResize);
				break;
			case "disable":
				// unset default cursor for this tool
				APP.els.content.removeClass("cursor-crosshair");
				// unbind event handler
				APP.els.content.off("mousedown", ".vector-layer", Self.doMove);
				Self.handleBox.off("mousedown", Self.doResize);
				break;
		}
	},
	doMove(event) {
		let APP = keane,
			Self = APP.tools.shape,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				let el = $(event.target);
				
				if (!el.hasClass("shape")) el = el.parents(".shape");
				if (!el.length) return Self.handleBox.removeClass("show");

				let File = Projector.file,
					oX = File.oX,
					oY = File.oY,
					oTop = parseInt(el.css("top"), 10),
					oLeft = parseInt(el.css("left"), 10),
					oWidth = parseInt(el.css("width"), 10),
					oHeight = parseInt(el.css("height"), 10),
					bEl = Self.handleBox,
					offset = {
						y: oTop - event.clientY,
						x: oLeft - event.clientX,
					};

				Self.drag = { el, bEl, offset, oX, oY };

				// show handle-box
				Self.handleBox.addClass("show").css({
					top: oY + oTop,
					left: oX + oLeft,
					width: oWidth,
					height: oHeight,
				});

				// hide from layer & show SVG version
				el.addClass("transforming");
				// re-render layer
				File.activeLayer.renderShapes();

				// prevent mouse from triggering mouseover
				APP.els.content.addClass("cover");
				// bind event handlers
				UI.doc.on("mousemove mouseup", Self.doMove);
				break;
			case "mousemove":
				let top = event.clientY + Drag.offset.y,
					left = event.clientX + Drag.offset.x;
				Drag.el.css({ top, left });

				top += Drag.oY;
				left += Drag.oX;
				Drag.bEl.css({ top, left });
				break;
			case "mouseup":
				// uncover app UI
				APP.els.content.removeClass("cover");
				// unbind event handler
				UI.doc.off("mousemove mouseup", Self.doMove);
				break;
		}
	},
	doResize(event) {
		console.log(222, event);
	}
}
