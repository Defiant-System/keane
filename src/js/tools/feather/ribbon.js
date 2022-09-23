
class Ribbon {
	constructor(opt={}) {
		this.mX = opt.width >> 1;
		this.mY = opt.height >> 1;
		this.cvs = opt.cvs;
		this.ctx = opt.ctx;

		this.size = opt.size || 1;
		this.pressure = opt.pressure || .125;
		
		this.fgColor = Color.hexToRgb(opt.fgColor);
		this.fgColor[3] = this.pressure;

		this.ctx.lineWidth = this.size;
		this.ctx.strokeStyle = `rgba(${this.fgColor.join(",")})`;
		this.ctx.globalCompositeOperation = opt.globalCompositeOperation || "source-over";

		this.painters = [...Array(30)].map((e, i) => ({
			dx: this.mX,
			dy: this.mY,
			ax: 0,
			ay: 0,
			div: 0.1,
			ease: Math.random() * 0.2 + 0.6
		}));
	}

	update() {
		this.painters.map(p => {
			this.ctx.beginPath();
			this.ctx.moveTo(p.dx, p.dy);
			p.dx -= p.ax = (p.ax + (p.dx - this.mX) * p.div) * p.ease;
			p.dy -= p.ay = (p.ay + (p.dy - this.mY) * p.div) * p.ease;
			this.ctx.lineTo(p.dx, p.dy);
			this.ctx.stroke();
		});
	}

	strokeStart(mX, mY) {
		this.mX = mX;
		this.mY = mY;
		this.painters.map(p => {
			p.dx = mX;
			p.dy = mY;
		});
		this.update();
	}

	stroke(mX, mY) {
		this.mX = mX;
		this.mY = mY;
		this.update();
	}

	strokeEnd() {
		
	}
}
