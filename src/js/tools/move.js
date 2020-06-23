
// TOOLS.move

{
	init() {
		
	},
	dispatch(event) {
		let APP = photoshop,
			CVS = Canvas,
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
				if (CVS.w <= CVS.aW && CVS.h <= CVS.aH) return;

				Self.drag = {
					clickX: event.clientX - (CVS.oX - CVS.cX + (CVS.w / 2)),
					clickY: event.clientY - (CVS.oY - CVS.cY + (CVS.h / 2)),
					min: {
						x: CVS.aX - CVS.cX + (CVS.w / 2),
						y: CVS.aY - CVS.cY + (CVS.h / 2),
					},
					max: {
						x: (CVS.cX - CVS.aX - (CVS.w / 2)),
						y: (CVS.cY - CVS.aY - (CVS.h / 2)) + CVS.els.statusBar.height(),
					},
				};

				// prevent mouse from triggering mouseover
				APP.els.content.addClass("cover");
				// bind event handlers
				CVS.doc.on("mousemove mouseup", Self.dispatch);
				break;
			case "mousemove":
				Drag.x = _max(_min(event.clientX - Drag.clickX, Drag.min.x), Drag.max.x),
				Drag.y = _max(_min(event.clientY - Drag.clickY, Drag.min.y), Drag.max.y);
				CVS.dispatch({ type: "pan-canvas", x: Drag.x, y: Drag.y });
				break;
			case "mouseup":
				//CVS.stack.push({ type: "pan-canvas", x: Drag.x, y: Drag.y });
				// remove class
				APP.els.content.removeClass("cover");
				// unbind event handlers
				CVS.doc.off("mousemove mouseup", Self.dispatch);
				break;
			// custom events
			case "enable":
				CVS.cvs.on("mousedown", Self.dispatch);
				break;
			case "disable":
				CVS.cvs.off("mousedown", Self.dispatch);
				break;
		}
	}
}