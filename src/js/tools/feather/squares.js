
class Squares {
	constructor(opt={}) {
		this.cvs = opt.cvs;
		this.ctx = opt.ctx;

		this.size = opt.size || 1;
		this.pressure = (opt.pressure || 1e2) / 1e2;

		this.fgColor = ColorLib.hexToRgb(opt.bgColor);
		this.fgColor.a = this.pressure;
		this.bgColor = ColorLib.hexToRgb(opt.fgColor);
		this.bgColor.a = this.pressure;

		this.ctx.lineWidth = this.size;
		this.ctx.fillStyle = `rgba(${this.bgColor.r},${this.bgColor.g},${this.bgColor.b},${this.bgColor.a})`;
		this.ctx.strokeStyle = `rgba(${this.fgColor.r},${this.fgColor.g},${this.fgColor.b},${this.fgColor.a})`;
		this.ctx.globalCompositeOperation = opt.blend || "source-over";
	}

	strokeStart(mX, mY) {
		this.mX = mX;
		this.mY = mY;
	}

	stroke(mX, mY) {
		let dx = mX - this.mX,
			dy = mY - this.mY,
			angle = 1.57079633,
			px = Math.cos(angle) * dx - Math.sin(angle) * dy,
			py = Math.sin(angle) * dx + Math.cos(angle) * dy;

		this.ctx.beginPath();
		this.ctx.moveTo(this.mX - px, this.mY - py);
		this.ctx.lineTo(this.mX + px, this.mY + py);
		this.ctx.lineTo(mX + px, mY + py);
		this.ctx.lineTo(mX - px, mY - py);
		this.ctx.lineTo(this.mX - px, this.mY - py);
		this.ctx.fill();
		this.ctx.stroke();

		this.mX = mX;
		this.mY = mY;
	}

	strokeEnd() {
		
	}
}
