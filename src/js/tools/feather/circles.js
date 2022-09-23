
class Circles {
	constructor(opt={}) {
		this.mX = opt.width >> 1;
		this.mY = opt.height >> 1;
		this.cvs = opt.cvs;
		this.ctx = opt.ctx;

		this.size = opt.size || 1;
		this.pressure = opt.pressure || 1;

		this.fgColor = Color.hexToRgb(opt.fgColor);
		this.fgColor[3] = this.pressure * .1;

		this.ctx.lineWidth = this.size;
		this.ctx.strokeStyle = `rgba(${this.fgColor.join(",")})`;
		this.ctx.globalCompositeOperation = opt.globalCompositeOperation || "source-over";
	}

	strokeStart(mX, mY) {
		this.mX = mX;
		this.mY = mY;
	}

	stroke(mX, mY) {
		let dx = mX - this.mX;
		let dy = mY - this.mY;
		let d = Math.sqrt(dx * dx + dy * dy) * 2;
		
		let cx = Math.floor(mX / 100) * 100 + 50;
		let cy = Math.floor(mY / 100) * 100 + 50;
		
		let steps = Math.floor( Math.random() * 10 );
		let step_delta = d / steps;

		for (let i = 0; i < steps; i++) {
			this.ctx.beginPath();
			this.ctx.arc( cx, cy, (steps - i) * step_delta, 0, Math.PI*2, true);
			this.ctx.stroke();
		}

		this.mX = mX;
		this.mY = mY;
	}

	strokeEnd() {
		
	}
}
