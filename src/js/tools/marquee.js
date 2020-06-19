
// TOOLS.marquee

{
	init() {
		this.cvs = $(document.createElement("canvas"));
		this.ctx = this.cvs[0].getContext("2d");

		// subscribe to events
		defiant.on("load-canvas", this.dispatch);
	},
	dispatch(event) {
		let APP = photoshop,
			CVS = Canvas,
			Self = TOOLS.marquee,
			Drag = Self.drag,
			_max = Math.max,
			_min = Math.min;

		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				Self.drag = {
					clickX: event.clientX,
					clickY: event.clientY,
					oX: event.offsetX - CVS.oX,
					oY: event.offsetY - CVS.oY,
				};

				// prevent mouse from triggering mouseover
				APP.els.content.addClass("cover");
				// bind event handlers
				CVS.doc.on("mousemove mouseup", Self.dispatch);
				break;
			case "mousemove":
				let x = event.clientX - Drag.clickX,
					y = event.clientY - Drag.clickY;
				
				Self.cvs.prop({ width: CVS.oW, height: CVS.oH });
				Self.ctx.fillStyle = "red";
				Self.ctx.fillRect(Drag.oX, Drag.oY, x, y);
				
				// re-execute paint stack
				CVS.stack.map(item => CVS.dispatch(item));
				
				CVS.ctx.drawImage(Self.cvs[0], 0, 0, CVS.oW, CVS.oH);
				break;
			case "mouseup":
				// remove class
				APP.els.content.removeClass("cover");
				// unbind event handlers
				CVS.doc.off("mousemove mouseup", Self.dispatch);
				break;
			// custom events
			case "load-canvas":
				Self.cvs.prop({ width: CVS.oW, height: CVS.oH });
				break;
			case "enable":
				CVS.cvs.on("mousedown", Self.dispatch);
				break;
			case "disable":
				CVS.cvs.off("mousedown", Self.dispatch);
				break;
		}
	}
}
