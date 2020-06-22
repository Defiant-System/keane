
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
				let x = _max(_min(event.clientX - Drag.clickX, Drag.min.x), Drag.max.x),
					y = _max(_min(event.clientY - Drag.clickY, Drag.min.y), Drag.max.y);
				// let x = event.clientX - Drag.clickX,
				// 	y = event.clientY - Drag.clickY;
				CVS.dispatch({ type: "pan-canvas", x, y });
				CVS.dispatch({ type: "pan-canvas", x, y });
				break;
			case "mouseup":
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
