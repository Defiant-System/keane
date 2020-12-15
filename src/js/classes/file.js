
class File {
	constructor(file) {
		// save reference to original FS file
		this.file = file;

		// defaults
		this.scale = 1;
		this.width = 600;
		this.height = 400;
		this.bgColor = "#000";
		this.fgColor = "#fff";
		this.lineWidth = 1;
		this.showRulers = true;

		// file canvas
		let { cvs, ctx } = Misc.createCanvas(this.width, this.height);
		this.cvs = cvs;
		this.ctx = ctx;

		// undo history
		this.history = new window.History;

		// layers stack
		this.layers = [{ type: "bg-checkers", _ready: true }];

		// handle file types
		switch (file.kind) {
			case "jpg":
			case "jpeg":
				// let content = { type: "fill", color: "#fff" };
				let content = { type: "image", blob: file.blob };
				this.layers.push( new Layer(this, content) );
				break;
			case "gif":
				break;
			case "png":
				break;
			case "psd":
				break;
		}

		// initiate canvas
		this.dispatch({ type: "set-canvas", width: this.width, height: this.height, scale1: 4 });

		// render file
		this.render();
	}

	render(noEmit) {
		// don't render if layers are not ready
		if (this.layers.filter(layer => !layer._ready).length > 0) return;

		// clear canvas
		this.cvs.prop({ width: this.oW, height: this.oH });

		// re-paints layers stack
		this.layers.map(layer => {
			switch (layer.type) {
				case "bg-checkers":
					this.ctx.fillStyle = Projector.checkers;
					this.ctx.fillRect(0, 0, this.oW, this.oH);
					break;
				case "layer":
					// event object is layer - add to file canvas
					this.ctx.drawImage(layer.cvs[0], 0, 0);
					break;
			}
		});

		// render projector
		Projector.render(noEmit);
	}

	dispatch(event) {
		let APP = photoshop,
			Proj = Projector,
			el;
		//console.log(event);
		switch (event.type) {
			case "set-canvas":
				// original dimension
				this.oW = event.width;
				this.oH = event.height;
				this.cvs.prop({ width: this.oW, height: this.oH });

				// reset projector
				Proj.reset(this);

				if (!event.scale) {
					// default to first zoom level
					event.scale = .125;
					// iterate available zoom levels
					ZOOM.filter(z => z.level <= 100)
						.map(zoom => {
							let scale = zoom.level / 100;
							if (Proj.aW > event.width * scale && Proj.aH > event.height * scale) {
								event.scale = scale;
							}
						});
				}
				// auto set scale for file; fixes framing if image is larger than available dimensions
				this.dispatch({ ...event, type: "set-scale", noRender: true });

				// render canvas
				this.render();
				break;
			case "set-scale":
				// scaled dimension
				this.scale = event.scale;
				this.width = this.oW * this.scale;
				this.height = this.oH * this.scale;
				// origo
				this.oX = Math.round(Proj.cX - (this.width / 2));
				this.oY = Math.round(Proj.cY - (this.height / 2));

				if (!event.noRender) {
					// render projector canvas
					Proj.renderFrame(this);
					Proj.render();
				}
				break;
		}
	}
}
