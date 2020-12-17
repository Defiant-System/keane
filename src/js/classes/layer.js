
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

		// reset canvas
		this.cvs.prop({ width, height });
		// apply image to canvas
		this.ctx.drawImage(image, left, top, width, height);
		// set file dimensions if not set
		if (!this._file.width || !this._file.height) {
			this._file.dispatch({ type: "set-canvas", width, height });
		}
		// save reference image data
		this._imgData = this.ctx.getImageData(0, 0, width, height);
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

	addBuffer(cvs) {
		this.ctx.putImageData(this._imgData, 0, 0);
		this.ctx.drawImage(cvs, 0, 0);
	}
}
