
class Canvas {
	constructor(path) {
		// undo history
		this.history = new window.History;
		// layers stack
		this.layers = [];
		// defaults
		this.showRulers = true;
		this.bgColor = "#000"
		this.fgColor = "#fff"
		this.lineWidth = 1;

		// canvases
		let { cvs, ctx } = Misc.createCanvas(1, 1);
		this.cvs = cvs;
		this.ctx = ctx;
	}
	translatePoints(p) {
		let _round = Math.round,
			_max = Math.max,
			_min = Math.min,
			scale = this.scale,
			oX = this.oX,
			oY = this.oY,
			w = this.oW,
			h = this.oH,
			point = {};

		Object.keys(p).map(k => {
			switch (k) {
				case "x": point.x = _min(_max(_round((p.x - oX) / scale), 0), w); break;
				case "y": point.y = _min(_max(_round((p.y - oY) / scale), 0), h); break;
				default: point[k] = _round(p[k] / scale);
			}
		});

		return point;
	}
	render() {
		// re-paints paint stack
		//this.stack.map(item => this.dispatch(item));
	}
	dispatch(event) {
		let APP = photoshop,
			_navigator = APP.box.navigator,
			_rulers = Rulers,
			_abs = Math.abs,
			_max = Math.max,
			_min = Math.min,
			_round = Math.round,
			pi2 = Math.PI * 2,
			x, y, w, h,
			data = {},
			el;

		// save paint context
		this.osCtx.save();

		// restore paint context
		this.osCtx.restore();
	}
}
