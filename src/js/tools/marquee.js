
// keane.tools.marquee

{
	ants: @import "./marquee-ants.js",
	magicWand: @import "./marquee-magicWand.js",
	init() {
		// layer canvas
		let { cvs, ctx } = Misc.createCanvas(1, 1);
		this.cvs = cvs;
		this.ctx = ctx;

		this.ctx.fillStyle = "#000";
		this.threshold = 0xC0;
		this.option = "rectangle";
	},
	dispatch(event) {
		let APP = keane,
			Proj = Projector,
			File = Proj.file,
			Self = APP.tools.marquee,
			Drag = Self.drag,
			_max = Math.max,
			_min = Math.min,
			color,
			mask,
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

				// stop marching ants, if marching
				Self.ants.init(Self);

				// mouse position
				oX = event.offsetX - File.oX;
				oY = event.offsetY - File.oY;

				switch (Self.option) {
					case "lasso":
					case "polygon":
					case "magnetic":
						break;
					case "magic-wand":
						Self.dispatch({ type: "select-with-magic-wand", oX, oY });
						break;
					case "rectangle":
					case "elliptic":
						Self.drag = {
							ctx: Self.ctx,
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
				}
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
						let eW = Drag.oW >> 1,
							eH = Drag.oH >> 1,
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
				// start marching if there is selection
				if (Drag.oW && Drag.oH) Self.ants.init(Self, true);

				// remove class
				APP.els.content.removeClass("cover");
				// unbind event handlers
				Proj.doc.off("mousemove mouseup", Self.dispatch);
				break;
			
			// system events
			case "window.keystroke":
				switch (event.char) {
					case "backspace":
						if (event.altKey) color = File.fgColor;
						if (event.metaKey) color = File.bgColor;
						// colorize mask
						Self.ctx.save();
						Self.ctx.globalCompositeOperation = "source-in";
						Self.ctx.fillStyle = color;
						Self.ctx.fillRect(0, 0, 1e9, 1e9);
						Self.ctx.fill();
						Self.ctx.restore();

						if (color) {
							Self.applyCompositeMask({ operation: "source-over" });
						} else {
							Self.applyCompositeMask({ operation: "xor" });
						}
						break;
					case "del":
						Self.applyCompositeMask({ operation: "xor" });
						break;
				}
				break;
			// custom events
			case "select-with-magic-wand":
				Self.ctx.drawImage(File.cvs[0], 0, 0);
				let data = Self.ctx.getImageData(0, 0, File.width, File.height).data;
				// clear marquee canvas (fastest way)
				Self.ctx.clear();
				// prepare image data for algorithm
				image = {
					data,
					ctx: Self.ctx,
					width: File.width,
					height: File.height,
					threshold: 15,
					blurRadius: 5,
					bytes: 4,
				};
				// get mask
				image.mask = Self.magicWand.floodFill(image, event.oX, event.oY, null, true);
				if (image.mask) Self.magicWand.gaussBlurOnlyBorder(image, null);

				// apply mask to mask canvas
				Self.paintMask(image);
				// start marching ants
				Self.ants.init(Self, true);
				break;
			case "select-option":
				Self.option = event.arg || "rectangle";
				break;
			case "select-all":
				// colorize mask
				Self.ctx.fillRect(0, 0, 1e9, 1e9);
				Self.ctx.fill();
				// march little ants!
				Self.ants.init(Self, true);
				break;
			case "deselect":
				Self.ctx.clear();
				// halt ants
				Self.ants.init(Self);
				break;
			case "inverse-selection":
				Self.ctx.globalCompositeOperation = "source-out";
				Self.ctx.fillRect(0, 0, 1e9, 1e9);
				Self.ctx.fill();
				// start marching ants
				Self.ants.init(Self, true);
				break;
			case "enable":
				Proj.cvs.on("mousedown", Self.dispatch);
				// temp
				// APP.els.content.find(".tool[data-arg='magic-wand']").trigger("click");
				break;
			case "disable":
				Proj.cvs.off("mousedown", Self.dispatch);
				break;
		}
	},
	applyCompositeMask(opt) {
		let Self = this,
			File = Projector.file;
		// stop marching ants, if marching
		Self.ants.init(Self);
		// applies selection to "active layer"
		File.activeLayer.applyCompositeImage({ ...opt, image: Self.cvs[0] });
		// Render file
		File.render();
	},
	paintMask(image) {
		// paint mask
		let w = image.width;
		let h = image.height;
		let imgData = image.ctx.createImageData(w, h);
		let res = imgData.data;
		let data = image.mask.data;
		let bounds = image.mask.bounds;
		let maskW = image.mask.width;
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

		image.ctx.putImageData(imgData, 0, 0);
	}
}
