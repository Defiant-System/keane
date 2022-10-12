
const Rulers = {
	t: 18, // ruler thickness
	init() {
		// fast references
		this.els = {
			rgTop: window.find(".ruler-guides .top-over"),
			rgLeft: window.find(".ruler-guides .left-over"),
			rgCorner: window.find(".ruler-guides .corner-over"),
		};

		console.log(123);
	},
	render(Proj) {
		let _abs = Math.abs,
			_round = Math.round,
			g, x, y,
			p = .5,
			t = this.t,
			ctx = Proj.ctx,
			scale = Proj.file.scale,
			aX = Proj.aX,
			aY = Proj.aY,
			aW = Proj.aW,
			aH = Proj.aH,
			oX = Proj.file.oX,
			oY = Proj.file.oY,
			rG = ZOOM.find(z => z.level === scale * 100).rG,
			w = aW + 1,
			h = aH + t + t + 1,
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

		// handles if image is smaller than canvas
		while (sX > 0) sX -= rG[0] * scale;
		while (sY > 0) sY -= rG[0] * scale;

		ctx.save();
		// ruler bg & style
		ctx.lineWidth = 1;
		ctx.fillStyle = "#112222e5";
		ctx.strokeStyle = "#0000009e";
		ctx.translate(aX - t - p, aY - t - p);
		// bg
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
		for (x=sX, g=rG[0]*scale || 1e9; x<eX; x+=g) if (x >= t) line(x + 1, 0,  x + 1, t);
		for (x=sX, g=rG[1]*scale || 1e9; x<eX; x+=g) if (x >= t) line(x + 1, 12, x + 1, t);
		for (x=sX, g=rG[2]*scale || 1e9; x<eX; x+=g) if (x >= t) line(x + 1, 15, x + 1, t);
		// numbers
		for (x=sX, g=rG[0]*scale || 1e9; x<eX; x+=g) {
			if (x <= t - 4)  continue;
			let nr = _round(_abs(x - oX) / scale);
			ctx.fillText(nr, x + 3, 9);
		}
		// left ruler
		for (y=sY, g=rG[0]*scale || 1e9; y<eY; y+=g) if (y >= t) line(0,  y + 1, t, y + 1);
		for (y=sY, g=rG[1]*scale || 1e9; y<eY; y+=g) if (y >= t) line(12, y + 1, t, y + 1);
		for (y=sY, g=rG[2]*scale || 1e9; y<eY; y+=g) if (y >= t) line(15, y + 1, t, y + 1);
		// numbers
		for (y=sY, g=rG[0]*scale || 1e9; y<eY; y+=g) {
			if (y <= t - 4)  continue;
			let nr = _round(_abs(y - oY - t + aY) / scale);
			nr.toString().split("").map((c, i) => ctx.fillText(c, 4, y + 1 + ((i + 1) * 9)));
		}
		ctx.restore();
	},
	drawGuides(Proj) {
		let ctx = Proj.ctx,
			File = Proj.file,
			Guides = File.rulers.guides,
			aX = Proj.aX,
			aY = Proj.aY,
			aW = Proj.aX + Proj.aW,
			aH = Proj.aY + Proj.aH + Rulers.t,
			hori = Guides.horizontal,
			vert = Guides.vertical;

		ctx.save();
		ctx.translate(.5, .5);
		ctx.strokeStyle = Pref.guides.color;
		ctx.lineWidth = 1;
		// vertical guides
		vert.map(x => {
			let gX = File.oX + x;
			ctx.beginPath();
			ctx.moveTo(gX, aY);
			ctx.lineTo(gX, aH);
			ctx.stroke();
		});
		// horisontal guides
		hori.map(y => {
			let gY = File.oY + y;
			ctx.beginPath();
			ctx.moveTo(aX, gY);
			ctx.lineTo(aW, gY);
			ctx.stroke();
		});
		ctx.restore();
	}
};
