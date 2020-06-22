
const Canvas = {
	els: {},
	init() {
		// fast references
		this.doc = $(document);
		this.els.toolBar = window.find(".tools-bar");
		this.els.optionsBar = window.find(".tools-options-bar");
		this.els.sideBar = window.find(".sidebar-wrapper");
		this.els.statusBar = window.find(".status-bar");

		this.rT = 18; // ruler thickness
		this.showRulers = true;

		// canvases
		this.osCvs = $(document.createElement("canvas"));
		this.osCtx = this.osCvs[0].getContext("2d");
		this.swapCvs = $(document.createElement("canvas"));
		this.swapCtx = this.swapCvs[0].getContext("2d");
		this.cvs = window.find(".cvs-wrapper canvas");
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
	dispatch(event) {
		let APP = photoshop,
			Self = Canvas,
			_navigator = APP.box.navigator,
			_abs = Math.abs,
			_max = Math.max,
			_min = Math.min,
			_round = Math.round,
			pi2 = Math.PI * 2,
			x, y, w, h,
			data = {},
			img,
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
				Self.aX = Self.showRulers ? Self.rT : 0;
				Self.aY = Self.els.toolBar.height() + Self.els.optionsBar.height() + (Self.showRulers ? Self.rT : 0);
				Self.aW = window.width - Self.aX - Self.els.sideBar.width() + (Self.showRulers ? Self.rT : 0);
				Self.aH = window.height - Self.aY - (Self.showRulers ? Self.rT : 0); // - Self.els.statusBar.height()
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
				// misc
				Self.bgColor = "#000"
				Self.fgColor = "#fff"
				Self.lineWidth = 1;
				// offscreen canvas
				Self.osCvs.prop({ width: Self.oW, height: Self.oH });
				Self.swapCvs.prop({ width: Self.oW, height: Self.oH });
				break;
			case "set-scale":
				// scaled dimension
				Self.scale = event.scale;
				Self.w = Self.oW * Self.scale;
				Self.h = Self.oH * Self.scale;
				// origo
				Self.oX = _round(Self.cX - (Self.w / 2));
				Self.oY = _round(Self.cY - (Self.h / 2));

				// rulers
				Self.rG = ZOOM.find(z => z.level === Self.scale * 100).rG;
				Self.rW = _max(Self.w, window.width);
				Self.rH = _max(Self.h, window.height);
				Self.rulers = Self.createCanvas(Self.rW, Self.rH);

				Self.rulers.ctx.translate(-.5, -.5);
				// debug
				// Self.rulers.ctx.fillStyle = "#f00";
				// Self.rulers.ctx.strokeStyle = "#000";
				// Self.rulers.ctx.fillRect(0, 0, 1e4, 1e4);

				Self.rulers.ctx.lineWidth = 1;
				Self.rulers.ctx.fillStyle = "#112222e5";
				Self.rulers.ctx.strokeStyle = "#0000009e";
				// ruler bg's
				Self.rulers.ctx.fillRect(0, 0, Self.rW, Self.rT);
				Self.rulers.ctx.fillRect(0, Self.rT, Self.rT, Self.rH - Self.rT);
				// top ruler bottom line
				Self.rulers.ctx.beginPath();
				Self.rulers.ctx.moveTo(0, Self.rT);
				Self.rulers.ctx.lineTo(Self.rW, Self.rT);
				Self.rulers.ctx.stroke();
				// left ruler right line
				Self.rulers.ctx.beginPath();
				Self.rulers.ctx.moveTo(Self.rT, 0);
				Self.rulers.ctx.lineTo(Self.rT, Self.rH);
				Self.rulers.ctx.stroke();


				Self.rulers.ctx.textAlign = "left";
				Self.rulers.ctx.fillStyle = "#555";
				Self.rulers.ctx.font = `9px Arial`;
				Self.rulers.ctx.strokeStyle = "#444";

				let xG = Self.rG[0] * Self.scale,
					xl = Self.rW,
					xO = Self.rT + 1,
					oX = Self.oX - xO + 1,
					x;
				for (x=0; x<xl; x+=xG) {
					Self.rulers.ctx.beginPath();
					Self.rulers.ctx.moveTo(x + xO, 0);
					Self.rulers.ctx.lineTo(x + xO, Self.rT);
					Self.rulers.ctx.stroke();
					// ruler numbers
					Self.rulers.ctx.fillText(x / Self.scale, x + xO + 2, 9);
				}
				xG = Self.rG[1] * Self.scale;
				if (xG) for (x=0; x<xl; x+=xG) {
					Self.rulers.ctx.beginPath();
					Self.rulers.ctx.moveTo(x + xO, 12);
					Self.rulers.ctx.lineTo(x + xO, Self.rT);
					Self.rulers.ctx.stroke();
				}
				xG = Self.rG[2] * Self.scale;
				if (xG) for (x=0; x<xl; x+=xG) {
					Self.rulers.ctx.beginPath();
					Self.rulers.ctx.moveTo(x + xO, 15);
					Self.rulers.ctx.lineTo(x + xO, Self.rT);
					Self.rulers.ctx.stroke();
				}

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
				Self.osCtx.drawImage(event.src, 0, 0);
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
					// move origo
					Self.ctx.translate(0, Self.aY - Self.rT);
					// rulers
					img = Self.rulers.cvs[0];
					// origo box
					Self.ctx.drawImage(img,
						0, 0, Self.rT, Self.rT,
						0, 0, Self.rT, Self.rT);
					// top ruler
					Self.ctx.drawImage(img,
						Self.rT, 0, Self.aW - Self.rT, Self.rT,
						Self.rT, 0, Self.aW - Self.rT, Self.rT);
					// left ruler
					Self.ctx.drawImage(img,
						0, Self.rT, Self.rT, Self.aH + Self.rT,
						0, Self.rT, Self.rT, Self.aH + Self.rT);
				}

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
			min = Math.min(r, g, b),
			max = Math.max(r, g, b),
			h = 0, s = 0, v = 0,
			d, h;
		// Black-gray-white
		if (min === max) return [0, 0, _round(min * 100)];
		// Colors other than black-gray-white:
		d = (r === min) ? g - b : ((b === min) ? r - g : b - r);
		h = (r === min) ? 3 : ((b === min) ? 1 : 5);
		h = 60 * (h - d / (max - min));
		s = (max - min) / max;
		return [_round(h), _round(s * 100), _round(max * 100)];
	}
};
