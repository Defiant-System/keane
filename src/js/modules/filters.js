
// Rewrite from: https://www.html5rocks.com/en/tutorials/canvas/imagefilters/

const Filters = {
	init() {
		let { cvs, ctx } = Misc.createCanvas(1, 1);
		this.cvs = cvs;
		this.ctx = ctx;
	},
	getPixels(cvs) {
		let ctx = cvs.getContext("2d");
		return ctx.getImageData(0, 0, cvs.width, cvs.height);
	},
	createImageData(w, h) {
		return this.ctx.createImageData(w, h);
	},
	grayscale(pixels) {
		let d = pixels.data,
			i = 0,
			il = d.length;
		for (; i<il; i+=4) {
			let r = d[i],
				g = d[i+1],
				b = d[i+2],
				// CIE luminance for the RGB
				v = 0.2126*r + 0.7152*g + 0.0722*b;
			d[i] = d[i+1] = d[i+2] = v
		}
		return pixels;
	},
	contrast(pixels, adjustment) {
		/*
		 * min: -100
		 * max: 100
		 */
		let a = adjustment / 1.5,
			factor = (259 * (a + 255)) / (255 * (259 - a)),
			d = pixels.data,
			i = 0,
			il = d.length;
		for (; i<il; i+=4) {
			d[i]   = factor * (d[i] - 128) + 128;
			d[i+1] = factor * (d[i+1] - 128) + 128;
			d[i+2] = factor * (d[i+2] - 128) + 128;
		}
		return pixels;
	},
	brightness(pixels, adjustment) {
		/*
		 * min: -150
		 * max: 150
		 */
		let d = pixels.data,
			a = +adjustment / 1.75,
			i = 0,
			il = d.length;
		for (; i<il; i+=4) {
			d[i]   += a;
			d[i+1] += a;
			d[i+2] += a;
		}
		return pixels;
	},
	threshold(pixels, threshold) {
		let d = pixels.data,
			t = +threshold,
			i = 0,
			il = d.length;
		for (; i<il; i+=4) {
			let r = d[i],
				g = d[i+1],
				b = d[i+2],
				v = (0.2126*r + 0.7152*g + 0.0722*b >= t) ? 255 : 0;
			d[i] = d[i+1] = d[i+2] = v
		}
		return pixels;
	},
	invert(pixels) {
		let d = pixels.data,
			i = 0,
			il = d.length;
		for (; i<il; i+=4) {
			d[i]   = d[i]   ^ 255;
			d[i+1] = d[i+1] ^ 255;
			d[i+2] = d[i+2] ^ 255;
		}
		return pixels;
	},
	pixelate(pixels, size) {
		let d = pixels.data,
			w = pixels.width,
			h = pixels.height;
		// TODO
		return pixels;
	},
	gaussianBlur(pixels, radius) {
		let d = pixels.data,
			w = pixels.width,
			h = pixels.height,
			r = +radius;
		// TODO: make it better !?
		gaussianBlur(d, w, h, r);

		return pixels;
	},
	noise(pixels) {
		let d = pixels.data,
			w = pixels.width,
			h = pixels.height;
		for (let x=0; x<w; x++) {
			for (let y=0; y<h; y++) {
				let o = (x + y * w) * 4;
				d[o + 0] =
                d[o + 1] =
                d[o + 2] = Math.random() < 0.5 ? 0 : 255;
                d[o + 3] = 255;
			}
		}
		return pixels;
	},
	clouds(pixels) {
		let File = Projector.file,
			bg = ColorLib.hexToRgb(File.bgColor),
			fg = ColorLib.hexToRgb(File.fgColor),
			lerp = (v0, v1, t) => (1 - t) * v0 + t * v1,
			simplex = new SimplexNoise,
			d = pixels.data,
			w = pixels.width,
			h = pixels.height,
			noise = (x, y) => {
				let amp = .8,
					sum = 0,
					scale = .009;
				for (let i=0; i<6; ++i) {
					amp *= .5;
					sum += amp * (simplex.noise2D(x * scale, y * scale) + 1) * 0.5;
					scale *= 2;
				}
				return sum;
			};
		for (let x=0; x<w; x++) {
			for (let y=0; y<h; y++) {
				let o = (x + y * w) * 4,
					n = noise(x, y);
				d[o + 0] = lerp(bg.r, fg.r, n);
                d[o + 1] = lerp(bg.g, fg.g, n);
                d[o + 2] = lerp(bg.b, fg.b, n);
                d[o + 3] = 255;
			}
		}
		return pixels;
	},
	sharpen(pixels) {
		let mx = [ 0, -1,  0,
				  -1,  5, -1,
				   0, -1,  0];
		return this.convolute(pixels, mx);
	},
	blur(pixels) {
		let mx = [  1/9, 1/9, 1/9,
					1/9, 1/9, 1/9,
					1/9, 1/9, 1/9 ];
		return this.convolute(pixels, mx);
	},
	sobel(pixels) {
		pixels = this.grayscale(pixels);

		let vertical = this.convoluteFloat32(pixels, [-1,-2,-1,0,0,0,1, 2, 1]),
			horizontal = this.convoluteFloat32(pixels, [-1,0,1,-2,0,2,-1,0,1]),
			id = this.createImageData(vertical.width, vertical.height),
			i = 0,
			il = id.data.length,
			_abs = Math.abs;
		for (; i<il; i+=4) {
			let v = _abs(vertical.data[i]),
				h = _abs(horizontal.data[i]);
			id.data[i] = v;
			id.data[i+1] = h
			id.data[i+2] = (v+h)/4;
			id.data[i+3] = 255;
		}
		return id;
	},
	convolute(pixels, weights, opaque) {
		var _min = Math.min,
			_max = Math.max,
			side = Math.round(Math.sqrt(weights.length)),
			halfSide = Math.floor(side/2),
			src = pixels.data,
			sw = pixels.width,
			sh = pixels.height,
			w = sw,
			h = sh,
			output = this.createImageData(w, h),
			dst = output.data,
			alphaFac = opaque ? 1 : 0;

		for (let y=0; y<h; y++) {
			for (let x=0; x<w; x++) {
				let sy = y,
					sx = x,
					dstOff = (y*w+x)*4,
					r=0, g=0, b=0, a=0;
				for (let cy=0; cy<side; cy++) {
					for (let cx=0; cx<side; cx++) {
						let scy = _min(sh-1, _max(0, sy + cy - halfSide)),
							scx = _min(sw-1, _max(0, sx + cx - halfSide)),
							srcOff = (scy*sw+scx)*4,
							wt = weights[cy*side+cx];
						r += src[srcOff] * wt;
						g += src[srcOff+1] * wt;
						b += src[srcOff+2] * wt;
						a += src[srcOff+3] * wt;
					}
				}
				dst[dstOff] = r;
				dst[dstOff+1] = g;
				dst[dstOff+2] = b;
				dst[dstOff+3] = a + alphaFac*(255-a);
			}
		}
		return output;
	},
	convoluteFloat32(pixels, weights, opaque) {
		let _min = Math.min,
			_max = Math.max,
			side = Math.round(Math.sqrt(weights.length)),
			halfSide = Math.floor(side/2),
			src = pixels.data,
			sw = pixels.width,
			sh = pixels.height,
			width = sw,
			height = sh,
			data = new Float32Array(width * height * 4),
			output = { width, height, data },
			dst = output.data,
			alphaFac = opaque ? 1 : 0;

		for (let y=0; y<height; y++) {
			for (let x=0; x<width; x++) {
				let sy = y,
					sx = x,
					dstOff = (y * width + x)*4,
					r=0, g=0, b=0, a=0;
				for (let cy=0; cy<side; cy++) {
					for (let cx=0; cx<side; cx++) {
						let scy = _min(sh-1, _max(0, sy + cy - halfSide)),
							scx = _min(sw-1, _max(0, sx + cx - halfSide)),
							srcOff = (scy*sw+scx)*4,
							wt = weights[cy*side+cx];
						r += src[srcOff] * wt;
						g += src[srcOff+1] * wt;
						b += src[srcOff+2] * wt;
						a += src[srcOff+3] * wt;
					}
				}
				dst[dstOff] = r;
				dst[dstOff+1] = g;
				dst[dstOff+2] = b;
				dst[dstOff+3] = a + alphaFac*(255-a);
			}
		}
		return output;
	}
};
