
class Squares {
	constructor(opt={}) {
		this.cvs = opt.cvs;
		this.ctx = opt.ctx;

		this.size = opt.size || 1;
		this.pressure = opt.pressure || 1;

		this.fgColor = Color.hexToRgb(opt.bgColor);
		this.fgColor[3] = this.pressure * .5;
		this.bgColor = Color.hexToRgb(opt.fgColor);
		this.bgColor[3] = this.pressure;

		this.ctx.lineWidth = this.size;
		this.ctx.fillStyle = `rgba(${this.bgColor.join(",")})`;
		this.ctx.strokeStyle = `rgba(${this.fgColor.join(",")})`;
		this.ctx.globalCompositeOperation = opt.globalCompositeOperation || "source-over";
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
