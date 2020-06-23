
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
			_abs = Math.abs,
			scale = Canvas.scale,
			rG = ZOOM.find(z => z.level === scale * 100).rG,
			rT = this.rT,
			line = (p1x, p1y, p2x, p2y) => {
				this.ctx.beginPath();
				this.ctx.moveTo(p1x, p1y);
				this.ctx.lineTo(p2x, p2y);
				this.ctx.stroke();
			};

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
		this.ctx.fillRect(0, 0, this.rW, rT);
		this.ctx.fillRect(0, rT, rT, this.rH - rT);
		// top ruler bottom line
		line(0, rT, this.rW, rT);
		// left ruler right line
		line(rT, 0, rT, this.rH);

		this.ctx.textAlign = "left";
		this.ctx.fillStyle = "#666";
		this.ctx.font = `9px Arial`;
		this.ctx.strokeStyle = "#444";

		// top ruler
		let oX = Canvas.oX - rT - 6,
			xG = rG[0] * scale,
			xl = this.rW,
			xO = rT + 1,
			x;
		// ruler numbers
		for (x=0; x<xl; x+=xG) {
			let lX = x + xO - oX;
			if (lX < rT) continue;
			this.ctx.fillText(_abs((x / scale) - 250), lX + 2, 9);
		}
		for (x=0; x<xl; x+=xG) {
			let lX = x + xO - oX;
			if (lX < rT) continue;
			line(lX, 0, lX, rT);
		}
		xG = rG[1] * scale;
		if (xG) for (x=0; x<xl; x+=xG) {
			let lX = x + xO - oX;
			if (lX < rT) continue;
			line(lX, 12, lX, rT);
		}
		xG = rG[2] * scale;
		if (xG) for (x=0; x<xl; x+=xG) {
			let lX = x + xO - oX;
			if (lX < rT) continue;
			line(lX, 15, lX, rT);
		}

		// left ruler
		let oY = Canvas.oY - 2,
			yG = rG[0] * scale,
			yl = this.rH + oY,
			yO = rT + 1,
			y;
		// ruler numbers
		for (y=0; y<yl; y+=yG) {
			let lY = y + yO - oY,
				txt = _abs((y / scale) - 400).toString().split("");
			if (lY < rT) continue;
			txt.map((c, i) => this.ctx.fillText(c, 4, lY + 9 + (i * 9)));
		}
		for (y=0; y<yl; y+=yG) {
			let lY = y + yO - oY;
			if (lY < rT) continue;
			line(0, lY, rT, lY);
		}
		yG = rG[1] * scale;
		if (yG) for (y=0; y<yl; y+=yG) {
			let lY = y + yO - oY;
			if (lY < rT) continue;
			line(12, lY, rT, lY);
		}
		yG = rG[2] * scale;
		if (yG) for (y=0; y<yl; y+=yG) {
			let lY = y + yO - oY;
			if (lY < rT) continue;
			line(15, lY, rT, lY);
		}
	}
};
