
// photoshop.box.navigator

{
	zoom: [10,25,50,75,100,200,300,400,600,800,1200,1500,1800],
	els: {},
	toggle(root, state) {
		if (state === "on") {
			// fast references
			this.els.statusZoom = window.find(".status-bar .option .value");
			this.els.wrapper = root.find(".navigator-wrapper");
			this.els.zoomRect = root.find(".view-rect");
			this.els.zoomValue = root.find(".box-foot .value");
			this.els.zoomSlider = root.find(".zoom-slider input");
			this.els.root = root;

			this.cvs = root.find(".nav-cvs");
			this.ctx = this.cvs[0].getContext("2d");

			// available height
			this.navHeight = this.els.wrapper.height();

			// bind event handlers
			this.els.zoomSlider.on("input", this.dispatch);

			//this.dispatch({ type: "set-zoom", arg: 3 });
			//this.dispatch({ type: "update-canvas" });
		} else {
			// unbind event handlers
			if (this.els.zoomSlider) this.els.zoomSlider.off("input", this.dispatch);

			delete this.els;
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
			case "set-zoom":
				value = self.zoom.indexOf(event.arg * 100);
				self.els.zoomSlider.val(value);
				/* falls through */
			case "input":
				value = self.zoom[self.els.zoomSlider.val()];
				self.els.zoomValue.html(value + "%");
				self.els.statusZoom.html(value + "%");

				Canvas.dispatch({ type: "set-scale", scale: value / 100 });
				break;
			case "zoom-out":
				value = Math.max(+self.els.zoomSlider.val() - 1, 0);
				self.els.zoomSlider.val(value.toString()).trigger("input");
				break;
			case "zoom-in":
				value = Math.min(+self.els.zoomSlider.val() + 1, self.zoom.length - 1);
				self.els.zoomSlider.val(value).trigger("input");
				break;
			case "update-canvas":
				// calc ratio
				self.ratio = Canvas.h / Canvas.w;
				if (isNaN(self.ratio)) return;

				// available width
				self.navWidth = Math.round(self.navHeight / self.ratio);

				width = Canvas.aW - Canvas.w;
				//console.log(width);
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

				self.els.wrapper.css({ width: self.navWidth +"px" });
				self.cvs.prop({ width: self.navWidth, height: self.navHeight });
				self.ctx.drawImage(Canvas.osCvs[0], 0, 0, self.navWidth, self.navHeight);
				self.els.wrapper.removeClass("hidden");
				break;
		}
	}
}
