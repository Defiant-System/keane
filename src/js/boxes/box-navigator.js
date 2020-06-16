
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

			this.tmpCvs = $(document.createElement("canvas"));
			this.tmpCtx = this.tmpCvs[0].getContext("2d");
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
				value = this.value / 100;

				self.zoomValue.html(this.value + "%");

				width = Math.min((self.navWidth * 1.25) / value, self.navWidth);
				height = Math.min((self.navHeight * 1.25) / value, self.navHeight);
				top = ((self.navHeight - height) / 2);
				left = ((self.navWidth - width) / 2);

				self.zoomRect.css({
					top: top +"px",
					left: left +"px",
					width: width +"px",
					height: height +"px",
				});

				Canvas.dispatch({ type: "set-scale", scale: value });
				break;
			case "zoom-out":
				break;
			case "zoom-in":
				break;
			case "update-canvas":
				// calc ratio
				self.ratio = Canvas.h / Canvas.w;
				if (isNaN(self.ratio)) return;

				// available width
				self.navWidth = Math.round(self.navHeight / self.ratio);
				self.scale = self.navHeight / Canvas.h;

				self.wrapper.css({ width: self.navWidth +"px" });
				self.navCvs.prop({ width: self.navWidth, height: self.navHeight });

				data = Canvas.ctx.getImageData(Canvas.oX, Canvas.oY, Canvas.w * Canvas.scale, Canvas.h * Canvas.scale);
				self.tmpCvs.prop({ width: Canvas.w * Canvas.scale, height: Canvas.h * Canvas.scale });
				self.tmpCtx.putImageData(data, 0, 0);
				self.navCtx.drawImage(self.tmpCvs[0], 0, 0, self.navWidth, self.navHeight);
				self.wrapper.removeClass("hidden");
				break;
		}
	}
}
