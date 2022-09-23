
class Web {
	constructor(opt={}) {
		this.mX = opt.width >> 1;
		this.mY = opt.height >> 1;
		this.cvs = opt.cvs;
		this.ctx = opt.ctx;

		this.size = opt.size || 1;
		this.pressure = opt.pressure || 1;

		this.fgColor = Color.hexToRgb(opt.bgColor);
		this.fgColor[3] = this.pressure;
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
		
	}

	strokeEnd() {
		
	}
}
