
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
			case !!opt.image:
				this.content.push({ type: "image", image: opt.image, ...content });
				break;
		}
	}
	addBuffer(callback) {
		this.content.push({ type: "buffer", callback });
		this.file.render();
	}
	render() {
		// reset canvas
		this.cvs.prop({ width: this.width, height: this.height });
		// loop contents of thi slayer
		this.content.map(item => {
			switch (item.type) {
				case "fill":
					if (item.fill === "transparent") return;
					this.ctx.fillStyle = item.fill;
					this.ctx.fillRect(item.left, item.top, item.width, item.height);
					break;
				case "image":
					this.ctx.drawImage(item.image, item.left, item.top);
					break;
				case "buffer":
					item.callback(this.ctx);

					this.content.pop();
					break;
			}
		});
		// remove buffer from contents
		//this.content = this.content.filter(item => item.type !== "buffer");
	}
}
