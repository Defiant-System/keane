
// photoshop.box.navigator

{
	toggle(el, state) {
		if (state === "on") {
			// fast references
			this.wrapper = el.find(".navigator-wrapper");
			this.zoomRect = el.find(".view-rect");
			this.zoomValue = el.find(".box-foot .value");
			this.zoomSlider = el.find(".zoom-slider input");
			this.el = el;

			// bind event handlers
			this.zoomSlider.on("input", this.dispatch);

		} else {
			// unbind event handlers
			if (this.zoomSlider) this.zoomSlider.off("input", this.dispatch);

			delete this.el;
		}
	},
	dispatch(event) {
		let root = photoshop,
			self = root.box.navigator,
			value;
		switch (event.type) {
			case "input":
				value = this.value / 100;

				self.zoomValue.html(this.value + "%");

				// root.canvas.css({
				// 	width: (600 * value) +"px",
				// 	height: (366 * value) +"px",
				// });

				let width = Math.min((190 * 1.25) / value, 190),
					height = Math.min((120 * 1.25) / value, 120),
					top = ((120 - height) / 2),
					left = ((190 - width) / 2);

				self.zoomRect.css({
					top: (top - 1) +"px",
					left: (left - 1) +"px",
					width: width +"px",
					height: height +"px",
				});

				Canvas.dispatch({ type: "set-scale", scale: value });
				break;
		}
	}
}
