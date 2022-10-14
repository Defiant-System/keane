
// keane.sidebar.navigator

{
	init() {
		let root = window.find(`.box-body > div[data-box="navigator"]`);
		// fast references
		this.doc = $(document);
		this.els = {
			root,
			wrapper: root.find(".navigator-wrapper"),
			zoomRect: root.find(".view-rect"),
			zoomValue: root.find(".box-foot .value"),
			zoomSlider: root.find(".zoom-slider input"),
		};

		this.cvs = root.find(".nav-cvs");
		this.ctx = this.cvs[0].getContext("2d", { willReadFrequently: true });

		// available height
		this.navHeight = this.els.wrapper.height();
		this.maxWidth = parseInt(this.els.wrapper.css("max-width"), 10);

		// bind event handlers
		this.els.zoomRect.on("mousedown", this.pan);
		this.els.zoomSlider.on("input", this.dispatch);

		// subscribe to events
		karaqu.on("projector-update", this.dispatch);

		if (this.ratio) {
			// dispatch if ratio is calculated
			this.dispatch({ type: "projector-update" });
		}

		// temp
		// setTimeout(() => root.find(".icon.mini").trigger("click"), 900);
		// setTimeout(() => root.find(".icon.maxi").trigger("click"), 700);
	},
	dispatch(event) {
		let APP = keane,
			Self = APP.sidebar.navigator,
			Proj = Projector,
			File = Proj.file,
			_rulers = Rulers,
			_round = Math.round,
			_max = Math.max,
			_min = Math.min,
			data = {},
			opt,
			zoom,
			value,
			width,
			height,
			top,
			left;

		if (!Self.els.root) return;

		// console.log(event);
		switch (event.type) {
			// subscribed events
			case "projector-update":
				// calc ratio
				Self.ratio = File.height / File.width;
				if (isNaN(Self.ratio)) return;

				// available width
				Self.navWidth = _round(Self.navHeight / Self.ratio);
				if (Self.navWidth > Self.maxWidth) {
					Self.navWidth = Self.maxWidth;
					Self.navHeight = Self.ratio * Self.navWidth;
				}

				let rT = File.rulers.show ? _rulers.t : 0;
				data.top = (((Proj.aY - File.oY) / File.height) * Self.navHeight);
				data.left = (((Proj.aX - File.oX) / File.width) * Self.navWidth);
				data.height = _min((((Proj.aH + rT) / File.height) * Self.navHeight), Self.navHeight - data.top);
				data.width = _min((((Proj.aW - rT) / File.width) * Self.navWidth), Self.navWidth - data.left);
				
				if (data.top < 0) data.height = _min(data.height + data.top, data.height);
				if (data.left < 0) data.width = _min(data.width + data.left, data.width);
				data.top = _max(data.top, 0);
				data.left = _max(data.left, 0);

				// adjust zoom fields
				ZOOM.map((z, i) => {
					if (z.level === File.scale * 100) {
						Self.dispatch({ type: "file-initial-scale", value: i });
					}
				});

				for (let key in data) data[key] = _round(data[key]) +"px";
				Self.els.zoomRect.css(data);
				Self.els.wrapper.css({ width: Self.navWidth +"px" });
				Self.cvs.prop({ width: Self.navWidth, height: Self.navHeight });
				
				// checkers background
				_rulers.drawCheckers(Self.ctx, { w: Self.navWidth * 2, h: Self.navHeight * 2, size: 4 });

				// paint resized image
				opt = { resizeWidth: Self.navWidth, resizeHeight: Self.navHeight, resizeQuality: "medium" };
				createImageBitmap(File.cvs[0], opt)
					.then(img => Self.ctx.drawImage(img, 0, 0))
					.catch(e => null);
				// show wrapper when ready
				Self.els.wrapper.removeClass("hidden");
				break;

			// custom events
			case "input":
			case "file-initial-scale":
				value = event.value || Self.els.zoomSlider.val();
				value = _max(_min(+value, ZOOM.length - 1), 0);

				Self.zoomValue = ZOOM[value].level;
				Self.els.zoomValue.html(Self.zoomValue + "%");

				if (event.type === "input") {
					File.dispatch({ type: "set-scale", scale: Self.zoomValue / 100 });
				} else {
					Self.els.zoomSlider.val(event.value);
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
				top = _round((event.top / event.max.y) * event.max.h) + Proj.aY;
				left = _round((event.left / event.max.x) * event.max.w) + Proj.aX;
				//if (isNaN(top) || isNaN(left)) return;

				// forward event to canvas
				File.dispatch({ type: "pan-canvas", top, left, noZoom: true });
				break;
		}
	},
	pan(event) {
		let APP = keane,
			Self = APP.sidebar.navigator,
			Drag = Self.drag,
			Proj = Projector,
			File = Proj.file;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// prepare drag object
				let el = $(event.target);
				Self.drag = {
					el,
					clickX: +el.prop("offsetLeft") - event.clientX,
					clickY: +el.prop("offsetTop") - event.clientY,
					min: { x: 0, y: 0 },
					max: {
						x: +el.parent().prop("offsetWidth") - +el.prop("offsetWidth"),
						y: +el.parent().prop("offsetHeight") - +el.prop("offsetHeight") - 3,
						w: Proj.aW - File.width - (File.rulers.show ? Rulers.t : 0),
						h: Proj.aH - File.height + (File.rulers.show ? Rulers.t : 0),
					},
					_max: Math.max,
					_min: Math.min,
				};
				// prevent mouse from triggering mouseover
				APP.els.content.addClass("cover");
				// bind event handlers
				Self.doc.on("mousemove mouseup", Self.pan);
				break;
			case "mousemove":
				let left = Drag._min(Drag._max(event.clientX + Drag.clickX, Drag.min.x), Drag.max.x),
					top = Drag._min(Drag._max(event.clientY + Drag.clickY, Drag.min.y), Drag.max.y);
				// moves navigator view rectangle
				Drag.el.css({ top, left });
				// emit pan-event
				Self.dispatch({ type: "pan-canvas", ...Drag, top, left });
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
