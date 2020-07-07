
const Projector = {
	init() {
		// canvas
		this.cvs = window.find(".cvs-wrapper .canvas");
		this.ctx = this.cvs[0].getContext("2d");
		this.cvs.prop({ width: window.width, height: window.height, });
	}
};
