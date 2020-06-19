
// TOOLS.move

{
	dispatch(event) {
		let APP = photoshop,
			Self = TOOLS.move,
			drag = Self.panDrag,
			_max = Math.max,
			_min = Math.min;

		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				// dont pan if image fits available area
				if (Self.w <= Self.aW && Self.h <= Self.aH) return;

				Self.panDrag = {
					clickX: event.clientX - (Self.oX - Self.cX + (Self.w / 2)),
					clickY: event.clientY - (Self.oY - Self.cY + (Self.h / 2)),
					min: {
						x: Self.aX - Self.cX + (Self.w / 2),
						y: Self.aY - Self.cY + (Self.h / 2),
					},
					max: {
						x: (Self.cX - Self.aX - (Self.w / 2)),
						y: (Self.cY - Self.aY - (Self.h / 2)) + Self.els.statusBar.height(),
					},
				};

				// prevent mouse from triggering mouseover
				APP.els.content.addClass("cover");
				// bind event handlers
				Self.doc.on("mousemove mouseup", Self.pan);
				break;
			case "mousemove":
				let x = _max(_min(event.clientX - drag.clickX, drag.min.x), drag.max.x),
					y = _max(_min(event.clientY - drag.clickY, drag.min.y), drag.max.y);
				Self.dispatch({ type: "pan-canvas", x, y });
				break;
			case "mouseup":
				// remove class
				APP.els.content.removeClass("cover");
				// unbind event handlers
				Self.doc.off("mousemove mouseup", Self.pan);
				break;
			// custom events
			case "enable":
				console.log(event.type);
				//Canvas.cvs.on("mousedown", this.pan);
				break;
			case "disable":
				console.log(event.type);
				break;
		}
	}
}
