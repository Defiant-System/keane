
// keane.tools.marquee.ants

{
	_halt: true,
	paint(march) {
		this.mask = Mask;
		this.threshold = Mask.threshold;
		this.projector = Projector;
		this.w = this.projector.file.width;
		this.h = this.projector.file.height;
		// clear canvas
		this.cvs.prop({ width: this.w, height: this.h });
		this.cvsImg = this.ctx.getImageData(0, 0, this.w, this.h);
		this.mask = this.getOutlineMask().data;
		this.aO = 0;
		// let marching start
		this._halt = !march;
		// prevents choking frame
		cancelAnimationFrame(this.raf);

		this.render(march);
	},
	halt(clear) {
		this._halt = true;
		if (clear) this.paint();
	},
	resume() {
		this._halt = false;
		cancelAnimationFrame(this.raf);
		if (this.mask) this.render(true);
	},
	match(srcData, w, h, x, y) {
		let alpha = this.getPixel(srcData, w, h, x, y);
		return alpha === null || alpha >= this.threshold;
	},
	isEdge(srcData, w, h, x, y) {
		let x1 = x - 1,
			x2 = x + 1,
			y1 = y - 1,
			y2 = y + 1;
		return  !this.match(srcData, w, h, x1, y1) || !this.match(srcData, w, h, x, y1)  ||
				!this.match(srcData, w, h, x2, y1) || !this.match(srcData, w, h, x1, y)  || false ||
				!this.match(srcData, w, h, x2, y)  || !this.match(srcData, w, h, x1, y2) ||
				!this.match(srcData, w, h, x, y2)  || !this.match(srcData, w, h, x2, y2);
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
			srcImg = this.mask.ctx.getImageData(0, 0, w, h),
			clone = new Uint8ClampedArray(srcImg.data),
			dstImg = new ImageData(clone, w, h),
			srcData = srcImg.data,
			dstData = dstImg.data,
			y, x, v;
		// iterate image data and find outline
		for (y=0; y<h; y++) {
			for (x=0; x<w; x++) {
				v = this.match(srcData, w, h, x, y) && this.isEdge(srcData, w, h, x, y) ? 0x00 : 0xFF;
				this.setPixel(dstData, w, x, y, v);
			}
		}
		return dstImg;
	},
	ant(x, y, o) {
		return ((5 + y + o % 10) + x) % 10 >= 5 ? 0x00 : 0xFF;
	},
	render(march) {
		// let Proj = this.projector;
		let mask = this.mask,
			cvsImg = this.cvsImg,
			data = this.cvsImg.data,
			aO = this.aO,
			ant = this.ant,
			w = this.w,
			h = this.h,
			isEdge,
			y, x, o, v;
		// loop pixels
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
		// put image data on own canvas
		this.ctx.putImageData(cvsImg, 0, 0);
		// update projector
		Projector.render({ ants: this.cvs[0], noEmit: true });
		// march tiny ants!
		this.aO -= .175;

		if (!this._halt) {
			this.raf = requestAnimationFrame(this.render.bind(this));
		}
	}
}
