
// TOOLS.marquee

{
	ants: @import "./marquee.ants.js",
	magicWand: @import "./marquee.magicWand.js",
	init() {
		// layer canvas
		let { cvs, ctx } = Misc.createCanvas(1, 1);
		this.cvs = cvs;
		this.ctx = ctx;

		this.ctx.fillStyle = "#000";
		this.threshold = 0xC0;
		// this.option = "magic-wand";
		this.option = "rectangle";
	},
	dispatch(event) {
		let APP = keane,
			Proj = Projector,
			File = Proj.file,
			Self = TOOLS.marquee,
			Drag = Self.drag,
			_max = Math.max,
			_min = Math.min,
			cvs,
			ctx,
			image,
			oX, oY;

		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				// reset selection canvas
				Self.cvs.prop({ width: File.width, height: File.height });
				Proj.swap.cvs.prop({ width: File.width, height: File.height });

				// mouse position
				oX = event.offsetX - File.oX;
				oY = event.offsetY - File.oY;

				if (Self.option === "magic-wand") {
					return Self.dispatch({ type: "select-magic-wand", oX, oY });
				}

				// stop marching ants, if marching
				Self.ants.init(Self);

				Self.drag = {
					ctx: Self.ctx,
					threshold: Self.threshold,
					clickX: event.clientX,
					clickY: event.clientY,
					oX,
					oY,
				};

				// prevent mouse from triggering mouseover
				APP.els.content.addClass("cover");
				// bind event handlers
				Proj.doc.on("mousemove mouseup", Self.dispatch);
				break;
			case "mousemove":
				Drag.oW = event.clientX - Drag.clickX;
				Drag.oH = event.clientY - Drag.clickY;
				
				// clear marquee canvas (fastest way)
				Drag.ctx.clear();

				switch (Self.option) {
					case "rectangle":
						Drag.ctx.fillRect(Drag.oX, Drag.oY, Drag.oW, Drag.oH);
						break;
					case "elliptic":
						let eW = Drag.oW / 2,
							eH = Drag.oH / 2,
							eX = Drag.oX + eW,
							eY = Drag.oY + eH;
						if (eW < 0) eW *= -1;
						if (eH < 0) eH *= -1;
						Drag.ctx.ellipse(eX, eY, eW, eH, 0, 0, Math.PI*2);
						break;
				}
				// paint selected area
		    	Drag.ctx.fill();

				// paint ants but no marching
				Self.ants.init(Self);
				break;
			case "mouseup":
				// start marching if there is any box
				if (Drag.oW && Drag.oH) Self.ants.init(Self, true);

				// remove class
				APP.els.content.removeClass("cover");
				// unbind event handlers
				Proj.doc.off("mousemove mouseup", Self.dispatch);
				break;
			// custom events
			case "select-magic-wand":
				cvs = File.cvs[0];
				ctx = File.ctx;
				image = {
					data: ctx.getImageData(0, 0, cvs.width, cvs.height),
					width: cvs.width,
					height: cvs.height,
					threshold: 15,
					ctx: Projector.file.ctx,
				};
				// get mask
				image.mask = Self.magicWand.floodFill(image, event.oX, event.oY, null, true);
				// apply mask to mask canvas
				Self.paintMask(image);

				Self.ants();
				break;
			case "select-option":
				Self.option = event.arg || "rectangle";
				break;
			case "enable":
				Proj.cvs.on("mousedown", Self.dispatch);
				break;
			case "disable":
				Proj.cvs.off("mousedown", Self.dispatch);
				break;
		}
	},
	paintMask(image) {
		// paint mask
		let imgData = this.ctx.createImageData(image.width, image.height);
		let res = imgData.data;

		let data = image.mask.data;
		let bounds = image.mask.bounds;
		let maskW = image.mask.width;
		let w = image.w;
		let h = image.h;
		let rgba = [0, 0, 0, 255];

		for (let y=bounds.minY; y<=bounds.maxY; y++) {
			for (let x=bounds.minX; x<=bounds.maxX; x++) {
				if (data[y * maskW + x] == 0) continue;
				let k = (y * w + x) * 4; 
				res[k] = rgba[0];
				res[k + 1] = rgba[1];
				res[k + 2] = rgba[2];
				res[k + 3] = rgba[3];
			}
		}
		// this.ctx.putImageData(imgData, 0, 0);

		this.ants();
	}
}
