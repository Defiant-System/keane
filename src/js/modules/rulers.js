
const Rulers = {
	init() {
		let { cvs, ctx } = Canvas.createCanvas(1, 1);
		this.cvs = cvs;
		this.ctx = ctx;
		this.rT = 18;
	},
	render(Canvas) {
		let _max = Math.max,
			_min = Math.min,
			scale = Canvas.scale,
			rG = ZOOM.find(z => z.level === scale * 100).rG;

		this.rW = _max(Canvas.w, window.width) + Canvas.aX + 1;
		this.rH = _max(Canvas.h, window.height) + Canvas.aY + 1;
		// reset/resize canvas
		this.cvs.prop({ width: this.rW, height: this.rH });
		this.ctx.translate(-.5, -.5);

		// debug
		// this.ctx.fillStyle = "#f00";
		// this.ctx.strokeStyle = "#000";
		// this.ctx.fillRect(0, 0, 1e4, 1e4);

		this.ctx.lineWidth = 1;
		this.ctx.fillStyle = "#112222e5";
		this.ctx.strokeStyle = "#0000009e";

		// ruler bg's
		this.ctx.fillRect(0, 0, this.rW, this.rT);
		this.ctx.fillRect(0, this.rT, this.rT, this.rH - this.rT);
		// top ruler bottom line
		this.ctx.beginPath();
		this.ctx.moveTo(0, this.rT);
		this.ctx.lineTo(this.rW, this.rT);
		this.ctx.stroke();
		// left ruler right line
		this.ctx.beginPath();
		this.ctx.moveTo(this.rT, 0);
		this.ctx.lineTo(this.rT, this.rH);
		this.ctx.stroke();

		this.ctx.textAlign = "left";
		this.ctx.fillStyle = "#666";
		this.ctx.font = `9px Arial`;
		this.ctx.strokeStyle = "#444";

		// top ruler
		let xG = rG[0] * scale,
			xl = this.rW,
			xO = this.rT + 1,
			oX = Canvas.oX - xO + 1,
			x;
		for (x=0; x<xl; x+=xG) {
			this.ctx.beginPath();
			this.ctx.moveTo(x + xO, 0);
			this.ctx.lineTo(x + xO, this.rT);
			this.ctx.stroke();
			// ruler numbers
			this.ctx.fillText(x / scale, x + xO + 2, 9);
		}
		xG = rG[1] * scale;
		if (xG) for (x=0; x<xl; x+=xG) {
			this.ctx.beginPath();
			this.ctx.moveTo(x + xO, 12);
			this.ctx.lineTo(x + xO, this.rT);
			this.ctx.stroke();
		}
		xG = rG[2] * scale;
		if (xG) for (x=0; x<xl; x+=xG) {
			this.ctx.beginPath();
			this.ctx.moveTo(x + xO, 15);
			this.ctx.lineTo(x + xO, this.rT);
			this.ctx.stroke();
		}

		// left ruler
		let yG = rG[0] * scale,
			yl = this.rH,
			yO = this.rT + 1,
			oY = Canvas.oY - yO + 1,
			y;
		for (y=0; y<yl; y+=yG) {
			this.ctx.beginPath();
			this.ctx.moveTo(0      , y + yO);
			this.ctx.lineTo(this.rT, y + yO);
			this.ctx.stroke();
			// ruler numbers
			let txt = (y / scale).toString().split("");
			txt.map((c, i) => this.ctx.fillText(c, 4, y + yO + 9 + (i * 9)));
		}
		yG = rG[1] * scale;
		if (yG) for (y=0; y<yl; y+=yG) {
			this.ctx.beginPath();
			this.ctx.moveTo(12,      y + yO);
			this.ctx.lineTo(this.rT, y + yO);
			this.ctx.stroke();
		}
		yG = rG[2] * scale;
		if (yG) for (y=0; y<yl; y+=yG) {
			this.ctx.beginPath();
			this.ctx.moveTo(15,      y + yO);
			this.ctx.lineTo(this.rT, y + yO);
			this.ctx.stroke();
		}
	}
};
