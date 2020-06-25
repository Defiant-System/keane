
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
			w = _round(Canvas.aW * 1.5),
			h = _round(Canvas.aH * 1.5),
			line = (p1x, p1y, p2x, p2y) => {
				this.ctx.beginPath();
				this.ctx.moveTo(p1x, p1y);
				this.ctx.lineTo(p2x, p2y);
				this.ctx.stroke();
			};

		this.w = w;
		this.h = h;
		// reset/resize canvas
		this.cvs.prop({ width: w, height: h });
		this.ctx.translate(-.5, -.5);

		let oX = _round(Canvas.oX + (Canvas.aW * .25)),
			oY = _round(Canvas.oY + (Canvas.aH * .25));

		this.oX = oX - 1;
		this.oY = oY - 1;

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

		// top ruler
		let dX = (oX - t) % rG[0],
			xG = rG[0] * scale,
			x = t + 1;

		for (; x<w; x+=xG) line(x + dX, 0, x + dX, t);

		xG = rG[1] * scale;
		if (xG) for (x=t+1; x<w; x+=xG) line(x + dX, 12, x + dX, t);

		xG = rG[2] * scale;
		if (xG) for (x=t+1; x<w; x+=xG) line(x + dX, 15, x + dX, t);


		this.ctx.strokeStyle = "#fff";
		line(oX, 0, oX, t);
		line(0, oY, t, oY);

		// debug
		// this.ctx.fillStyle = "#f00";
		// this.ctx.strokeStyle = "#000";
		// this.ctx.fillRect(0, 0, 1e4, 1e4);
	}
};
