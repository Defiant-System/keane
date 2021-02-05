
// TOOLS.marquee

{
	magicWand: @import "../ext/magicWand.js",
	init() {
		// layer canvas
		let { cvs, ctx } = Misc.createCanvas(1, 1);
		this.cvs = cvs;
		this.ctx = ctx;

		this.ctx.fillStyle = "#000";
		this.threshold = 0xC0;
		this.option = "magic-wand";
		// this.option = "rectangle";
	},
	dispatch(event) {
		let APP = keane,
			Proj = Projector,
			File = Proj.file,
			Self = TOOLS.marquee,
			Drag = Self.drag,
			_max = Math.max,
			_min = Math.min,
			data,
			oX, oY;

		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				// mouse position
				oX = event.offsetX - File.oX;
				oY = event.offsetY - File.oY;

				if (Self.option === "magic-wand") {
					Self.magicWand.getMask(File.cvs[0], oX, oY, Proj.swap.ctx);
					return;
				}

				// reset selection canvas
				Self.cvs.prop({ width: File.width, height: File.height });
				Proj.swap.cvs.prop({ width: File.width, height: File.height });

				// stop marching ants, if marching
				Self.ants();

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
	ants(march) {
		this.projector = Projector;
		this.file = Projector.file;
		this.w = this.file.width;
		this.h = this.file.height;
		this.cvsImg = this.file.ctx.getImageData(0, 0, this.w, this.h);
		this.mask = this.getOutlineMask().data;
		this.aO = 0;
		// let marching start
		this.halt = !march;

		this.render(march);
	},
	match(srcData, x, y) {
		let w = this.w,
			h = this.h,
			alpha = this.getPixel(srcData, w, h, x, y);
		return alpha === null || alpha >= this.threshold;
	},
	isEdge(srcData, x, y) {
		let x1 = x - 1,
			x2 = x + 1,
			y1 = y - 1,
			y2 = y + 1;
		return  !this.match(srcData, x1, y1) || !this.match(srcData, x, y1) || !this.match(srcData, x2, y1) ||
				!this.match(srcData, x1, y)  ||            false            || !this.match(srcData, x2, y)  ||
				!this.match(srcData, x1, y2) || !this.match(srcData, x, y2) || !this.match(srcData, x2, y2);
	},
	setPixel(dstData, w, x, y, v) {
		let o = ((y * w) + x) * 4;
		dstData[o + 0] =
		dstData[o + 1] =
		dstData[o + 2] = v;
		dstData[o + 3] = 0xFF;
	},
	getPixel(srcData, w, h, x, y) {
		if (x < 0 || x >= w || y < 0 || y >= h) return;
		return srcData[(((y * w) + x) * 4) + 3];
	},
	getOutlineMask() {
		let w = this.w,
			h = this.h,
			srcImg = this.ctx.getImageData(0, 0, w, h),
			clone = new Uint8ClampedArray(srcImg.data),
			dstImg = new ImageData(clone, w, h),
			srcData = srcImg.data,
			dstData = dstImg.data,
			y, x, v;
		// iterate image data and find outline
		for (y=0; y<h; y++) {
			for (x=0; x<w; x++) {
				v = this.match(srcData, x, y) && this.isEdge(srcData, x, y) ? 0x00 : 0xFF;
				this.setPixel(dstData, w, x, y, v);
			}
		}
		return dstImg;
	},
	ant(x, y, o) {
		return ((5 + y + o % 10) + x) % 10 >= 5 ? 0x00 : 0xFF;
	},
	render(march) {
		let Proj = this.projector,
			mask = this.mask,
			cvsImg = this.cvsImg,
			data = this.cvsImg.data,
			aO = this.aO,
			ant = this.ant,
			w = this.w,
			h = this.h,
			isEdge,
			y, x, o, v;

		for (y=0; y<h; y++) {
			for (x=0; x<w; x++) {
				o = ((y * w) + x) * 4;
				isEdge = mask[o] === 0x00;
				// continue if it is not mask outline edge
				if (!isEdge) continue;

				v = ant(x, y, aO);
				data[o + 0] = v;
				data[o + 1] = v;
				data[o + 2] = v;
				data[o + 3] = 0xFF;
			}
		}
		// update projector
		Proj.swap.ctx.putImageData(cvsImg, 0, 0);
		Proj.render({ imgCvs: Proj.swap.cvs[0], noEmit: true });
		
		// march tiny ants!
		this.aO -= .2;

		if (!this.halt) {
			requestAnimationFrame(this.render.bind(this));
		}
	}
}
