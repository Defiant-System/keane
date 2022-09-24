
class Grid {
	constructor(opt={}) {
		this.cvs = opt.cvs;
		this.ctx = opt.ctx;

		this.size = opt.size || 1;
		this.pressure = opt.pressure || 1e2;

		this.fgColor = Color.hexToRgb(opt.fgColor);
		this.fgColor[3] = this.pressure / 7e3;
		
		this.ctx.lineWidth = this.size;
		this.ctx.strokeStyle = `rgba(${this.fgColor.join(",")})`;
		this.ctx.globalCompositeOperation = opt.globalCompositeOperation || "source-over";
	}

	strokeStart(mX, mY) {
		
	}

	stroke(mX, mY) {
		let cx = Math.round(mX / 100) * 100,
			cy = Math.round(mY / 100) * 100,
			dx = (cx - mX) * 10,
			dy = (cy - mY) * 10,
			i = 0;
		
		for (; i<50; i++) {
			this.ctx.beginPath();
			this.ctx.moveTo(cx, cy);
			this.ctx.quadraticCurveTo(mX + Math.random() * dx, mY + Math.random() * dy, cx, cy);
			this.ctx.stroke();
		}
	}

	strokeEnd() {
		
	}
}
