
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
	},
	dispatch(event) {
		let APP = photoshop,
			Self = Canvas,
			_navigator = APP.box.navigator,
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
				data.hsl = Self.rgbToHsv.apply({}, data.rgba);
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
				Self.aX = Self.els.rulerLeft.width();
				Self.aY = Self.els.toolBar.height() + Self.els.optionsBar.height() + Self.els.rulerTop.height();
				Self.aW = window.width - Self.aX - Self.els.sideBar.width();
				Self.aH = window.height - Self.aY; // - Self.els.statusBar.height()
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
				// reset canvas
				Self.reset();
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
				Self.ctx.translate(Self.oX, Self.oY);
				Self.ctx.save();
				Self.ctx.shadowOffsetX = 0;
				Self.ctx.shadowOffsetY = 1;
				Self.ctx.shadowBlur = 5;
				Self.ctx.shadowColor = "#292929";
				Self.ctx.imageSmoothingEnabled = false;
				Self.ctx.drawImage(Self.osCvs[0], 0, 0, Self.w, Self.h);
				Self.ctx.restore();

				if (!event.stop) {
					_navigator.dispatch({ type: "set-zoom", arg: Self.scale });
					_navigator.dispatch({ type: "update-canvas" });
				}
				break;
		}
		// restore paint context
		Self.osCtx.restore();
	},
	reset() {
		// re-paints paint stack
		this.stack.map(item => this.dispatch(item));
	},
	hslToRgb(hsl) {
		let _round = Math.round,
			r, g, b, q, p,
			hue2rgb = (p, q, t) => {
				if(t < 0) t += 1;
				if(t > 1) t -= 1;
				if(t < 1/6) return p + (q - p) * 6 * t;
				if(t < 1/2) return q;
				if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
				return p;
			};
		if (s === 0) {
			r = g = b = l; // achromatic
		} else {
			q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			p = 2 * l - q;
			r = hue2rgb(p, q, h + 1/3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1/3);
		}
		return [_round(r * 255), _round(g * 255), _round(b * 255)];
	},
	rgbToHsv(r, g, b) {
		r /= 255;
		g /= 255;
		b /= 255;
		var _round = Math.round,
			_min = Math.min,
			_max = Math.max,
			min = _min(r, _min(g, b)),
			max = _max(r, _max(g, b)),
			h = 0, s = 0, v = 0,
			d, h;
		// Black-gray-white
		if (min === max) return [0, 0, min];
		// Colors other than black-gray-white:
		d = (r === min) ? g - b : ((b === min) ? r - g : b - r);
		h = (r === min) ? 3 : ((b === min) ? 1 : 5);
		h = 60 * (h - d / (max - min));
		s = (max - min) / max;
		v = max;
		return [_round(h), _round(s * 100), _round(v * 100)];
	}
};
