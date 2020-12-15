
class Layer {
	constructor(file, content) {
		// defaults
		this.file = file;
		this._ready = true;
		this.id = 123;
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
				console.log( left, top, width, height );
				this.ctx.fillRect( left, top, width, height );
				break;
			case "text":
				break;
			case "image":
				// prevent file render
				this._ready = false;
				
				let image = new Image;
				image.onload = () => {
					// apply image to canvas
					this.ctx.drawImage(image, left, top, image.width, image.height);
					// allow file render
					this._ready = true;
					// notify layer ready state
					this.file.render();
				};
				// set image source to blob / url
				image.src = URL.createObjectURL(content.blob);
				break;
		}
	}

	addBuffer(cvs) {
		this.ctx.putImageData(this._imgData, 0, 0);
		this.ctx.drawImage(cvs, 0, 0);
	}
}
