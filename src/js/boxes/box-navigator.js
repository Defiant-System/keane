
// photoshop.box.navigator

{
	zoom: [10,25,50,75,100,200,300,400,600,800,1200,1500,1800],
	toggle(el, state) {
		if (state === "on") {
			// fast references
			this.statusZoom = window.find(".status-bar .option .value");
			this.wrapper = el.find(".navigator-wrapper");
			this.zoomRect = el.find(".view-rect");
			this.zoomValue = el.find(".box-foot .value");
			this.zoomSlider = el.find(".zoom-slider input");
			this.el = el;

			this.navCvs = el.find(".nav-cvs");
			this.navCtx = this.navCvs[0].getContext("2d");

			// available height
			this.navHeight = this.wrapper.height();

			// bind event handlers
			this.zoomSlider.on("input", this.dispatch);

			this.dispatch({ type: "update-canvas" });
		} else {
			// unbind event handlers
			if (this.zoomSlider) this.zoomSlider.off("input", this.dispatch);

			delete this.el;
		}
	},
	dispatch(event) {
		let root = photoshop,
			self = root.box.navigator,
			data,
			value,
			width,
			height,
			top,
			left;
		switch (event.type) {
			case "input":
				value = self.zoom[this.value];
				self.zoomValue.html(value + "%");
				self.statusZoom.html(value + "%");

				Canvas.dispatch({ type: "set-scale", scale: value / 100 });
				break;
			case "zoom-out":
				value = Math.max(+self.zoomSlider.val() - 1, 0);
				self.zoomSlider.val(value.toString()).trigger("input");
				break;
			case "zoom-in":
				value = Math.min(+self.zoomSlider.val() + 1, self.zoom.length - 1);
				self.zoomSlider.val(value).trigger("input");
				break;
			case "update-canvas":
				// calc ratio
				self.ratio = Canvas.h / Canvas.w;
				if (isNaN(self.ratio)) return;

				// available width
				self.navWidth = Math.round(self.navHeight / self.ratio);

				// width = Math.min(self.navWidth / (value / 100), self.navWidth);
				// height = Math.min(self.navHeight / (value / 100), self.navHeight);
				// top = 0; //(self.navHeight - height) / 2;
				// left = 0; //(self.navWidth - width) / 2;

				// self.zoomRect.css({
				// 	top: top +"px",
				// 	left: left +"px",
				// 	width: width +"px",
				// 	height: height +"px",
				// });

				self.wrapper.css({ width: self.navWidth +"px" });
				self.navCvs.prop({ width: self.navWidth, height: self.navHeight });
				self.navCtx.drawImage(Canvas.osCvs[0], 0, 0, self.navWidth, self.navHeight);
				self.wrapper.removeClass("hidden");
				break;
		}
	}
}
