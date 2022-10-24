

const Actions = {
	getPixels(cvs) {
		return Filters.getPixels(cvs);
	},
	createImageData(w, h) {
		return Filters.createImageData(w, h);
	},
	stroke(src, dest) {
		this.fill(src);
		return src;
	},
	fill(src, dest) {
		// get masked pixels, if dest omitted
		dest = dest || Mask.ctx.getImageData(0, 0, src.width, src.height);
		
		let width = src.width,
			height = src.height,
			k = new Uint32Array(dest.data.buffer),
			F = new Uint32Array(src.data.buffer);
		
		for (let A = 0; A < width; A++) {
			let D = A * height;
			for (let H = 0; H < height; H++) {
				let W = k[D + H];
				if (W >>> 24 == 0) continue;
				if (W >>> 24 == 255) {
					F[D + H] = k[D + H];
					continue
				}
				let Z = F[D + H],
					B = W & 255,
					a = W >>> 8 & 255,
					m = W >>> 16 & 255,
					p = Z & 255,
					c = Z >>> 8 & 255,
					v = Z >>> 16 & 255,
					i = (W >>> 24) * (1 / 255),
					P = (Z >>> 24) * (1 / 255),
					C = P * (1 - i),
					h = i + C,
					L = 1 / h;
				F[D + H] = ~~(.5 + h * 255) << 24 | ~~(.5 + (m * i + v * C) * L) << 16 | ~~(.5 + (a * i + c * C) * L) << 8 | ~~(.5 + (B * i + p * C) * L)
			}
		}

		return src;
	}
};

