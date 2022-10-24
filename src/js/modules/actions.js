

const Actions = {
	getPixels(cvs) {
		return Filters.getPixels(cvs);
	},
	createImageData(w, h) {
		return Filters.createImageData(w, h);
	},
	fill(src, dest) {
		let d = src.data,
			w = src.width,
			h = src.height;
		// get masked pixels, if dest omitted
		dest = Mask.ctx.getImageData(0, 0, w, h).data;
		
		Stroke(dest, src);

		return src;
	},
	stroke(pixels) {
		let d = pixels.data,
			w = pixels.width,
			h = pixels.height,
			maskPixels = Mask.ctx.getImageData(0, 0, w, h).data;
		Stroke(maskPixels, d);
		return pixels;
	}
};

