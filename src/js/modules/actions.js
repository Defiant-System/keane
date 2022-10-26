

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
	delete(pixels) {
		let mask = this.getPixels(Mask.cvs[0]);
		return this.subtract(pixels, mask);
	},
	stroke(pixels) {
		let d = pixels.data,
			masked = this.getPixels(Mask.cvs[0]).data,
			// buf = new Uint32Array(masked.buffer),
			buf = this.getChannel(masked),
			i = 0,
			il = d.length;

		let oy2 = l => l + 1 + (l >>> 8) >>> 8;

		for (; i<il; i++) {
			d[(i << 2) + 3] = oy2(d[(i << 2) + 3] * buf[i]);
		}

		return pixels;
	},
	getChannel(data, channel) {
		let c = ["red", "gren", "blue"].indexOf(channel) || 0,
			b = new Uint8Array(data.buffer),
			il = b.length,
			i = 0;
		for (; i<il; i++) {
			b[i] = data[(i << 2) + c];
		}
		return b;
	},
	fill(src, hex) {
		let color = ColorLib.hexToRgb(hex || Projector.file.fgColor),
			width = src.width,
			height = src.height;
		// paint it with "fgColor"
		let pixels = this.getPixels(Mask.cvs[0]),
			d = pixels.data,
			c = [color.r, color.g, color.b];
		for (let x=0; x<width; x++) {
			for (let y=0; y<height; y++) {
				let o = (x + y * width) * 4;
				d[o + 0] = c[0];
				d[o + 1] = c[1];
				d[o + 2] = c[2];
			}
		}
		// merge layers
		this.add(src, pixels);
		// return result
		return src;
	},
	subtract(layer1, layer2) {
		let d = layer1.data,
			s = layer2.data,
			i = 0,
			il = d.length;
		for (; i<il; i+=4) {
			d[i+3] -= s[i+3];
		}
		return layer1;
	},
	add(layer1, layer2) {
		let width = layer1.width,
			height = layer1.height,
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

