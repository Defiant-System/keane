
const Rulers = {
	init() {
		let { cvs, ctx } = Canvas.createCanvas(1, 1);
		this.cvs = cvs;
		this.ctx = ctx;
		this.rT = 18;
		this.oX = this.rT;
		this.oY = 0;
	},
	render(Canvas) {
		let _max = Math.max,
			_min = Math.min,
			_abs = Math.abs,
			scale = Canvas.scale,
			rG = ZOOM.find(z => z.level === scale * 100).rG,
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

		this.ctx.lineWidth = 1;
		this.ctx.fillStyle = "#112222e5";
		this.ctx.strokeStyle = "#0000009e";

		let rT = this.rT,
			rW = this.rW * 1.5,
			rH = this.rH * 1.5,
			coX = Canvas.oX - Canvas.aX + rT,
			coY = Canvas.oY - Canvas.aY + rT,
			oX = coX,
			oY = coY

		this.oX = oX - 1;
		this.oY = oY - 1;

		// ruler bg's
		this.ctx.fillRect(0, 0, rW, rT);
		this.ctx.fillRect(0, rT, rT, rH);
		// top ruler bottom line
		line(0, rT, rW, rT);
		// left ruler right line
		line(rT, 0, rT, rH);


		this.ctx.strokeStyle = "#444";

		// top ruler
		let xG = rG[0] * scale,
			xl = rW,
			x = rT + 1;
		for (x; x<xl; x+=xG) {
			let lX = x ;
			line(lX, 0, lX, rT);
		}


		this.ctx.strokeStyle = "#fff";
		line(oX, 0, oX, rT);
		line(0, oY, rT, oY);

		// debug
		// this.ctx.fillStyle = "#f00";
		// this.ctx.strokeStyle = "#000";
		// this.ctx.fillRect(0, 0, 1e4, 1e4);
	}
};
