
class Layer {
	constructor(file, content) {
		// defaults
		this._file = file;
		this._ready = true;
		this.type = "layer";
		this.name = "Untitled Layer";
		this.blendingMode = "normal";
		this.opacity = 1;
		this.visible = true;

		// dimensions
		this.width = file.width;
		this.height = file.height;

		// layer canvas
		let { cvs, ctx } = Misc.createCanvas(file.width, file.height);
		this.cvs = cvs;
		this.ctx = ctx;

		let top = content.top || 0;
		let left = content.left || 0;
		let width = file.width || 0;
		let height = file.height || 0;

		// layer contents
		switch (content.type) {
			case "fill":
				this.ctx.fillStyle = content.color;
				this.ctx.fillRect( left, top, width, height );
				break;
			case "text":
				break;
			case "image":
				// prevent file render
				this._ready = false;
				// parse layer image blob
				this.parseImage(content);
				break;
		}
	}

	updateThumbnail() {
		let index = this._file.activeLayerIndex;
		let thumbCvsEl = keane.box.layers.els.layerList.find(".row:nth-child(1) canvas");
		let tCtx = thumbCvsEl[0].getContext("2d"),
			width = thumbCvsEl.prop("offsetWidth"),
			height = thumbCvsEl.prop("offsetHeight"),
			ratio = this.width / this.height;
		// set height & width of thumbnail canvas
		thumbCvsEl.prop({ width, height });
		// calculate dimensions
		let tW = ratio < 1 ? height * ratio : width,
			tH = ratio < 1 ? height : width / ratio,
			tX = (width - tW) / 2,
			tY = (height - tH) / 2;
		// background checker for semi transparency
		tCtx.save();
		tCtx.scale(.5, .5);
		tCtx.fillStyle = Projector.checkers;
		tCtx.fillRect(0, 0, 64, 64);
		tCtx.restore();
		// transfer layer image resized to thumbnail canvas
		tCtx.imageSmoothingEnabled = false;
		tCtx.drawImage(this.cvs[0], tX, tY, tW, tH);
	}

	async parseImage(content) {
		let src = URL.createObjectURL(content.blob);
		let image = await this.loadImage(src);
		let top = content.top || 0;
		let left = content.left || 0;
		let width = image.width || file.width;
		let height = image.height || file.height;

		// set image dimensions
		this.width = width;
		this.height = height;

		// dispatch event to resize file canvas
		this._file.dispatch({ type: "resize-file", width, height });
		// reset canvas
		this.cvs.prop({ width, height });
		// apply image to canvas
		this.ctx.drawImage(image, left, top, width, height);
		// set file dimensions if not set
		if (!this._file.width || !this._file.height) {
			this._file.dispatch({ type: "set-canvas", width, height });
		}
		this.bufferImageData();
		this.updateThumbnail();
		// allow file render
		this._ready = true;
		// notify layer ready state
		this._file.render();
	}

	loadImage(url) {
		return new Promise(resolve => {
			let img = new Image;
			img.src = url;
			img.onload = () => resolve(img);
		})
	}

	bufferImageData() {
		// save reference image data
		this._imgData = this.ctx.getImageData(0, 0, this.width, this.height);
	}

	addBuffer(cvs, globalAlpha=1) {
		this.ctx.putImageData(this._imgData, 0, 0);
		this.ctx.globalAlpha = globalAlpha;
		this.ctx.drawImage(cvs, 0, 0);
	}
}
