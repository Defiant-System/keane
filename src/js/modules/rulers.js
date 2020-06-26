
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
		let g = rG[0] * scale,
			x = oX % g,
			y = oY % g;

		// numbers
		for (; x<w; x+=g) {
			if (x < t) continue;
			let nr = _round(_abs(x - oX) / scale);
			this.ctx.fillText(nr, x + 3, 9);
		}
		// top ruler
		for (x=(oX%g)+1; x<w; x+=g) if (x>t) line(x, 0, x, t);
		g = rG[1] * scale;
		if (g) for (x=(oX%g)+1; x<w; x+=g) if (x>t) line(x, 12, x, t);
		g = rG[2] * scale;
		if (g) for (x=(oX%g)+1; x<w; x+=g) if (x>t) line(x, 15, x, t);

		// ruler numbers
		g = rG[0] * scale;
		for (; y<h; y+=g) {
			if (y < t) continue;
			let nr = _round(_abs(y - oY) / scale);
			nr.toString().split("").map((c, i) => this.ctx.fillText(c, 4, y + 1 + ((i + 1) * 9)));
		}
		// left ruler
		g = rG[0] * scale;
		for (y=(oY%g)+1; y<h; y+=g) if (y>t) line(0, y, t, y);
		g = rG[1] * scale;
		if (g) for (y=(oY%g)+1; y<h; y+=g) if (y>t) line(12, y, t, y);
		g = rG[2] * scale;
		if (g) for (y=(oY%g)+1; y<h; y+=g) if (y>t) line(15, y, t, y);

		// debug
		// this.ctx.strokeStyle = "#fff";
		// line(oX, 0, oX, t);
		// line(0, oY, t, oY);
	}
};
