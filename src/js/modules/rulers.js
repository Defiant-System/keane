
const Rulers = {
	init() {
		let { cvs, ctx } = Canvas.createCanvas(1, 1);
		this.cvs = cvs;
		this.ctx = ctx;
		this.MAX = 16384,
		this.t = 18;  // ruler thickness
		this.oX = this.t;
		this.oY = 0;
	},
	render(Canvas) {
		let _max = Math.max,
			_min = Math.min,
			_abs = Math.abs,
			_round = Math.round,
			scale = Canvas.scale,
			rG = ZOOM.find(z => z.level === scale * 100).rG,
			t = this.t,
			w = _round(_max(Canvas.w, window.width) * 1.5),
			h = _round(_max(Canvas.h, window.height) * 1.5),
			oX = _round(w * .3),
			oY = _round(h * .3),
			line = (p1x, p1y, p2x, p2y) => {
				this.ctx.beginPath();
				this.ctx.moveTo(p1x, p1y);
				this.ctx.lineTo(p2x, p2y);
				this.ctx.stroke();
			};
		if (this.scale === Canvas.scale) return;
		this.scale = Canvas.scale;

		this.maxed = false;
		if (w > this.MAX || h > this.MAX) {
			this.maxed = true;
			// prepare to create repeatable pattern
			w = h = (rG[0] * scale * 10);
			oX = _round(w * .3);
			oY = _round(h * .3);
		}

		this.w = w;
		this.h = h;
		this.oX = oX;
		this.oY = oY;

		// reset/resize canvas
		this.cvs.prop({ width: w, height: h });
		this.ctx.translate(-.5, -.5);

		// ruler bg & style
		this.ctx.lineWidth = 1;
		this.ctx.fillStyle = "#112222e5";
		this.ctx.strokeStyle = "#0000009e";

		this.ctx.fillRect(0, 0, w, t);
		this.ctx.fillRect(0, t, t, h);
		line(0, t, w, t);  // top ruler bottom line
		line(t, 0, t, h);  // left ruler right line

		// ruler fg & style
		this.ctx.strokeStyle = "#444";
		this.ctx.textAlign = "left";
		this.ctx.fillStyle = "#666";
		this.ctx.font = `9px Arial`;

		// top ruler
		let xG = rG[0] * scale,
			yG = rG[0] * scale,
			x = oX % xG,
			y = oY % yG;
		// numbers
		if (!this.maxed) for (; x<w; x+=xG) {
			if (x < t) continue;
			let nr = _round(_abs(x - oX) / scale);
			this.ctx.fillText(nr, x + 3, 9);
		}
		// top ruler
		for (x=(oX%xG)+1; x<w; x+=xG) if (x>t) line(x, 0, x, t);
		xG = rG[1] * scale;
		if (xG) for (x=(oX%xG)+1; x<w; x+=xG) if (x>t) line(x, 12, x, t);
		xG = rG[2] * scale;
		if (xG) for (x=(oX%xG)+1; x<w; x+=xG) if (x>t) line(x, 15, x, t);

		// ruler numbers
		if (!this.maxed) for (; y<h; y+=yG) {
			if (y < t) continue;
			let nr = _round(_abs(y - oY) / scale);
			nr.toString().split("").map((c, i) => this.ctx.fillText(c, 4, y + 1 + ((i + 1) * 9)));
		}
		// left ruler
		for (y=(oY%yG)+1; y<h; y+=yG) if (y>t) line(0, y, t, y);
		yG = rG[1] * scale;
		if (yG) for (y=(oY%yG)+1; y<h; y+=yG) if (y>t) line(12, y, t, y);
		yG = rG[2] * scale;
		if (yG) for (y=(oY%yG)+1; y<h; y+=yG) if (y>t) line(15, y, t, y);

		if (this.maxed) {
			let pW = rG[0] * scale,
				poX = _round(Canvas.oX % pW),
				poY = _round(Canvas.oY % pW),
				pattern = Canvas.createCanvas(pW, pW);
			
			pattern.ctx.drawImage(this.cvs[0],
				oX - poX, 0, pW, t,
				0, 0, pW, t);
			this.xRepeat = this.ctx.createPattern(pattern.cvs[0], "repeat");

			//pattern.cvs.prop({ width: pW, height: pW });
			pattern.ctx.drawImage(this.cvs[0],
				0, oY - poY, t, pW,
				0, 0, t, pW);
			this.yRepeat = this.ctx.createPattern(pattern.cvs[0], "repeat");
		}

		// debug
		// this.ctx.strokeStyle = "#fff";
		// line(oX, 0, oX, t);
		// line(0, oY, t, oY);
	}
};
