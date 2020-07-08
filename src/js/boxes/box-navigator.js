
// photoshop.box.navigator

{
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
			this.maxWidth = parseInt(this.els.wrapper.css("max-width"), 10);

			// subscribe to events
			defiant.on("projector-update", this.dispatch);
		} else {
			// clean up
			this.els = {};

			// unsubscribe to events
			defiant.off("projector-update", this.dispatch);
		}
	},
	dispatch(event) {
		let APP = photoshop,
			Self = APP.box.navigator,
			Proj = Projector,
			File = Proj.file,
			_rulers = Rulers,
			_round = Math.round,
			_max = Math.max,
			_min = Math.min,
			data = {},
			zoom,
			value,
			width,
			height,
			top,
			left;

		if (!Self.els.root) return;

		switch (event.type) {
			// subscribed events
			case "projector-update":
				// calc ratio
				Self.ratio = File.h / File.w;
				if (isNaN(Self.ratio)) return;

				// available width
				Self.navWidth = _round(Self.navHeight / Self.ratio);
				if (Self.navWidth > Self.maxWidth) {
					Self.navWidth = Self.maxWidth;
					Self.navHeight = Self.ratio * Self.navWidth;
				}

				let rT = File.showRulers ? _rulers.t : 0;
				data.top = (((Proj.aY - File.oY) / File.h) * Self.navHeight);
				data.left = (((Proj.aX - File.oX) / File.w) * Self.navWidth);
				data.height = _min((((Proj.aH + rT) / File.h) * Self.navHeight), Self.navHeight - data.top);
				data.width = _min((((Proj.aW - rT) / File.w) * Self.navWidth), Self.navWidth - data.left);
				
				if (data.top < 0) data.height = _min(data.height + data.top, data.height);
				if (data.left < 0) data.width = _min(data.width + data.left, data.width);
				data.top = _max(data.top, 0);
				data.left = _max(data.left, 0);

				for (let key in data) data[key] = _round(data[key]) +"px";
				Self.els.zoomRect.css(data);

				Self.els.wrapper.css({ width: Self.navWidth +"px" });
				Self.cvs.prop({ width: Self.navWidth, height: Self.navHeight });
				Self.ctx.drawImage(File.cvs[0], 0, 0, Self.navWidth, Self.navHeight);
				Self.els.wrapper.removeClass("hidden");
				break;
			// custom events
			case "custom-event":
				break;
		}
	}
}
