
class Layer {
	constructor(name) {
		this.name = name || "Layer 1";
		this.blendingMode = "normal";
		this.opacity = 1;
		this.visible = true;
		//this.mask = {};

		let width = Canvas.oW,
			height = Canvas.oH,
			{ cvs, ctx } = Misc.createCanvas(width, height);
		this.cvs = cvs;
		this.ctx = ctx;

		console.log(width, height);
	}
	render() {

	}
}
