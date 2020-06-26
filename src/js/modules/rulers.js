
const Rulers = {
	init() {
		let { cvs, ctx } = Canvas.createCanvas(1, 1);
		this.cvs = cvs;
		this.ctx = ctx;
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
		// reset/resize canvas
		this.cvs.prop({ width: w, height: h });
		this.ctx.translate(-.5, -.5);

		let oX = _round(Canvas.oX + (Canvas.aW * .5)),
			oY = _round(Canvas.oY + (Canvas.aH * .5));
		this.oX = oX;
		this.oY = oY;

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
		for (; x<w; x+=xG) {
			let nr = _round(_abs(x - oX) / scale);
			this.ctx.fillText(nr, x + 2, 9);
		}
		// top ruler
		for (x=oX%xG; x<w; x+=xG) line(x, 0, x, t);
		xG = rG[1] * scale;
		if (xG) for (x=oX%xG; x<w; x+=xG) line(x, 12, x, t);
		xG = rG[2] * scale;
		if (xG) for (x=oX%xG; x<w; x+=xG) line(x, 15, x, t);

		// ruler numbers
		for (; y<h; y+=yG) {
			let nr = _round(_abs(y - oY) / scale);
			nr.toString().split("").map((c, i) => this.ctx.fillText(c, 4, y + ((i + 1) * 9)));
		}
		// left ruler
		for (y=oY%yG; y<h; y+=yG) line(0, y, t, y);
		yG = rG[1] * scale;
		if (yG) for (y=oY%yG; y<h; y+=yG) line(12, y, t, y);
		yG = rG[2] * scale;
		if (yG) for (y=oY%yG; y<h; y+=yG) line(15, y, t, y);

		// debug
		this.ctx.strokeStyle = "#fff";
		line(oX, 0, oX, t);
		line(0, oY, t, oY);

		// this.ctx.fillStyle = "#f00";
		// this.ctx.strokeStyle = "#000";
		// this.ctx.fillRect(0, 0, 1e4, 1e4);
	}
};
