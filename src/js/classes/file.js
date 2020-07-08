
class File {
	constructor(options) {
		let opt = {
			name: "Untitled",
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

		// undo history
		this.history = new window.History;
		// layers stack
		this.layers = [{ type: "set-contents", fill: "transparent" }];

		// canvases
		let { cvs, ctx } = Misc.createCanvas(opt.width, opt.height);
		this.cvs = cvs;
		this.ctx = ctx;

		// defaults
		this.scale = 1;
		this.showRulers = true;
		this.bgColor = "#000"
		this.fgColor = "#fff"
		this.lineWidth = 1;

		// this is for "online" images; jpg, png, gif
		if (opt.path) {
			this.loadImage(opt.path);
		} else {
			// initiate canvas
			this.dispatch({ type: "set-canvas", w: opt.width, h: opt.height });
		}
	}
	loadImage(path) {
		let image = new Image;
		image.onload = () => {
			let width = image.width,
				height = image.height,
				layer = new Layer({ image, width, height });
			// new layer with image
			this.layers.push(layer);
			// initiate canvas
			this.dispatch({ type: "set-canvas", w: image.width, h: image.height });
		};
		image.src = path;
	}
	render() {
		// re-paints layers stack
		this.layers.map(layer => this.dispatch(layer));

		Projector.render(this);
	}
	dispatch(event) {
		let APP = photoshop,
			_round = Math.round,
			layer = event,
			el;

		// save paint context
		this.ctx.save();

		//console.log(event);
		switch (event.type) {
			case "set-canvas":
				// reset projector
				Projector.reset();

				// original dimension
				this.oW = event.w;
				this.oH = event.h;
				this.cvs.prop({ width: this.oW, height: this.oH });

				if (!event.scale) {
					// default to first zoom level
					event.scale = .1;
					// iterate available zoom levels
					ZOOM.filter(z => z.level <= 100)
						.map(zoom => {
							let scale = zoom.level / 100;
							if (Projector.aW > event.w * scale && Projector.aH > event.h * scale) {
								event.scale = scale;
							}
						});
				}
				this.dispatch({ ...event, type: "set-scale" });

				// render canvas
				this.render();
				break;
			case "set-scale":
				// scaled dimension
				this.scale = event.scale;
				this.w = this.oW * this.scale;
				this.h = this.oH * this.scale;
				// origo
				this.oX = _round(Projector.cX - (this.w / 2));
				this.oY = _round(Projector.cY - (this.h / 2));
				break;
			case "toggle-rulers":
				this.showRulers = event.checked === 1;
				// trigger re-calculations + re-paint
				Projector.reset();
				// update origo
				this.oX = _round(Projector.cX - (this.w / 2));
				this.oY = _round(Projector.cY - (this.h / 2));
				// re-render
				this.render();

				APP.els.content.toggleClass("show-rulers", !this.showRulers);
				break;
			case "set-contents":
				this.ctx.fillStyle = event.fill === "transparent" ? Projector.checkers : event.fill;
				this.ctx.fillRect(0, 0, this.oW, this.oH);
				break;
			case "layer":
				// event object is layer - render and add to file canvas
				layer.render();
				this.ctx.drawImage(layer.cvs[0], 0, 0);
				break;
		}

		// restore paint context
		this.ctx.restore();
	}
}
