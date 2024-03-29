
// keane.tools.move

{
	init() {
		this.option = "move";
	},
	dispatch(event) {
		let APP = keane,
			Self = APP.tools.move,
			el;
		switch (event.type) {
			// custom events
			case "select-option":
				Self.option = event.arg || "move";
				// set canvas cursor
				APP.els.content.removeClass("cursor-hand cursor-move").addClass(`cursor-${Self.option}`);
				break;
			case "enable":
				// set canvas cursor
				APP.els.content.addClass(`cursor-${Self.option}`);
				// bind event handler
				Projector.cvs.on("mousedown", Self.doPan);
				break;
			case "disable":
				// reset canvas cursor
				APP.els.content.removeClass("cursor-hand cursor-move");
				// unbind event handler
				Projector.cvs.off("mousedown", Self.doPan);
				break;
		}
	},
	doPan(event) {
		let APP = keane,
			Self = APP.tools.move,
			Drag = Self.drag;

		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				let Proj = Projector,
					File = Proj.file;
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
						x: (Proj.cX - Proj.aX - (File.width >> 1)) + 1,
						y: (Proj.cY - Proj.aY - (File.height >> 1)) + Proj.els.statusBar.height() + 1,
					},
					stop: true,
					_max: Math.max,
					_min: Math.min,
					proj: Proj,
					file: File,
					nav: APP.sidebar.navigator,
				};
				// prevent mouse from triggering mouseover
				APP.els.content.addClass("cover");
				// bind event handlers
				Proj.doc.on("mousemove mouseup", Self.doPan);
				break;
			case "mousemove":
				Drag.x = Drag._max(Drag._min(event.clientX - Drag.clickX, Drag.min.x), Drag.max.x);
				Drag.y = Drag._max(Drag._min(event.clientY - Drag.clickY, Drag.min.y), Drag.max.y);
				// forward event to file
				Drag.file.dispatch({ ...Drag, type: "pan-canvas", noEmit: true });
				// dispatch event to sidebar navigator
				Drag.nav.dispatch({ ...Drag, type: "pan-view-rect" });
				break;
			case "mouseup":
				// remove class
				APP.els.content.removeClass("cover");
				// unbind event handlers
				Drag.proj.doc.off("mousemove mouseup", Self.doPan);
				break;
		}
	}
}
