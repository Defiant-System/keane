
class Layer {
	constructor(file, node) {
		this.file = file;
		this.type = "layer";
		this.blendingMode = "normal";
		this.opacity = 1;
		this.visible = true;

		let { cvs, ctx } = Misc.createCanvas(file.w, file.h);
		this.cvs = cvs;
		this.ctx = ctx;

		// set dimensions
		this.width = file.w;
		this.height = file.h;

		let child = node.selectSingleNode("./*[@type]"),
			content = { _cdata: child.textContent, top: 0, left: 0 };
		
		[...child.attributes].map(a => {
			content[a.name] = +a.value || a.value;
		});

		// layer contents
		switch (content.type) {
			case "fill":
				this.ctx.fillStyle = content.color;
				this.ctx.fillRect(content.left || 0, content.top || 0, content.width || this.file.w, content.height || this.file.h);
				break;
			case "text":
				this.ctx.font = `${content.size}px ${content.font}`;
				this.ctx.fillStyle = content.color;
				this.ctx.fillText(content.value, content.left, content.top);
				break;
			case "image":
				if (!content.image) {
					let image = new Image;
					image.onload = () => {
						if (!content.width) content.width = image.width;
						if (!content.height) content.height = image.height;
						content.image = image;
						// trigger file render
						this.file.render();
					};
					image.src = content.path || content._cdata;
					// clear string from memory
					content._cdata = false;
				} else {
					this.ctx.drawImage(content.image, content.left, content.top, content.width, content.height);
				}
				break;
		}
	}
	addBuffer(cvs) {
		if (!this._original) {
			this._original = this.cvs[0];
		}
		this.ctx.clearRect(0, 0, this.width, this.height);
		this.ctx.drawImage(this._original, 0, 0);
		this.ctx.drawImage(cvs, 0, 0);
	}
}
