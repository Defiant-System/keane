
const ZOOM =   [{ level: 12.5, rG: [200, 100, 50] },
				{ level: 25,   rG: [100, 0,   20] },
				{ level: 50,   rG: [100, 50,  10] },
				{ level: 75,   rG: [50,  0,   5 ] },
				{ level: 100,  rG: [50,  10,  5 ] },
				{ level: 200,  rG: [20,  10,  5 ] },
				{ level: 300,  rG: [20,  10,  2 ] },
				{ level: 400,  rG: [10,  10,  2 ] },
				{ level: 600,  rG: [10,  5,   1 ] },
				{ level: 800,  rG: [10,  5,   1 ] },
				{ level: 1200, rG: [5,   0,   1 ] },
				{ level: 1600, rG: [2,   0,   1 ] },
				{ level: 3200, rG: [2,   1,   0 ] }];

const Misc = {
	bresenhamLine(x0, y0, x1, y1, cb) {
		let dx = Math.abs(x1 - x0),
			dy = Math.abs(y1 - y0),
			sx = (x0 < x1) ? 1 : -1,
			sy = (y0 < y1) ? 1 : -1,
			err = dx - dy;
		while(true) {
			if (cb) cb(x0, y0);
			if (x0 === x1 && y0 === y1) break;
			let e2 = 2 * err;
			if (e2 > -dy) { err -= dy; x0 += sx; }
			if (e2 < dx) { err += dx; y0 += sy; }
		}
	},
	createCanvas(width, height) {
		let cvs = $(document.createElement("canvas")),
			ctx = cvs[0].getContext("2d");
		cvs.prop({ width, height });
		return { cvs, ctx }
	},
	createPattern(src, callback) {
		let image = new Image();
		image.onload = () => callback(Projector.ctx.createPattern(image, "repeat"));
		image.src = src;
	}
};

const Tween = {
	linear(t, b, c, d) {
		return c * t / d + b;
	},
	bounce(t, b, c, d) {
		return c * Math.sin(t / d * Math.PI) + b;
	},
	easeIn(t, b, c, d) {
		return c * (t /= d) * t * t + b;
	},
	easeOut(t, b, c, d) {
		return c * ((t = t / d - 1) * t * t + 1) + b;
	},
	easeInOut(t, b, c, d) {
		return ((t /= d / 2) < 1) ? c / 2 * t * t * t + b : c / 2 * ((t -= 2) * t * t + 2) + b;
	},
}
