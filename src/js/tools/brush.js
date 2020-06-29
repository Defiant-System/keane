
// TOOLS.brush

{
	init() {
		this.option = "brush";
	},
	dispatch(event) {
		let APP = photoshop,
			Cvs = Canvas,
			Ctx = Canvas.ctx,
			Self = TOOLS.brush,
			Drag = Self.drag;

		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				// use swap canvas
				Cvs.swapCvs.prop({ width: Cvs.oW, height: Cvs.oH });

				Self.drag = {
					mouse: {
						x: event.clientX - window.left - Cvs.oX,
						y: event.clientY - window.top - Cvs.oY,
					},
					clickX: event.clientX - (Cvs.oX - Cvs.cX + (Cvs.w / 2)),
					clickY: event.clientY - (Cvs.oY - Cvs.cY + (Cvs.h / 2)),
				};

				Cvs.swapCtx.strokeStyle = "red";
				Cvs.swapCtx.lineWidth = 5;
				Cvs.swapCtx.beginPath();

				// prevent mouse from triggering mouseover
				APP.els.content.addClass("no-cursor");
				// bind event handlers
				Cvs.doc.on("mousemove mouseup", Self.dispatch);
				break;
			case "mousemove":
				Drag.x = Drag.mouse.x + event.clientX - Drag.clickX;
				Drag.y = Drag.mouse.y + event.clientY - Drag.clickY;

				Cvs.swapCtx.lineTo(Drag.x, Drag.y);
				Cvs.swapCtx.stroke();

				// put swap canvas on UI canvas
				Cvs.ctx.drawImage(Cvs.swapCvs[0], Cvs.oX, Cvs.oY);
				break;
			case "mouseup":
				// remove class
				APP.els.content.removeClass("no-cursor");
				// unbind event handlers
				Cvs.doc.off("mousemove mouseup", Self.dispatch);
				break;
			// custom events
			case "select-option":
				Self.option = event.arg || "brush";
				break;
			case "enable":
				Cvs.cvs.on("mousedown", Self.dispatch);
				break;
			case "disable":
				Cvs.cvs.off("mousedown", Self.dispatch);
				break;
		}
	}
}
