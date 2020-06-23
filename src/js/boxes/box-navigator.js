
// photoshop.box.navigator

{
	els: {},
	toggle(root, state) {
		if (state === "on") {
			// fast references
			this.doc = $(document);
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

			// bind event handlers
			this.els.zoomRect.on("mousedown", this.pan);
			this.els.zoomSlider.on("input", this.dispatch);

			// update preview box
			this.dispatch({ type: "update-canvas" });
		} else {
			// unbind event handlers
			if (this.els.zoomRect) this.els.zoomRect.off("mousedown", this.pan);
			if (this.els.zoomSlider) this.els.zoomSlider.off("input", this.dispatch);
			// clean up
			this.els = {};
		}
	},
	dispatch(event) {
		let APP = photoshop,
			Self = APP.box.navigator,
			_canvas = Canvas,
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
			case "set-zoom":
				zoom = ZOOM.find(z => z.level === event.arg * 100) || ZOOM[4];
				value = ZOOM.indexOf(zoom);
				Self.els.zoomSlider.val(value);
				if (Self.zoomValue === value) return;
				/* falls through */
			case "input":
				Self.zoomValue = ZOOM[Self.els.zoomSlider.val()].level;
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
				value = _min(+Self.els.zoomSlider.val() + 1, ZOOM.length - 1);
				Self.els.zoomSlider.val(value).trigger("input");
				break;
			case "pan-canvas":
				top = _round((event.y / event.max.y) * event.max.h) + _canvas.aY;
				left = _round((event.x / event.max.x) * event.max.w) + _canvas.aX;
				if (isNaN(top) || isNaN(left)) return;

				// forward event to canvas
				_canvas.dispatch({ type: "pan-canvas", top, left, stop: true });
				break;
			case "update-canvas":
				// calc ratio
				Self.ratio = _canvas.h / _canvas.w;
				if (isNaN(Self.ratio)) return;

				// available width
				Self.navWidth = _round(Self.navHeight / Self.ratio);
				if (Self.navWidth > Self.maxWidth) {
					Self.navWidth = Self.maxWidth;
					Self.navHeight = Self.ratio * Self.navWidth;
				}

				let rT = _canvas.showRulers ? _rulers.rT : 0;
				data.top = (((_canvas.aY - _canvas.oY) / _canvas.h) * Self.navHeight);
				data.left = (((_canvas.aX - _canvas.oX) / _canvas.w) * Self.navWidth);
				data.height = _min((((_canvas.aH + rT) / _canvas.h) * Self.navHeight), Self.navHeight - data.top);
				data.width = _min((((_canvas.aW - rT) / _canvas.w) * Self.navWidth), Self.navWidth - data.left);
				
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
	},
	pan(event) {
		let APP = photoshop,
			Self = APP.box.navigator,
			Drag = Self.drag,
			_canvas = Canvas,
			_max = Math.max,
			_min = Math.min,
			x, y,
			el;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// prepare drag object
				el = $(event.target);
				Self.drag = {
					el,
					clickX: +el.prop("offsetLeft") - event.clientX,
					clickY: +el.prop("offsetTop") - event.clientY,
					min: { x: 0, y: 0 },
					max: {
						x: +el.parent().prop("offsetWidth") - +el.prop("offsetWidth"),
						y: +el.parent().prop("offsetHeight") - +el.prop("offsetHeight") - 4,
						w: Canvas.aW - Canvas.w - (Canvas.showRulers ? Rulers.rT : 0),
						h: Canvas.aH - Canvas.h + (Canvas.showRulers ? Rulers.rT : 0),
					}
				};
				// prevent mouse from triggering mouseover
				APP.els.content.addClass("cover");
				// bind event handlers
				Self.doc.on("mousemove mouseup", Self.pan);
				break;
			case "mousemove":
				x = _min(_max(event.clientX + Drag.clickX, Drag.min.x), Drag.max.x);
				y = _min(_max(event.clientY + Drag.clickY, Drag.min.y), Drag.max.y);
				// moves navigator view rectangle
				Drag.el.css({ top: y +"px", left: x +"px" });
				// emit pan-event
				Self.dispatch({ type: "pan-canvas", ...Drag, x, y });
				break;
			case "mouseup":
				// remove class
				APP.els.content.removeClass("cover");
				// unbind event handlers
				Self.doc.off("mousemove mouseup", Self.pan);
				break;
		}
	}
}
