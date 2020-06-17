
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
	pan(event) {
		let APP = photoshop,
			self = Canvas,
			drag = self.panDrag,
			x, y,
			el;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				self.panDrag = {
					clickX: event.clientX,
					clickY: event.clientY,
					oX: self.oX - self.cX + (self.w / 2),
					oY: self.oY - self.cY + (self.h / 2),
				};
				// prevent mouse from triggering mouseover
				APP.content.addClass("cover");
				// bind event handlers
				self.doc.on("mousemove mouseup", self.pan);
				break;
			case "mousemove":
				x = event.clientX - drag.clickX + drag.oX;
				y = event.clientY - drag.clickY + drag.oY;
				self.dispatch({ type: "pan-canvas", x, y });
				break;
			case "mouseup":
				// remove class
				APP.content.removeClass("cover");
				// unbind event handlers
				self.doc.off("mousemove mouseup", self.pan);
				break;
		}
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
				Self.cvs.prop({ width: window.width, height: window.height });
				
				Self.oX = Self.cX - (Self.w / 2) + event.x;
				Self.oY = Self.cY - (Self.h / 2) + event.y;
				Self.dispatch({ type: "update-canvas" });
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
				
				_navigator.dispatch({ type: "set-zoom", arg: Self.scale });
				_navigator.dispatch({ type: "update-canvas" });
				break;
		}
		// restore paint context
		Self.osCtx.restore();
	}
};
