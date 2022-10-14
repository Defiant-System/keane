
let Mask = {
	ants: @import "./mask/ants.js",
	magicWand: @import "./mask/magicWand.js",
	init() {
		let { cvs, ctx } = Misc.createCanvas(1, 1);
		this.cvs = cvs;
		this.ctx = ctx;

		// temp
		setTimeout(() => {
			this.dispatch({ type: "select-rect", rect: { x: 100, y: 40, w: 180, h: 120 } });
			// this.dispatch({ type: "select-elliptic", rect: { x: 100, y: 50, w: 70, h: 70 } });
			// this.dispatch({ type: "select-polygon", points: [ 50, 50, 80, 40, 190, 70, 160, 170, 120, 120, 60, 110 ] });
			
			// window.find(`.tool[data-click="toggle-quick-mask"]`).trigger("click");
		}, 900);
	},
	dispatch(event) {
		let APP = keane,
			Proj = Projector,
			File = Proj.file,
			Self = Mask,
			el;
		switch (event.type) {
			case "toggle-quick-mask":
				console.log(event);
				break;

			case "select-rect":
				Self.cvs.prop({ width: File.width, height: File.height });
				Proj.swap.cvs.prop({ width: File.width, height: File.height });

				// this.ants.init(this);
				// this.ctx.clear();
				Self.ctx.fillRect(event.rect.x, event.rect.y, event.rect.w, event.rect.h);
				Self.ctx.fill();
				Self.ants.init(Self, true);
				break;
			case "select-elliptic":
				Self.cvs.prop({ width: File.width, height: File.height });
				Proj.swap.cvs.prop({ width: File.width, height: File.height });

				let eW = event.rect.w,
					eH = event.rect.h,
					eX = event.rect.x + eW,
					eY = event.rect.y + eH;
				Self.ctx.ellipse(eX, eY, eW, eH, 0, 0, Math.PI*2);
				Self.ctx.fill();
				Self.ants.init(Self, true);
				break;
			case "select-polygon":
				Self.cvs.prop({ width: File.width, height: File.height });
				Proj.swap.cvs.prop({ width: File.width, height: File.height });

				Self.ctx.beginPath();
				Self.ctx.moveTo(event.points.shift(), event.points.shift());
				while (event.points.length) {
					let x = event.points.shift(),
						y = event.points.shift();
					Self.ctx.lineTo(x, y);
				}
				Self.ctx.stroke();

				Self.ctx.fill();
				Self.ants.init(Self, true);
				break;
		}
	}
};
