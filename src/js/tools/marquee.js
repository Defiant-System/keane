
// TOOLS.marquee

{
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
			Self = TOOLS.marquee,
			Drag = Self.drag,
			_max = Math.max,
			_min = Math.min,
			data;

		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				// reset selection canvas
				Self.cvs.prop({ width: File.width, height: File.height });
				Proj.swap.cvs.prop({ width: File.width, height: File.height });

				// stop marching ants, if marching
				Self.ants();

				Self.drag = {
					ctx: Self.ctx,
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
		this.cvsImg = this.file.ctx.getImageData(0, 0, this.file.width, this.file.height);

		this.mask = this.getOutlineMask().data;
		this.aO = 0;

		// let marching start
		this.halt = !march;

		this.render(march);
	},
	getOutlineMask() {
		let srcImg = this.ctx.getImageData(0, 0, this.w, this.h),
			// dstImg = this.ctx.getImageData(0, 0, this.w, this.h),
			clone = new Uint8ClampedArray(srcImg.data),
			dstImg = new ImageData(clone, this.w, this.h),
			srcData = srcImg.data,
			dstData = dstImg.data,
			match = (x, y) => {
				let alpha = get(x, y);
				return alpha === null || alpha >= this.threshold;
			},
			isEdge = (x, y) => {
				let x1 = x - 1, x2 = x + 1,
					y1 = y - 1, y2 = y + 1;
				return  !match(x1, y1) || !match(x, y1) || !match(x2, y1) ||
						!match(x1, y)  ||     false     || !match(x2, y)  ||
						!match(x1, y2) || !match(x, y2) || !match(x2, y2);
			},
			set = (x, y, v) => {
				let o = ((y * this.w) + x) * 4;
				dstData[o+0] = v;
				dstData[o+1] = v;
				dstData[o+2] = v;
				dstData[o+3] = 0xFF;
			},
			get = (x, y) => {
				if (x < 0 || x >= this.w || y < 0 || y >= this.h) return;
				let o = ((y * this.w) + x) * 4;
				return srcData[o+3];
			};
		// iterate image data and find outline
		for (let y=0; y<this.h; y++) {
			for (let x=0; x<this.w; x++) {
				let v = match(x, y) && isEdge(x, y) ? 0x00 : 0xFF;
				set(x, y, v);
			}
		}
		return dstImg;
	},
	render(march) {
		let Proj = this.projector,
			mask = this.mask,
			cvsImg = this.cvsImg,
			data = this.cvsImg.data,
			ant = (x, y, o) => ((5 + y + o % 10) + x) % 10 >= 5 ? 0x00 : 0xFF,
			aO = this.aO,
			fn;

		for (let y=0; y<this.h; y++) {
			for (let x=0; x<this.w; x++) {
				let o = ((y * this.w) + x) * 4,
					isEdge = mask[o] === 0x00;
				// continue if it is not mask outline edge
				if (!isEdge) continue;

				let v = ant(x, y, aO);
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
			requestAnimationFrame(() => this.render());
		}
	}
}
