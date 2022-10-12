
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
	gaussianBlur(pixels, radius) {
		let d = pixels.data,
			w = pixels.width,
			h = pixels.height;
		// shortcut for "Blur More" menu option
		gaussianBlur(d, w, h, radius);
		return pixels;
	},
	brightnessContrast(pixels, val={}) {
		/* Brightness = min: -100   max: 100
		 * Contrast   = min: -150   max: 150
		 */
		let contrast = false, c, f,
			brightness = false, b;
		if (val.contrast) {
			contrast = true;
			c = (val.contrast / 254) + 1;
			f = 128 * (1 - c);
		}
		if (val.brightness) {
			brightness = true;
			b = 128 * (val.brightness / 300);
		}
		
		let i = 0, d = pixels.data, il = d.length;
		for (; i<il; i+=4) {
			if (contrast) {
				d[i]   = d[i]   * c + f;
				d[i+1] = d[i+1] * c + f;
				d[i+2] = d[i+2] * c + f;
			}
			if (brightness) {
				d[i]   += b;
				d[i+1] += b;
				d[i+2] += b;
			}
		}
		return pixels;
	},
	sponge(pixels, val={}) {
		let d = pixels.data,
			w = pixels.width,
			h = pixels.height;
		// console.log(val);

		let destData = this.createImageData(w, h),
			destPixels = destData.data,
			iLUT = [],
			rgbLUT = [];
		
		for (let y = 0; y < h; y++) {
			iLUT[y] = [];
			rgbLUT[y] = [];
			for (let x = 0; x < w; x++) {
				let idx = (y * w + x) * 4,
					r = d[idx],
					g = d[idx + 1],
					b = d[idx + 2],
					avg = (r + g + b) / 3;
				iLUT[y][x] = Math.round((avg * val.intensity) / 255);
				rgbLUT[y][x] = { r, g, b };
			}
		}
		
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				let piC = [];
				
				// Find intensities of nearest pixels within radius.
				for (var yy = -val.radius; yy <= val.radius; yy++) {
					for (var xx = -val.radius; xx <= val.radius; xx++) {
					 	if (y + yy > 0 && y + yy < h && x + xx > 0 && x + xx < w) {
							var iVal = iLUT[y + yy][x + xx];

							if (!piC[iVal]) {
								piC[iVal] = {
									val: 1,
									r: rgbLUT[y + yy][x + xx].r,
									g: rgbLUT[y + yy][x + xx].g,
									b: rgbLUT[y + yy][x + xx].b
								}
							} else {
								piC[iVal].val++;
								piC[iVal].r += rgbLUT[y + yy][x + xx].r;
								piC[iVal].g += rgbLUT[y + yy][x + xx].g;
								piC[iVal].b += rgbLUT[y + yy][x + xx].b;
							}
						}
					}
				}
				
				piC.sort((a, b) => b.val - a.val);

				var curMax = piC[0].val,
					dIdx = (y * w + x) * 4;
				
				destPixels[dIdx] = ~~ (piC[0].r / curMax);
				destPixels[dIdx + 1] = ~~ (piC[0].g / curMax);
				destPixels[dIdx + 2] = ~~ (piC[0].b / curMax);
				destPixels[dIdx + 3] = 255;
			}
		}
		
		return destData;
	},
	dither(pixels) {
		let d = pixels.data,
			w = pixels.width,
			h = pixels.height,
			closest = p => 256-p < 128 ? 255 : 0,
			i = 0,
			il = d.length;
		// convert to grayscale
		for (; i<il; i+=4) {
			d[i] =
			d[i+1] =
			d[i+2] = d[i] * 0.2126 + d[i+1] * .7152 + d[i+2] * .0722;
			d[i+3] = d[i+3];
		}
		// floyd-steinberg dither
		for (i=0; i<il; i+=4) {
			if (d[i+(w * 4)] === -1 || d[i+4] === -1 ) {
				break;
			} else {
				let op = d[i],
					np = closest(d[i]),
					qe = op - np;
				d[i] =
				d[i+1] =
				d[i+2] = np;
				d[i+4] = d[i+4] + qe * (7 / 16);
				d[i+(w * 4)] = d[i+(w * 4)] + qe * (5 / 16);
				d[i+(w* 4 -4)] = d[i+(w*4 -4)] + qe * (3 / 16);
				d[i+(w* 4 +4)] = d[i+(w * 4 +4)] + qe * (1 / 16);
			}
		}
		return pixels;
	},
	brightSteps(pixels, number) {
		let d = pixels.data,
			w = pixels.width,
			h = pixels.height,
			i = 0,
			il = d.length,

			high = 0,
			low = 255,
			getRange = l => {
				if (l > high) high = l;
				if (l < low) low = l;
			};
		// convert to grayscale
		for (; i<il; i+=4) {
			let luma = d[i] * 0.2126 + d[i+1] * .7152 + d[i+2] * .0722;
			getRange(luma);
			d[i] =
			d[i+1] =
			d[i+2] = luma;
		}

		let step = (high - low) / number;
		for (i=0; i<il; i+=4) {
			let luma = d[i];
			for (let k=step; k<=high; k+=step) {
				if (luma < k) {
					d[i] =
					d[i+1] =
					d[i+2] = k;
					break;
				}
			}
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
			h = pixels.height,
			nBinsX = Math.ceil(w / size),
			nBinsY = Math.ceil(h / size),
			xbS, xbE,
			ybS, ybE,
			xBin, yBin,
			pinBin,
			r, g, b, a,
			x, xl,
			y, yl,
			i;
		for (xBin=0; xBin<nBinsX; xBin+=1) {
			for (yBin=0; yBin<nBinsY; yBin+=1) {
				// Initialize the color accumlators to 0
				r = 0;
				g = 0;
				b = 0;
				a = 0;
				// Determine which pixels are included in this bin
				xbS = xBin * size;
				xbE = xbS + size;
				ybS = yBin * size;
				ybE = ybS + size;
				// Add all of the pixels to this bin!
				pinBin = 0;
				for (x=xbS, xl=Math.min(xbE, w); x<xl; x+=1) {
					for (y=ybS, yl=Math.min(ybE, h); y<yl; y+=1) {
						i = (w * y + x) * 4;
						r += d[i];
						g += d[i+1];
						b += d[i+2];
						a += d[i+3];
						pinBin += 1;
					}
				}
				// Make sure the channels are between 0-255
				r = r / pinBin;
				g = g / pinBin;
				b = b / pinBin;
				a = a / pinBin;
				// Draw this bin
				for (x=xbS, xl=Math.min(xbE, w); x<xl; x+=1) {
					for (y=ybS, yl=Math.min(ybE, h); y<yl; y+=1) {
						i = (w * y + x) * 4;
						d[i]   = r;
						d[i+1] = g;
						d[i+2] = b;
						d[i+3] = a;
					}
				}
			}
		}
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
