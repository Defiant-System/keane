

const Actions = {
	init() {
		// sharing canvas with Filters object
		this.cvs = Filters.cvs;
		this.ctx = Filters.ctx;
	},
	getPixels(cvs) {
		return Filters.getPixels(cvs);
	},
	createImageData(w, h) {
		return Filters.createImageData(w, h);
	},
	stroke(src, dest) {
		this.merge(src);
		return src;
	},
	fill(src) {
		let color = ColorLib.hexToRgb(Projector.file.fgColor),
			width = src.width,
			height = src.height;
		// put masked area on temp canvas
		this.cvs.prop({ width, height });
		this.ctx.drawImage(Mask.cvs[0], 0, 0);
		// paint it with "fgColor"
		let pixels = this.getPixels(this.cvs[0]),
			d = pixels.data,
			w = pixels.width,
			h = pixels.height,
			c = [color.r, color.g, color.b];
		for (let x=0; x<w; x++) {
			for (let y=0; y<h; y++) {
				let o = (x + y * w) * 4;
				d[o + 0] = c[0];
				d[o + 1] = c[1];
				d[o + 2] = c[2];
			}
		}
		// merge layers
		this.merge(src, pixels);
		// return result
		return src;
	},
	merge(layer1, layer2) {
		let width = layer1.width,
			height = layer1.height
			k = new Uint32Array(layer2.data.buffer),
			F = new Uint32Array(layer1.data.buffer),
			A=0;
		for (; A<width; A++) {
			let D = A * height;
			for (let H=0; H<height; H++) {
				let W = k[D + H];
				if (W >>> 24 == 0) continue;
				if (W >>> 24 == 255) {
					F[D + H] = k[D + H];
					continue;
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
				F[D + H] = ~~(.5 + h * 255) << 24 | ~~(.5 + (m * i + v * C) * L) << 16 | ~~(.5 + (a * i + c * C) * L) << 8 | ~~(.5 + (B * i + p * C) * L);
			}
		}
		return layer1;
	}
};

