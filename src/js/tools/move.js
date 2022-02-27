
// TOOLS.move

{
	init() {
		this.option = "move";
	},
	dispatch(event) {
		let APP = keane,
			Proj = Projector,
			File = Proj.file,
			Self = TOOLS.move,
			Drag = Self.drag,
			_max = Math.max,
			_min = Math.min;

		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				// dont pan if image fits available area
				if (File.width <= Proj.aW && File.height <= Proj.aH) return;

				Self.drag = {
					clickX: event.clientX - (File.oX - Proj.cX + (File.width >> 1)),
					clickY: event.clientY - (File.oY - Proj.cY + (File.height >> 1)),
					min: {
						x: Proj.aX - Proj.cX + (File.width >> 1),
						y: Proj.aY - Proj.cY + (File.height >> 1),
					},
					max: {
						x: (Proj.cX - Proj.aX - (File.width >> 1)),
						y: (Proj.cY - Proj.aY - (File.height >> 1)) + Proj.els.statusBar.height(),
					},
					stop: true,
				};

				// prevent mouse from triggering mouseover
				APP.els.content.addClass("cover");
				// bind event handlers
				Proj.doc.on("mousemove mouseup", Self.dispatch);
				break;
			case "mousemove":
				Drag.x = _max(_min(event.clientX - Drag.clickX, Drag.min.x), Drag.max.x);
				Drag.y = _max(_min(event.clientY - Drag.clickY, Drag.min.y), Drag.max.y);
				// forward event to file
				File.dispatch({ type: "pan-canvas", ...Drag });
				break;
			case "mouseup":
				// remove class
				APP.els.content.removeClass("cover");
				// unbind event handlers
				Proj.doc.off("mousemove mouseup", Self.dispatch);
				break;
			// custom events
			case "select-option":
				Self.option = event.arg || "move";
				break;
			case "enable":
				Proj.cvs.on("mousedown", Self.dispatch);
				break;
			case "disable":
				Proj.cvs.off("mousedown", Self.dispatch);
				break;
		}
	}
}
