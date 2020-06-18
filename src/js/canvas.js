
const Canvas = {
	els: {},
	init() {
		// fast references
		this.doc = $(document);
		this.els.toolBar = window.find(".tools-bar");
		this.els.optionsBar = window.find(".tools-options-bar");
		this.els.sideBar = window.find(".sidebar-wrapper");
		this.els.statusBar = window.find(".status-bar");
		this.els.rulerTop = window.find(".ruler-top");
		this.els.rulerLeft = window.find(".ruler-left");

		// canvases
		this.osCvs = $(document.createElement("canvas"));
		this.osCtx = this.osCvs[0].getContext("2d");
		this.cvs = window.find(".cvs-wrapper canvas");
		this.ctx = this.cvs[0].getContext("2d");
		this.cvs.prop({ width: window.width, height: window.height, });

		this.cvsBg = new Image;
		this.cvsBg.onload = () => this.cvsBgPattern = this.osCtx.createPattern(this.cvsBg, "repeat");
		this.cvsBg.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMElEQVQ4T2P8////fwY8YM+ePfikGRhHDRgWYbB792686cDFxQV/Ohg1gIFx6IcBAPU7UXHPhMXmAAAAAElFTkSuQmCC";

		// bind event handlers
		this.cvs.on("mousedown", this.pan);
	},
	dispatch(event) {
		let APP = photoshop,
			Self = Canvas,
			_navigator = APP.box.navigator,
			pi2 = Math.PI * 2,
			x, y, w, h,
			pattern,
			el;

		// save paint context
		Self.osCtx.save();
		//Self.osCtx.scale(Self.scale, Self.scale);

		switch (event.type) {
			case "load-canvas":
				Self.stack = event.stack;
				// execute stack
				event.stack.map(item => Self.dispatch(item));
				break;
			case "window.resize":
			case "reset-canvas":
				Self.aX = Self.els.rulerLeft.width();
				Self.aY = Self.els.toolBar.height() + Self.els.optionsBar.height() + Self.els.rulerTop.height();
				Self.aW = window.width - Self.aX - Self.els.sideBar.width();
				Self.aH = window.height - Self.aY; // - Self.els.statusBar.height()
				// center
				Self.cX = (window.width + Self.aX - Self.els.sideBar.width()) / 2;
				Self.cY = (window.height + Self.aY - Self.els.statusBar.height()) / 2;
				// clears canvas
				Self.cvs.prop({ width: window.width, height: window.height });
				break;
			case "set-canvas":
				// original dimension
				Self.oW = event.w;
				Self.oH = event.h;

				if (!event.scale) {
					// default to first zoom level
					event.scale = .1;
					// iterate available zoom levels
					ZOOM.filter(i => i <= 100)
						.map(level => {
							let scale = level / 100;
							if (Self.aW > event.w * scale && Self.aH > event.h * scale) {
								event.scale = scale;
							}
						});
				}
				// scaled dimension
				Self.scale = Self.scale || event.scale;
				Self.w = Self.oW * Self.scale;
				Self.h = Self.oH * Self.scale;
				// origo
				Self.oX = Self.cX - (Self.w / 2);
				Self.oY = Self.cY - (Self.h / 2);
				// misc
				Self.bgColor = "#000"
				Self.fgColor = "#fff"
				Self.lineWidth = 1;
				// offscreen canvas
				Self.osCvs.prop({ width: Self.oW, height: Self.oH });
				break;
			case "set-scale":
				Self.scale = event.scale;
				Self.w = Self.oW * Self.scale;
				Self.h = Self.oH * Self.scale;
				Self.oX = Self.cX - (Self.w / 2);
				Self.oY = Self.cY - (Self.h / 2);
				// re-execute paint stack
				Self.stack.map(item => Self.dispatch(item));
				break;
			case "pan-canvas":
				// reset canvas
				Self.cvs.prop({ width: window.width, height: window.height });
				
				Self.oX = Number.isInteger(event.left) ? event.left : Self.cX - (Self.w / 2) + event.x;
				Self.oY = Number.isInteger(event.top) ? event.top : Self.cY - (Self.h / 2) + event.y;

				Self.dispatch({ type: "update-canvas", stop: event.stop });
				break;
			case "draw-base-layer":
				Self.osCtx.fillStyle = event.fill === "transparent" ? Self.cvsBgPattern : event.fill;
				Self.osCtx.fillRect(0, 0, Self.w, Self.h);
				break;
			case "draw-rect":
				if (event.fill) {
					Self.osCtx.fillStyle = event.fill;
					Self.osCtx.fillRect(event.x, event.y, event.w, event.h);
				} else {
					Self.osCtx.strokeStyle = event.stroke || Self.fgColor;
					Self.osCtx.lineWidth = event.width || Self.lineWidth;
					Self.osCtx.translate(.5, .5);
					Self.osCtx.beginPath();
					Self.osCtx.rect(event.x, event.y, event.w, event.h);
					Self.osCtx.stroke();
				}
				break;
			case "draw-text":
				Self.osCtx.translate(.5, .5);
				Self.osCtx.font = `${event.size}px ${event.font}`;
				Self.osCtx.fillStyle = event.fill;
				Self.osCtx.fillText(event.text, event.x, event.y);
				break;
			case "draw-image":
				Self.osCtx.drawImage(event.src, 0, 0);
				break;
			case "update-canvas":
				Self.ctx.shadowOffsetX = 0;
				Self.ctx.shadowOffsetY = 1;
				Self.ctx.shadowBlur = 3;
				Self.ctx.shadowColor = "#2c2c2c";
				Self.ctx.imageSmoothingEnabled = false;
				Self.ctx.translate(Self.oX, Self.oY);
				Self.ctx.drawImage(Self.osCvs[0], 0, 0, Self.w, Self.h);

				if (!event.stop) {
					_navigator.dispatch({ type: "set-zoom", arg: Self.scale });
					_navigator.dispatch({ type: "update-canvas" });
				}
				break;
		}
		// restore paint context
		Self.osCtx.restore();
	},
	pan(event) {
		let APP = photoshop,
			Self = Canvas,
			drag = Self.panDrag,
			_max = Math.max,
			_min = Math.min;

		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				Self.panDrag = {
					clickX: event.clientX - (Self.oX - Self.cX + (Self.w / 2)),
					clickY: event.clientY - (Self.oY - Self.cY + (Self.h / 2)),
					min: {
						x: Self.aX - Self.cX + (Self.w / 2),
						y: Self.aY - Self.cY + (Self.h / 2),
					},
					max: {
						x: (Self.cX - Self.aX - (Self.w / 2)),
						y: (Self.cY - Self.aY - (Self.h / 2)) + Self.els.statusBar.height(),
					},
				};

				// prevent mouse from triggering mouseover
				APP.content.addClass("cover");
				// bind event handlers
				Self.doc.on("mousemove mouseup", Self.pan);
				break;
			case "mousemove":
				let x = _max(_min(event.clientX - drag.clickX, drag.min.x), drag.max.x),
					y = _max(_min(event.clientY - drag.clickY, drag.min.y), drag.max.y);
				Self.dispatch({ type: "pan-canvas", x, y });
				break;
			case "mouseup":
				// remove class
				APP.content.removeClass("cover");
				// unbind event handlers
				Self.doc.off("mousemove mouseup", Self.pan);
				break;
		}
	}
};
