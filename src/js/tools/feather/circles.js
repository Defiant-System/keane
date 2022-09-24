
class Circles {
	constructor(opt={}) {
		this.cvs = opt.cvs;
		this.ctx = opt.ctx;

		this.size = opt.size || 1;
		this.pressure = opt.pressure || 1e2;

		this.fgColor = Color.hexToRgb(opt.fgColor);
		this.fgColor[3] = this.pressure / 1e3;

		this.ctx.lineWidth = this.size;
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
			d = Math.sqrt(dx * dx + dy * dy) * 2,
			cx = Math.floor(mX / 1e2) * 1e2 + 50,
			cy = Math.floor(mY / 1e2) * 1e2 + 50,
			steps = Math.floor(Math.random() * 10),
			step_delta = d / steps,
			pi2 = Math.PI * 2,
			i = 0;

		for (; i<steps; i++) {
			this.ctx.beginPath();
			this.ctx.arc( cx, cy, (steps - i) * step_delta, 0, pi2, true);
			this.ctx.stroke();
		}

		this.mX = mX;
		this.mY = mY;
	}

	strokeEnd() {
		
	}
}
