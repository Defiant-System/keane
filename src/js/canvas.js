
const Canvas = {
	els: {},
	init() {
		// fast references
		this.doc = $(document);
		this.els.toolBar = window.find(".tools-bar");
		this.els.optionsBar = window.find(".tools-options-bar");
		this.els.sideBar = window.find(".sidebar-wrapper");
		this.els.statusBar = window.find(".status-bar");

		this.showRulers = true;
		this.bgColor = "#000"
		this.fgColor = "#fff"
		this.lineWidth = 1;

		// canvases
		this.osCvs = $(document.createElement("canvas"));
		this.osCtx = this.osCvs[0].getContext("2d");
		this.olCvs = window.find(".cvs-wrapper .overlay");
		this.olCtx = this.olCvs[0].getContext("2d");
		this.cvs = window.find(".cvs-wrapper .canvas");
		this.ctx = this.cvs[0].getContext("2d");
		this.cvs.prop({ width: window.width, height: window.height, });

		this.cvsBg = new Image;
		this.cvsBg.onload = () => this.cvsBgPattern = this.osCtx.createPattern(this.cvsBg, "repeat");
		this.cvsBg.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMElEQVQ4T2P8////fwY8YM+ePfikGRhHDRgWYbB792686cDFxQV/Ohg1gIFx6IcBAPU7UXHPhMXmAAAAAElFTkSuQmCC";
	},
	createCanvas(width, height) {
		let cvs = $(document.createElement("canvas")),
			ctx = cvs[0].getContext("2d");
		cvs.prop({ width, height });
		return { cvs, ctx }
	},
	reset() {
		// re-paints paint stack
		this.stack.map(item => this.dispatch(item));
	},
	translatePoints(p) {
		let _round = Math.round,
			_max = Math.max,
			_min = Math.min,
			scale = this.scale,
			oX = this.oX,
			oY = this.oY,
			w = this.oW,
			h = this.oH,
			point = {};

		Object.keys(p).map(k => {
			switch (k) {
				case "x": point.x = _min(_max(_round((p.x - oX) / scale), 0), w); break;
				case "y": point.y = _min(_max(_round((p.y - oY) / scale), 0), h); break;
				default: point[k] = _round(p[k] / scale);
			}
		});

		return point;
	},
	dispatch(event) {
		let APP = photoshop,
			Self = Canvas,
			_navigator = APP.box.navigator,
			_rulers = Rulers,
			_abs = Math.abs,
			_max = Math.max,
			_min = Math.min,
			_round = Math.round,
			pi2 = Math.PI * 2,
			x, y, w, h,
			data = {},
			el;

		// save paint context
		Self.osCtx.save();
		//Self.osCtx.scale(Self.scale, Self.scale);

		switch (event.type) {
			// native events
			case "mousemove":
				data.top = _round(_min(_max(event.offsetY - Self.oY, 0), Self.h) / Self.scale);
				data.left = _round(_min(_max(event.offsetX - Self.oX, 0), Self.w) / Self.scale);
				data.offsetY = _min(_max(event.offsetY, Self.oY), Self.oY + Self.h) - Self.aY;
				data.offsetX = _min(_max(event.offsetX, Self.oX), Self.oX + Self.w) - Self.aX;
				data.rgba = Self.osCtx.getImageData(data.left, data.top, 1, 1).data;
				data.hsl = Color.rgbToHsv.apply({}, data.rgba);
				data.isOnCanvas = event.offsetY >= Self.oY && event.offsetY <= Self.oY + Self.h
								&& event.offsetX >= Self.oX && event.offsetX <= Self.oX + Self.w;

				// broadcast event
				defiant.emit("mouse-move", data);
				break;
			// custom events
			case "load-canvas":
				Self.stack = event.stack;
				// reset canvas
				Self.reset();
				// bind event handlers
				Self.cvs.on("mousemove", Self.dispatch);
				// broadcast event
				defiant.emit(event.type);
				break;
			case "window.resize":
			case "reset-canvas":
				Self.aX = Self.showRulers ? _rulers.t : 0;
				Self.aY = Self.els.toolBar.height() + Self.els.optionsBar.height() + (Self.showRulers ? _rulers.t : 0);
				Self.aW = window.width - Self.aX - Self.els.sideBar.width() + (Self.showRulers ? _rulers.t : 0);
				Self.aH = window.height - Self.aY - (Self.showRulers ? _rulers.t : 0); // - Self.els.statusBar.height()
				// center
				Self.cX = (window.width + Self.aX - Self.els.sideBar.width()) / 2;
				Self.cY = (window.height + Self.aY - Self.els.statusBar.height()) / 2;
				// clears canvas
				Self.cvs.prop({ width: window.width, height: window.height });

				if (event.type === "window.resize") {
					// reset canvas
					Self.reset();
				}
				break;
			case "set-canvas":
				// original dimension
				Self.oW = event.w;
				Self.oH = event.h;

				if (!event.scale) {
					// default to first zoom level
					event.scale = .1;
					// iterate available zoom levels
					ZOOM.filter(z => z.level <= 100)
						.map(zoom => {
							let scale = zoom.level / 100;
							if (Self.aW > event.w * scale && Self.aH > event.h * scale) {
								event.scale = scale;
							}
						});
				}
				// scaled dimension
				Self.dispatch({
					type: "set-scale",
					scale: Self.scale || event.scale,
					noReset: true
				});
				// offscreen canvas
				Self.osCvs.prop({ width: Self.oW, height: Self.oH });
				/* falls through */
			case "sync-overlay-canvas":
				// sync overlay canvas
				Self.olCvs
					.prop({
						width: Self.aX - Self.oX < 0 ? Self.w : Self.aW - (Self.showRulers ? _rulers.t : 0),
						height: Self.aY - Self.oY < 0 ? Self.h : Self.aH + (Self.showRulers ? _rulers.t : 0)
					})
					.css({
						top: _max(Self.oY, Self.aY) +"px",
						left: _max(Self.oX, Self.aX) +"px"
					});
				break;
			case "set-scale":
				// scaled dimension
				Self.scale = event.scale;
				Self.w = Self.oW * Self.scale;
				Self.h = Self.oH * Self.scale;
				// origo
				Self.oX = _round(Self.cX - (Self.w / 2));
				Self.oY = _round(Self.cY - (Self.h / 2));

				Self.dispatch({ type: "sync-overlay-canvas" });

				// reset canvas
				if (!event.noReset) Self.reset();
				break;
			case "pan-canvas":
				//console.log(event);  // for dev purposes
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
				Self.dispatch({ type: "commit", image: event.src });
				break;
			case "commit":
				Self.osCtx.drawImage(event.image, 0, 0);

				Self.stack = [
					{ type: "reset-canvas" },
					{ type: "update-canvas" },
				];

				Self.reset();

				// broadcast event
				defiant.emit("canvas-update");
				break;
			case "update-canvas":
				Self.ctx.save();
				Self.ctx.translate(Self.oX, Self.oY);
				Self.ctx.shadowOffsetX = 0;
				Self.ctx.shadowOffsetY = 1;
				Self.ctx.shadowBlur = 5;
				Self.ctx.shadowColor = "#292929";
				Self.ctx.imageSmoothingEnabled = false;
				Self.ctx.drawImage(Self.osCvs[0], 0, 0, Self.w, Self.h);
				Self.ctx.restore();

				if (Self.showRulers) {
					// render rulers according to scale
					_rulers.render(Self);
				}

				if (!event.stop) {
					_navigator.dispatch({ type: "set-zoom", arg: Self.scale });
				}
				_navigator.dispatch({ type: "update-canvas" });
				break;
		}
		// restore paint context
		Self.osCtx.restore();
	}
};
