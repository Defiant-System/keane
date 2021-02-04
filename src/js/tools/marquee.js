
// TOOLS.marquee

{
	init() {
		// layer canvas
		let { cvs, ctx } = Misc.createCanvas(1, 1);
		this.cvs = cvs;
		this.ctx = ctx;
	},
	dispatch(event) {
		let APP = keane,
			Proj = Projector,
			File = Proj.file,
			Self = TOOLS.marquee,
			Drag = Self.drag,
			_max = Math.max,
			_min = Math.min;

		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				// reset selection canvas
				console.log({ width: File.width, height: File.height });
				Self.cvs.prop({ width: File.width, height: File.height });
				// stop marching ants, if marching
				Self.ants();

				Self.drag = {
					clickX: event.clientX,
					clickY: event.clientY,
					oX: event.offsetX - File.oX,
					oY: event.offsetY - File.oY,
				};

				// prevent mouse from triggering mouseover
				APP.els.content.addClass("cover");
				// bind event handlers
				Proj.doc.on("mousemove mouseup", Self.dispatch);
				break;
			case "mousemove":
				Drag.oW = event.clientX - Drag.clickX;
				Drag.oH = event.clientY - Drag.clickY;
				
				Self.cvs.prop({ width: Self.w, height: Self.h });

				switch (Self.option) {
					case "rectangle":
						Self.ctx.fillRect(Drag.oX, Drag.oY, Drag.oW, Drag.oH);
						break;
					case "elliptic":
						let hW = Drag.oW / 2,
							hH = Drag.oH / 2;
						Self.ctx.ellipse(Drag.oX + hW, Drag.oY + hH, hW, hH, 0, 0, Math.PI*2);
						break;
				}
		    	Self.ctx.fill();

				// paint ants but no marching
				Self.ants();
				break;
			case "mouseup":
				// start marching if there is any box
				if (Drag.oW && Drag.oH) Self.ants(true);

				// remove class
				APP.els.content.removeClass("cover");
				// unbind event handlers
				Proj.doc.off("mousemove mouseup", Self.dispatch);
				break;
			// custom events
			case "enable":
				Proj.cvs.on("mousedown", Self.dispatch);
				break;
			case "disable":
				Proj.cvs.off("mousedown", Self.dispatch);
				break;
		}
	},
	getOutlineMask() {

	},
	ants(march) {

	},
	render(march) {

	}
}
