
class Layer {
	constructor(opt) {
		this.type = "layer";
		this.name = opt.name || "Layer 1";
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
				top: 100,
				left: 100,
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
			}
		});
	}
}
