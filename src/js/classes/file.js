
class File {
	constructor(fsFile) {
		// save reference to original FS file
		this._file = fsFile;

		// defaults
		this.scale = 1;
		this.width = 600;
		this.height = 400;
		this.bgColor = "#000";
		this.fgColor = "#fff";
		this.lineWidth = 1;
		this.showRulers = true;

		// file canvas
		let { cvs, ctx } = Misc.createCanvas(1, 1);
		this.cvs = cvs;
		this.ctx = ctx;

		// undo history
		this.history = new window.History;

		// layers stack
		this.layers = [{ type: "bg-checkers", _ready: true }];

		let xStr = `<File name="${fsFile.base}" width="${this.width}" height="${this.height}" scale="${this.scale}">
					<Layers/></File>`;
		this.xData = $.xmlFromString(xStr).documentElement;

		// handle file types
		switch (fsFile.kind) {
			case "jpg":
			case "jpeg":
			case "gif":
			case "png":
				// let content = { type: "fill", color: "#fff" };
				let content = { type: "image", blob: fsFile.blob };
				let layer = new Layer(this, content);
				this.layers.push(layer);
				// add layer data to xml
				let xLayer = $.nodeFromString(`<i type="layer" state="visible" name="${layer.name}"/>`);
				this.xData.selectSingleNode("Layers").appendChild(xLayer);
				break;
			case "psd":
				console.log("Parse PSD file!");
				break;
		}

		// select top layer as default
		this.activeLayerIndex = 1;

		// initiate canvas
		this.dispatch({ type: "set-canvas", width: this.width, height: this.height });

		// render file
		this.render();
	}

	get activeLayer() {
		return this.layers[this.activeLayerIndex];
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
		let APP = keane,
			Proj = Projector,
			el;
		//console.log(event);
		switch (event.type) {
			case "set-canvas":
				// set file dimension if not set
				this.width = this.width || event.width;
				this.height = this.height || event.height;
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
			case "pan-canvas":
				this.oX = (Number.isInteger(event.left)
						? event.left
						: this.width > Proj.aW ? Proj.cX - (this.width / 2) + event.x : false) || this.oX;
				this.oY = (Number.isInteger(event.top)
						? event.top
						: this.height > Proj.aH ? Proj.cY - (this.height / 2) + event.y : false) || this.oY;
				// render projector canvas
				Proj.render();
				break;
			case "toggle-rulers":
				this.showRulers = event.checked === 1;
				// trigger re-calculations + re-paint
				Proj.reset(this);
				// update origo
				this.oX = Math.round(Proj.cX - (this.width / 2));
				this.oY = Math.round(Proj.cY - (this.height / 2));
				// render projector canvas
				Proj.renderFrame(this);
				Proj.render();

				APP.els.content.toggleClass("show-rulers", !this.showRulers);
				break;
		}
	}
}
