
class Fur {
	constructor(opt={}) {
		this.cvs = opt.cvs;
		this.ctx = opt.ctx;

		this.size = opt.size || 1;
		this.pressure = opt.pressure || 1e2;

		let rgba = ColorLib.hexToRgb(opt.fgColor);
		rgba.a = this.pressure / 1e3;
		
		this.ctx.lineWidth = this.size;
		this.ctx.strokeStyle = `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`;
		this.ctx.globalCompositeOperation = opt.blend || "source-over";

		this.points = [];
		this.count = 0;
	}

	strokeStart(mX, mY) {
		this.mX = mX;
		this.mY = mY;
	}

	stroke(mX, mY) {
		this.points.push([mX, mY]);

		this.ctx.beginPath();
		this.ctx.moveTo(this.mX, this.mY);
		this.ctx.lineTo(mX, mY);
		this.ctx.stroke();

		this.points.map(p => {
			let dx = p[0] - this.points[this.count][0],
				dy = p[1] - this.points[this.count][1],
				d = dx * dx + dy * dy;

			if (d < 4e3 && Math.random() > d / 2e3) {
				this.ctx.beginPath();
				this.ctx.moveTo(mX + (dx * .5), mY + (dy * .5));
				this.ctx.lineTo(mX - (dx * .5), mY - (dy * .5));
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
