
const photoshop = {
	init() {
		// fast references
		this.content = window.find("content");
		this.canvas = window.find(".canvas");
		this.thumbRect = window.find(".thumb-wrapper .view-rect");
		this.zoomSlider = window.find(".zoom-slider input");
		this.zoomValue = window.find(".box-foot .value");

		// bind event handlers
		this.zoomSlider.on("input", this.dispatch);

		this.zoomSlider.val(235).trigger("input");
	},
	dispatch(event) {
		let self = photoshop,
			percent;

		switch (event.type) {
			case "input":
				percent = this.value / 100;

				self.zoomValue.html(this.value + "%");

				self.canvas.css({
					width: (600 * percent) +"px",
					height: (366 * percent) +"px",
				});

				let width = Math.min((190 * 1.25) / percent, 190);
				let height = Math.min((120 * 1.25) / percent, 120);
				let top = ((120 - height) / 2) - 1;
				let left = ((190 - width) / 2) - 1;
				self.thumbRect.css({
					top: top +"px",
					left: left +"px",
					width: width +"px",
					height: height +"px",
				});
				break;
			case "change-bg":
				self.canvas.css({"background-image": `url('/cdn/img/bg/${event.arg}.jpg')`});
				self.thumbRect.parent().css({"background-image": `url('/cdn/img/bg/${event.arg}.jpg')`});
				break;
		}
	}
};

window.exports = photoshop;
