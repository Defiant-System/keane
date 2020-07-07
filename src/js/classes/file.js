
class File {
	constructor(path) {
		// file path + name
		this.path = path;
		this.name = path.slice(path.lastIndexOf("/") + 1);
		// undo history
		this.history = new window.History;
		// layers stack
		this.layers = [];
		// canvases
		let { cvs, ctx } = Misc.createCanvas(1, 1);
		this.cvs = cvs;
		this.ctx = ctx;
		// defaults
		this.scale = 1;
		this.showRulers = true;
		this.bgColor = "#000"
		this.fgColor = "#fff"
		this.lineWidth = 1;

		//this.dispatch({ type: "load-image", path });
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
			image,
			el;

		// save paint context
		this.ctx.save();

		console.log(event);
		switch (event.type) {
			case "enter-quick-mask":
				break;
			case "set-scale":
				// scaled dimension
				this.scale = event.scale;
				this.w = this.oW * this.scale;
				this.h = this.oH * this.scale;
				// origo
				this.oX = _round(this.cX - (this.w / 2));
				this.oY = _round(this.cY - (this.h / 2));

				// reset canvas
				if (!event.noReset) this.render();
				break;
		}

		// restore paint context
		this.ctx.restore();
	}
}
