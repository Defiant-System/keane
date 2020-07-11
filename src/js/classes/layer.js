
class Layer {
	constructor(opt) {
		this.type = "layer";
		this.name = opt.name || "Layer 1";
		this.file = opt.file;
		this.blendingMode = "normal";
		this.opacity = 1;
		this.visible = true;
		//this.mask = {};

		let { cvs, ctx } = Misc.createCanvas(opt.width, opt.height);
		this.cvs = cvs;
		this.ctx = ctx;
		// set dimensions
		this.width = opt.width;
		this.height = opt.height;

		// layer contents
		this.content = [];

		let content = {
				top: 0,
				left: 0,
				width: opt.width,
				height: opt.height,
			};

		switch (true) {
			case !!opt.fill:
				this.content.push({ type: "fill", fill: opt.fill, ...content });
				break;
			case !!opt.text:
				this.content.push({ type: "text", text: opt.text, ...content });
				break;
			case !!opt.image:
				this.content.push({ type: "image", image: opt.image, ...content });
				break;
		}
	}
	addBuffer(cvs) {
		this.content.push({ type: "buffer", cvs });
		//this.file.render(true);
	}
	render() {
		// reset canvas
		//this.cvs.prop({ width: this.width, height: this.height });
		this.ctx.clearRect(0, 0, this.width, this.height);

		// loop contents of thi slayer
		this.content.map(item => {
			switch (item.type) {
				case "fill":
					if (item.fill === "transparent") return;
					this.ctx.fillStyle = item.fill;
					this.ctx.fillRect(item.left, item.top, item.width, item.height);
					break;
				case "text":
					//this.ctx.translate(.5, .5);
					this.ctx.font = `30px Arial`;
					this.ctx.fillStyle = "#000";
					this.ctx.fillText(item.text, 100, 100);
					break;
				case "image":
					this.ctx.drawImage(item.image, item.left, item.top);
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
		// 	filtered = Filters.blur(pixels);
		// 	//filtered = Filters.sobel(pixels);
		// this.ctx.putImageData(filtered, 0, 0);
	}
}
