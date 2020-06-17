
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
			self = Canvas,
			_navigator = APP.box.navigator,
			pi2 = Math.PI * 2,
			x, y, w, h,
			pattern,
			el;

		// save paint context
		self.osCtx.save();
		//self.osCtx.scale(self.scale, self.scale);

		switch (event.type) {
			case "load-canvas":
				event.stack.map(item => self.dispatch(item));
				break;
			case "window.resize":
			case "reset-canvas":
				self.aX = self.els.rulerLeft.width();
				self.aY = self.els.toolBar.height() + self.els.optionsBar.height() + self.els.rulerTop.height();
				self.aW = window.width - self.aX - self.els.sideBar.width();
				self.aH = window.height - self.aY; // - self.els.statusBar.height()
				// center
				self.cX = (window.width + self.aX - self.els.sideBar.width()) / 2;
				self.cY = (window.height + self.aY - self.els.statusBar.height()) / 2;
				// clears canvas
				self.cvs.prop({ width: window.width, height: window.height });
				break;
			case "set-canvas":
				// original dimension
				self.oW = event.w;
				self.oH = event.h;
				// scaled dimension
				self.scale = self.scale || event.scale;
				self.w = self.oW * self.scale;
				self.h = self.oH * self.scale;
				// origo
				self.oX = self.cX - (self.w / 2);
				self.oY = self.cY - (self.h / 2);
				// misc
				self.bgColor = "#000"
				self.fgColor = "#fff"
				self.lineWidth = 1;
				// offscreen canvas
				self.osCvs.prop({ width: self.oW, height: self.oH });
				break;
			case "set-scale":
				self.scale = event.scale;
				self.w = self.oW * self.scale;
				self.h = self.oH * self.scale;
				self.oX = self.cX - (self.w / 2);
				self.oY = self.cY - (self.h / 2);
				// re-execute paint stack
				//self.stack.map(item => self.dispatch(item));
				break;
			case "pan-canvas":
				self.cvs.prop({ width: window.width, height: window.height });
				
				self.oX = self.cX - (self.w / 2) + event.x;
				self.oY = self.cY - (self.h / 2) + event.y;
				self.dispatch({ type: "update-canvas" });
				break;
			case "draw-base-layer":
				self.osCtx.fillStyle = event.fill === "transparent" ? self.cvsBgPattern : event.fill;
				self.osCtx.fillRect(0, 0, self.w, self.h);
				break;
			case "draw-rect":
				if (event.fill) {
					self.osCtx.fillStyle = event.fill;
					self.osCtx.fillRect(event.x, event.y, event.w, event.h);
				} else {
					self.osCtx.strokeStyle = event.stroke || self.fgColor;
					self.osCtx.lineWidth = event.width || self.lineWidth;
					self.osCtx.translate(.5, .5);
					self.osCtx.beginPath();
					self.osCtx.rect(event.x, event.y, event.w, event.h);
					self.osCtx.stroke();
				}
				break;
			case "draw-text":
				self.osCtx.translate(.5, .5);
				self.osCtx.font = `${event.size}px ${event.font}`;
				self.osCtx.fillStyle = event.fill;
				self.osCtx.fillText(event.text, event.x, event.y);
				break;
			case "draw-image":
				self.osCtx.drawImage(event.src, 0, 0);
				break;
			case "update-canvas":
				self.ctx.shadowOffsetX = 0;
				self.ctx.shadowOffsetY = 1;
				self.ctx.shadowBlur = 3;
				self.ctx.shadowColor = "#2c2c2c";
				self.ctx.imageSmoothingEnabled = false;
				self.ctx.translate(self.oX, self.oY);
				self.ctx.drawImage(self.osCvs[0], 0, 0, self.w, self.h);
				
				//_navigator.dispatch({ type: "set-zoom", arg: self.scale });
				_navigator.dispatch({ type: "update-canvas" });
				break;
		}
		// restore paint context
		self.osCtx.restore();
	}
};
