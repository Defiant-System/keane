
const Canvas = {
	els: {},
	init() {
		// fast references
		this.els.toolBar = window.find(".tools-bar");
		this.els.optionsBar = window.find(".tools-options-bar");
		this.els.sideBar = window.find(".sidebar-wrapper");
		this.els.statusBar = window.find(".status-bar");
		this.els.rulerTop = window.find(".ruler-top");
		this.els.rulerLeft = window.find(".ruler-left");

		this.cvs = window.find("canvas");
		this.ctx = this.cvs[0].getContext("2d");

		this.cvsBg = new Image;
		this.cvsBg.onload = () => this.cvsBgPattern = this.ctx.createPattern(this.cvsBg, "repeat");
		this.cvsBg.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMElEQVQ4T2P8////fwY8YM+ePfikGRhHDRgWYbB792686cDFxQV/Ohg1gIFx6IcBAPU7UXHPhMXmAAAAAElFTkSuQmCC";
		

		this.cvs.prop({
			width: window.width,
			height: window.height,
		});

		// reset
		this.dispatch({ type: "window.resize" });

		this.stack = [
			{ type: "reset-canvas" },
			{ type: "set-canvas", w: 600, h: 460, scale: 1 },
			{ type: "draw-base-layer", fill: "#fff" },
			// { type: "draw-base-layer", fill: "transparent" },
			// { type: "draw-rect", x: 40, y: 50, w: 200, h: 140, fill: "red" },
			// { type: "draw-rect", x: 140, y: 150, w: 200, h: 140, stroke: "blue", width: 5 },
			{ type: "draw-text", x: 140, y: 150, fill: "blue", size: 52, font: "Arial", text: "Defiant" },
		];

		setTimeout(() => this.stack.map(item => this.dispatch(item)), 200);

		// temp
		//this.dispatch({ type: "draw-rect", x: 160, y: 250, w: 460, h: 340 });
	},
	dispatch(event) {
		let self = Canvas,
			pi2 = Math.PI * 2,
			x, y, w, h,
			pattern,
			el;

		// save paint context
		self.ctx.save();
		self.ctx.translate(self.oX, self.oY);

		switch (event.type) {
			case "window.resize":
				break;
			case "reset-canvas":
				self.cX = (window.width - self.els.sideBar.width() + self.els.rulerLeft.width()) / 2;
				self.cY = (window.height + self.els.toolBar.height() + self.els.optionsBar.height() + self.els.rulerTop.height() - self.els.statusBar.height()) / 2;
				self.ctx.clearRect(0, 0, 1e4, 1e4);
				break;
			case "set-canvas":
				self.w = event.w;
				self.h = event.h;
				self.oX = self.cX - (self.w / 2);
				self.oY = self.cY - (self.h / 2);
				self.scale = event.scale;

				self.bgColor = "#000"
				self.fgColor = "#fff"
				self.lineWidth = 1;
				break;
			case "set-scale":
				self.scale = event.scale;
				break;
			case "draw-base-layer":
				self.ctx.fillStyle = event.fill === "transparent" ? self.cvsBgPattern : event.fill;
				self.ctx.fillRect(0, 0, self.w, self.h);
				break;
			case "draw-rect":
				if (event.fill) {
					self.ctx.fillStyle = event.fill;
					self.ctx.fillRect(event.x, event.y, event.w, event.h);
				} else {
					self.ctx.strokeStyle = event.stroke || self.fgColor;
					self.ctx.lineWidth = event.width || self.lineWidth;
					self.ctx.translate(.5, .5);
					self.ctx.beginPath();
					self.ctx.rect(event.x, event.y, event.w, event.h);
					self.ctx.stroke();
				}
				break;
			case "draw-text":
				self.ctx.translate(.5, .5);
				self.ctx.font = `${event.size}px ${event.font}`;
				self.ctx.fillStyle = event.fill;
				self.ctx.fillText(event.text, event.x, event.y);
				break;
		}
		// restore paint context
		self.ctx.restore();
	}
};
