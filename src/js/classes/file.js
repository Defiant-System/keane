
class File {
	constructor(options) {
		let opt = {
			name: "Untitled",
			scale: 1,
			width: 1,
			height: 1,
			...options
		};
		// set name from file path
		if (opt.path && !options.name) {
			opt.name = opt.path.slice(opt.path.lastIndexOf("/") + 1);
		}
		// file path + name
		this.path = opt.path;
		this.name = opt.name;
		this._id = opt._id;

		// undo history
		this.history = new window.History;
		// layers stack
		this.layers = [{ type: "bg-checkers" }];

		// canvases
		let { cvs, ctx } = Misc.createCanvas(opt.width, opt.height);
		this.cvs = cvs;
		this.ctx = ctx;

		// defaults
		this.scale = opt.scale;
		this.showRulers = true;
		this.bgColor = "#000"
		this.fgColor = "#fff"
		this.lineWidth = 1;

		// this is for "online" images; jpg, png, gif
		if (opt.path) {
			this.loadImage(opt.path);
		} else {
			// new layer with image
			let layer = new Layer({ file: this, fill: opt.fill, width: opt.width, height: opt.height });
			this.layers.push(layer);
			// initiate canvas
			this.dispatch({ type: "set-canvas", w: opt.width, h: opt.height, scale: this.scale });
		}
	}
	get activeLayer() {
		return this.layers[1];
	}
	loadImage(path) {
		let image = new Image;
		image.onload = () => {
			let width = image.width,
				height = image.height,
				layer = new Layer({ file: this, image, width, height });
			// new layer with image
			this.layers.push(layer);
			// temp
		//	this.layers.push(new Layer({ file: this, text: "Defiant", width, height }));
			// initiate canvas
			this.dispatch({ type: "set-canvas", w: image.width, h: image.height, scale: this.scale });
		};
		image.src = path;
	}
	render(noEmit) {
		// clear canvas
		this.cvs.prop({ width: this.oW, height: this.oH });

		// re-paints layers stack
		this.layers.map(layer => this.dispatch(layer, noEmit));

		Projector.render(noEmit);
	}
	dispatch(event) {
		let APP = photoshop,
			Proj = Projector,
			_round = Math.round,
			layer = event,
			el;
		//console.log(event);
		switch (event.type) {
			case "bg-checkers":
				this.ctx.fillStyle = Proj.checkers;
				this.ctx.fillRect(0, 0, this.oW, this.oH);
				break;
			case "layer":
				// event object is layer - render and add to file canvas
				layer.render();
				this.ctx.drawImage(layer.cvs[0], 0, 0);
				break;

			case "set-canvas":
				// original dimension
				this.oW = event.w;
				this.oH = event.h;
				this.cvs.prop({ width: this.oW, height: this.oH });
				// reset projector
				Proj.reset(this);

				if (!event.scale) {
					// default to first zoom level
					event.scale = .1;
					// iterate available zoom levels
					ZOOM.filter(z => z.level <= 100)
						.map(zoom => {
							let scale = zoom.level / 100;
							if (Proj.aW > event.w * scale && Proj.aH > event.h * scale) {
								event.scale = scale;
							}
						});
				}
				this.dispatch({ ...event, type: "set-scale", noRender: true });

				// render canvas
				this.render();
				break;
			case "set-scale":
				// scaled dimension
				this.scale = event.scale;
				this.w = this.oW * this.scale;
				this.h = this.oH * this.scale;
				// origo
				this.oX = _round(Proj.cX - (this.w / 2));
				this.oY = _round(Proj.cY - (this.h / 2));

				if (!event.noRender) {
					// render projector canvas
					Proj.render();
				}
				break;
			case "pan-canvas":
				this.oX = Number.isInteger(event.left) ? event.left :Proj.cX - (this.w / 2) + event.x;
				this.oY = Number.isInteger(event.top) ? event.top :Proj.cY - (this.h / 2) + event.y;
				// render projector canvas
				Proj.render();
				break;
			case "toggle-rulers":
				this.showRulers = event.checked === 1;
				// trigger re-calculations + re-paint
				Proj.reset(this);
				// update origo
				this.oX = _round(Proj.cX - (this.w / 2));
				this.oY = _round(Proj.cY - (this.h / 2));
				// render projector canvas
				Proj.render();

				APP.els.content.toggleClass("show-rulers", !this.showRulers);
				break;
		}
	}
}
