
const photoshop = {
	init() {
		// fast references
		this.content = window.find("content");
		this.zoomSlider = window.find(".zoom-slider input");

		// bind event handlers
		this.zoomSlider.on("input", this.dispatch);
	},
	dispatch(event) {
		switch (event.type) {
			case "input":
				console.log(this.value);
				break;
			case "window.open":
				break;
		}
	}
};

window.exports = photoshop;
