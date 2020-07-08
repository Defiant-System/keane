
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

		this.image = opt.image;
	}
	render() {
		this.ctx.drawImage(this.image, 0, 0);
	}
}
