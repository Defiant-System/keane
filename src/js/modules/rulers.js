
const Rulers = {
	init() {
		let { cvs, ctx } = Canvas.createCanvas(1, 1);
		this.cvs = cvs;
		this.ctx = ctx;
		this.t = 18;  // ruler thickness
		this.oX = this.t;
		this.oY = 0;
	},
	render(Canvas) {
		let _abs = Math.abs,
			_round = Math.round,
			ctx = Canvas.ctx,
			g,
			p = .5,
			t = this.t,
			scale = Canvas.scale,
			aW = Canvas.aW, aH = Canvas.aH,
			aX = Canvas.aX, aY = Canvas.aY,
			oX = Canvas.oX, oY = Canvas.oY,
			w = aW + p,
			h = aH + p + t + t,
			rG = ZOOM.find(z => z.level === scale * 100).rG,
			sX = oX - aX + t,
			sY = oY - aY + t,
			eX = aW - oX + aX + sX,
			eY = aH - oY + aY + sY + t,
			line = (p1x, p1y, p2x, p2y) => {
				ctx.beginPath();
				ctx.moveTo(p1x, p1y);
				ctx.lineTo(p2x, p2y);
				ctx.stroke();
			};

		while (sX > 0) sX -= rG[0] * scale;
		while (sY > 0) sY -= rG[0] * scale;
		//console.log(sX, eX);

		ctx.save();
		// ruler bg & style
		ctx.lineWidth = 1;
		ctx.fillStyle = "#112222e5";
		ctx.strokeStyle = "#0000009e";
		ctx.translate(aX - t - p, aY - t - p);

		ctx.fillRect(0, 0, w, t);
		ctx.fillRect(0, t, t, h - t);
		line(0, t, w, t);  // top ruler bottom line
		line(t, 0, t, h);  // left ruler right line

		// ruler fg & style
		ctx.strokeStyle = "#444";
		ctx.textAlign = "left";
		ctx.fillStyle = "#666";
		ctx.font = `9px Arial`;

		// top ruler
		for (x=sX, g=rG[0]*scale; x<eX; x+=g) if (x >= t) line(x + 1, 0,  x + 1, t);
		for (x=sX, g=rG[1]*scale; x<eX; x+=g) if (x >= t) line(x + 1, 12, x + 1, t);
		for (x=sX, g=rG[2]*scale; x<eX; x+=g) if (x >= t) line(x + 1, 15, x + 1, t);
		// numbers
		for (x=sX, g=rG[0]*scale; x<eX; x+=g) {
			if (x <= t - 4)  continue;
			let nr = _round(_abs(x - oX) / scale);
			ctx.fillText(nr, x + 3, 9);
		}

		// left ruler
		for (y=sY, g=rG[0]*scale; y<eY; y+=g) if (y >= t) line(0,  y + 1, t, y + 1);
		for (y=sY, g=rG[1]*scale; y<eY; y+=g) if (y >= t) line(12, y + 1, t, y + 1);
		for (y=sY, g=rG[2]*scale; y<eY; y+=g) if (y >= t) line(15, y + 1, t, y + 1);
		// numbers
		for (y=sY, g=rG[0]*scale; y<eY; y+=g) {
			if (y <= t - 4)  continue;
			let nr = _round(_abs(y - oY - t + aY) / scale);
			nr.toString().split("").map((c, i) => ctx.fillText(c, 4, y + 1 + ((i + 1) * 9)));
		}

		ctx.restore();
	}
};
