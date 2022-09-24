
class Web {
	constructor(opt={}) {
		this.cvs = opt.cvs;
		this.ctx = opt.ctx;
		this.size = opt.size || 1;
		this.pressure = opt.pressure || 1;
		this.fgColor = Color.hexToRgb(opt.fgColor);
		
		this.ctx.lineWidth = this.size;
		this.ctx.globalCompositeOperation = opt.globalCompositeOperation || "source-over";

		this.points = [];
		this.count = 0;
	}

	strokeStart(mX, mY) {
		this.mX = mX;
		this.mY = mY;
	}

	stroke(mX, mY) {
		this.points.push([mX, mY]);

		this.fgColor[3] = this.pressure * .5;
		this.ctx.strokeStyle = `rgba(${this.fgColor.join(",")})`;
		this.ctx.beginPath();
		this.ctx.moveTo(this.mX, this.mY);
		this.ctx.lineTo(mX, mY);
		this.ctx.stroke();

		this.fgColor[3] = this.pressure * .1;
		this.ctx.strokeStyle = `rgba(${this.fgColor.join(",")})`;
		this.points.map(p => {
			let dx = p[0] - this.points[this.count][0],
				dy = p[1] - this.points[this.count][1],
				d = dx * dx + dy * dy;
			if (d < 2500 && Math.random() > 0.9) {
				this.ctx.beginPath();
				this.ctx.moveTo(this.points[this.count][0], this.points[this.count][1]);
				this.ctx.lineTo(p[0], p[1]);
				this.ctx.stroke();
			}
		});

		this.mX = mX;
		this.mY = mY;
		this.count++;
	}

	strokeEnd() {
		
	}
}
