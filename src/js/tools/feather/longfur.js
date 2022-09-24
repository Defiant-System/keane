
class Longfur {
	constructor(opt={}) {
		this.cvs = opt.cvs;
		this.ctx = opt.ctx;

		this.size = opt.size || 1;
		this.pressure = opt.pressure || .1;

		this.fgColor = Color.hexToRgb(opt.fgColor);
		this.fgColor[3] = this.pressure * .5;
		
		this.ctx.lineWidth = this.size;
		this.ctx.strokeStyle = `rgba(${this.fgColor.join(",")})`;
		this.ctx.globalCompositeOperation = opt.globalCompositeOperation || "source-over";

		this.points = [];
		this.count = 0;
	}

	strokeStart(mX, mY) {
		
	}

	stroke(mX, mY) {
		this.points.push([ mX, mY ]);
		
		this.points.map(p => {
			let size = -Math.random();
			let dx = p[0] - this.points[this.count][0];
			let dy = p[1] - this.points[this.count][1];
			let d = dx * dx + dy * dy;

			if (d < 4000 && Math.random() > d / 4000) {
				this.ctx.beginPath();
				this.ctx.moveTo(this.points[this.count][0] + (dx * size), this.points[this.count][1] + (dy * size));
				this.ctx.lineTo(p[0] - (dx * size) + Math.random() * 2, p[1] - (dy * size) + Math.random() * 2);
				this.ctx.stroke();
			}
		});

		this.count ++;
	}

	strokeEnd() {
		
	}
}
