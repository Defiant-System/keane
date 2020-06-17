
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
		let APP = photoshop,
			Self = APP.box.navigator,
			_canvas = Canvas,
			_round = Math.round,
			_max = Math.max,
			_min = Math.min,
			data = {},
			value,
			width,
			height,
			top,
			left;
		switch (event.type) {
			case "set-zoom":
				value = Self.zoom.indexOf(event.arg * 100);
				Self.els.zoomSlider.val(value);
				if (Self.zoomValue === Self.zoom[value]) return;
				/* falls through */
			case "input":
				Self.zoomValue = Self.zoom[Self.els.zoomSlider.val()];
				Self.els.zoomValue.html(Self.zoomValue + "%");
				Self.els.statusZoom.html(Self.zoomValue + "%");

				if (event.type === "input") {
					_canvas.dispatch({ type: "set-scale", scale: Self.zoomValue / 100 });
				}
				break;
			case "zoom-out":
				value = _max(+Self.els.zoomSlider.val() - 1, 0);
				Self.els.zoomSlider.val(value.toString()).trigger("input");
				break;
			case "zoom-in":
				value = _min(+Self.els.zoomSlider.val() + 1, Self.zoom.length - 1);
				Self.els.zoomSlider.val(value).trigger("input");
				break;
			case "update-canvas":
				// calc ratio
				Self.ratio = _canvas.h / _canvas.w;
				if (isNaN(Self.ratio)) return;

				// available width
				Self.navWidth = _round(Self.navHeight / Self.ratio);

				data.top = (((_canvas.aY - _canvas.oY) / _canvas.h) * Self.navHeight) - 1;
				data.left = (((_canvas.aX - _canvas.oX) / _canvas.w) * Self.navWidth) - 1;
				data.height = _min(((_canvas.aH / _canvas.h) * Self.navHeight) + 1, Self.navHeight - data.top);
				data.width = _min(((_canvas.aW / _canvas.w) * Self.navWidth) + 1, Self.navWidth - data.left);
				
				if (data.top < 0) data.height = _min(data.height + data.top, data.height);
				if (data.left < 0) data.width = _min(data.width + data.left, data.width);
				data.top = _max(data.top, 0);
				data.left = _max(data.left, 0);

				for (let key in data) data[key] = _round(data[key]) +"px";
				Self.els.zoomRect.css(data);

				Self.els.wrapper.css({ width: Self.navWidth +"px" });
				Self.cvs.prop({ width: Self.navWidth, height: Self.navHeight });
				Self.ctx.drawImage(_canvas.osCvs[0], 0, 0, Self.navWidth, Self.navHeight);
				Self.els.wrapper.removeClass("hidden");
				break;
		}
	}
}
