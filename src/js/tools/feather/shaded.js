
class Shaded {
	constructor(opt={}) {
		this.cvs = opt.cvs;
		this.ctx = opt.ctx;

		this.size = opt.size || 1;
		this.pressure = opt.pressure || 1e2;

		let rgba = ColorLib.hexToRgb(opt.fgColor);
		rgba.a = this.pressure / 1e5;
		
		this.rgba = rgba;
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

		this.points.map(p => {
			let dx = p[0] - this.points[this.count][0],
				dy = p[1] - this.points[this.count][1],
				d = dx * dx + dy * dy,
				rgba = this.rgba;

			if (d < 1e3) {
				rgba.a = (1 - (d / 1e3)) * 0.001 * this.pressure;
				this.ctx.strokeStyle = `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`;

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
