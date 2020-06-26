
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
console.log(w, Canvas.w);
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
		let dX = oX % rG[0],
			dY = oY % rG[0],
			xG = rG[0] * scale,
			yG = rG[0] * scale,
			x, y;
		
		for (x=dX; x<w; x+=xG) {
			line(x, 0, x, t);
		}

		// debug
		this.ctx.strokeStyle = "#fff";
		line(oX, 0, oX, t);
		line(0, oY, t, oY);

		// this.ctx.fillStyle = "#f00";
		// this.ctx.strokeStyle = "#000";
		// this.ctx.fillRect(0, 0, 1e4, 1e4);
	}
};
