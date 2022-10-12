
class Layer {
	constructor(file, content) {
		// defaults
		this._file = file;
		this._ready = true;
		this._id = content.id || `l${Date.now()}`;
		this._blendingMode = "normal";
		this._opacity = 1;
		this._visible = true;

		this.name = content.name || "Untitled Layer";
		this.type = "layer";

		// dimensions
		this.width = file.width;
		this.height = file.height;

		let top = content.top || 0;
		let left = content.left || 0;
		let width = file.oW || file.width || 0;
		let height = file.oH || file.height || 0;

		// layer canvas
		let { cvs, ctx } = Misc.createCanvas(width, height);
		this.cvs = cvs;
		this.ctx = ctx;

		// layer contents
		switch (content.type) {
			case "fill":
				this.ctx.fillStyle = content.color;
				this.ctx.fillRect( left, top, width, height );
				requestAnimationFrame(() => this.updateThumbnail());
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

	get id() {
		return this._id;
	}

	set id(value) {
		this._id = value;
	}

	get visible() {
		return this._visible;
	}

	set visible(value) {
		if (this._visible === !!value) return;
		this._visible = !!value;
	}

	updateThumbnail() {
		// let index = this._file.activeLayerIndex;
		let thumbCvsEl = keane.sidebar.layers.els.layerList.find(".row:nth-child(1) canvas");
		let tCtx = thumbCvsEl[0].getContext("2d"),
			width = thumbCvsEl.prop("offsetWidth") || 32,
			height = thumbCvsEl.prop("offsetHeight") || 32,
			ratio = this.width / this.height,
			// calculate dimensions
			tW = ratio < 1 ? Math.round(height * ratio) : width,
			tH = ratio < 1 ? height : Math.round(width / ratio),
			pX = Math.floor((width - tW) * .5),
			pY = Math.floor((height - tH) * .5);
		
		// reset thumbnail canvas
		thumbCvsEl.prop({ width, height });
		
		// checkers background
		Projector.drawCheckers(tCtx, {
			pX, pY,
			w: tW + pX,
			h: tH + pY,
			size: 4
		});

		// transfer layer image resized to thumbnail canvas
		let opt = { resizeWidth: tW, resizeHeight: tH, resizeQuality: "medium" };
		createImageBitmap(this.cvs[0], opt)
			.then(img => tCtx.drawImage(img, pX, pY))
			.catch(e => null);
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
		});
	}

	putImageData(opt) {
		// TODO: pass data through "mask"

		this.ctx.putImageData(opt.data, opt.x || 0, opt.y || 0);
		// render file
		Projector.file.render({ noEmit: (opt.noEmit !== undefined) ? opt.noEmit : 1 });
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

	applyCompositeImage(opt) {
		this.ctx.globalCompositeOperation = opt.operation || "source-over";
		this.ctx.drawImage(opt.image, 0, 0);
		this.updateThumbnail();
	}
}
