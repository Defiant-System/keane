
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
			content = { _cdata: child.textContent, top: 0, left: 0, width: file.w, height: file.h };
		
		[...child.attributes].map(a => {
			content[a.name] = +a.value || a.value;
		});

		// layer contents
		this.content = [content];
	}
	addBuffer(cvs) {
		this.content.push({ type: "buffer", cvs });
		//this.file.render(true);
	}
	render() {
		// reset canvas
		this.cvs.prop({ width: this.width, height: this.height });
		//this.ctx.clearRect(0, 0, this.width, this.height);

		// loop contents of thi slayer
		this.content.map(item => {
			switch (item.type) {
				case "fill":
					//if (item.fill === "transparent") return;
					this.ctx.fillStyle = item.color;
					this.ctx.fillRect(item.left, item.top, item.width, item.height);
					break;
				case "text":
					this.ctx.font = `${item.size}px ${item.font}`;
					this.ctx.fillStyle = item.color;
					this.ctx.fillText(item.value, item.left, item.top);
					break;
				case "image":
					if (!item.image) {
						let image = new Image;
						image.onload = () => {
							let width = image.width,
								height = image.height;
							item.image = image;
							// trigger file render
							this.file.render();
						};
						image.src = item.path || item._cdata;
						// clear string from memory
						item._cdata = false;
					} else {
						this.ctx.drawImage(item.image, item.left, item.top);
					}
					break;
				case "buffer":
					this.ctx.drawImage(item.cvs, 0, 0);
					this.content.pop();
					break;
			}
		});

		// let pixels = Filters.getPixels(this.cvs[0]),
		// 	//filtered = Filters.grayscale(pixels);
		// 	//filtered = Filters.brightness(pixels, 40);
		// 	//filtered = Filters.threshold(pixels, 50);
		// 	//filtered = Filters.sharpen(pixels);
		// 	filtered = Filters.clouds(pixels);
		// 	//filtered = Filters.blur(pixels);
		// 	//filtered = Filters.sobel(pixels);
		// this.ctx.putImageData(filtered, 0, 0);

		return this.cvs[0];
	}
}
