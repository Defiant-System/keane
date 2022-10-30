
const Projector = {
	init() {
		// fast references
		this.doc = $(document);
		this.els = {
			toolBar    : window.find(".tools-bar"),
			optionsBar : window.find(".tools-options-bar"),
			sideBar    : window.find(".sidebar-wrapper"),
			statusBar  : window.find(".status-bar"),
		};
		// canvases
		this.cvs = window.find(".cvs-wrapper .canvas");
		this.ctx = this.cvs[0].getContext("2d", { willReadFrequently: true });
		// publicly used swap canvas
		this.swap = Misc.createCanvas(1, 1);

		// bind event handlers
		this.cvs.on("mousemove", this.dispatch);
	},
	dispatch(event) {
		let APP = keane,
			Self = Projector,
			File = Self.file,
			_max = Math.max,
			_min = Math.min,
			_round = Math.round,
			data = {},
			el;

		switch (event.type) {
			// native events
			case "window.resize":
				Self.reset(Self.file);
				Self.render({ noEmit: true });
				break;
			case "mousemove":
				data.top = _round(_min(_max(event.offsetY - File.oY, 0), File.height) / File.scale);
				data.left = _round(_min(_max(event.offsetX - File.oX, 0), File.width) / File.scale);
				data.offsetY = _min(_max(event.offsetY, File.oY), File.oY + File.height) - Self.aY;
				data.offsetX = _min(_max(event.offsetX, File.oX), File.oX + File.width) - Self.aX;
				data.isSelection = Mask.ctx.getImageData(data.left, data.top, 1, 1).data[3] > 0;
				data.isOnCanvas = event.offsetY >= File.oY && event.offsetY <= File.oY + File.height
								&& event.offsetX >= File.oX && event.offsetX <= File.oX + File.width;

				if (data.isOnCanvas) {
					let rgb = File.ctx.getImageData(data.left, data.top, 1, 1).data;
					data.rgb = { r: rgb[0], g: rgb[1], b: rgb[2], a: rgb[3] };
					data.hsl = ColorLib.rgbToHsl(data.rgb);
				}
				// broadcast event
				karaqu.emit("mouse-move", data);
				break;
		}
	},
	reset(File) {
		// reset canvases
		this.cvs.prop({ width: window.width, height: window.height });

		let rS = Rulers.t,
			sW = this.els.sideBar.width(),
			tH = this.els.toolBar.height(),
			oH = this.els.optionsBar.height(),
			sH = this.els.statusBar.height();

		this.aX = File.rulers.show ? rS : 0;
		this.aY = tH + oH + (File.rulers.show ? rS : 0);
		this.aH = window.height - this.aY - (File.rulers.show ? rS : 0); // - this.els.statusBar.height()
		this.aW = window.width - this.aX - sW + (File.rulers.show ? rS : 0);
		// used for checker background
		this.cDim = {
			sW,
			aX: this.aX,
			aY: this.aY,
			aW: this.aW + sW,
			aH: this.aH + rS,
		};
		// center
		this.cX = (window.width + this.aX - sW) >> 1;
		this.cY = (window.height + this.aY - sH) >> 1;

		if (this.file !== File) {
			// reference to displayed file
			this.file = File;
			// emit event
			karaqu.emit("file-selected");
			// broadcast event
			karaqu.emit("set-fg-color", { hex: File.fgColor });
			karaqu.emit("set-bg-color", { hex: File.bgColor });
		}
	},
	render(opt={}) {
		// reference to displayed file
		let Rule = Rulers,
			File = this.file,
			w = File.width,
			h = File.height,
			oX = File.oX,
			oY = File.oY;
		opt.imgCvs = opt.imgCvs || File.cvs[0];

		// console.time("Projector Render");
		// reset canvas
		this.ctx.clear();
		// this.cvs.attr({ width: this.cvs[0].width });

		this.ctx.save();
		this.ctx.translate(oX, oY);
		// drop shadow
		this.ctx.save();
		this.ctx.shadowOffsetX = 0;
		this.ctx.shadowOffsetY = 2;
		this.ctx.shadowBlur = 13;
		this.ctx.shadowColor = "#292929";
		this.ctx.fillRect(0, 0, w, h);
		this.ctx.restore();

		// console.time("Checkers");
		// checkers background
		Rule.drawCheckers(this.ctx, { w, h, oX, oY, ...this.cDim, isProjector: !0 });
		// console.timeEnd("Checkers");

		// render color channels
		if (File.channels !== "111") {
			this.swap.cvs.prop({ width: File.oW, height: File.oH });
			let cImg = File.ctx.getImageData(0, 0, File.oW, File.oH),
				data = cImg.data,
				rgb,
				hash = {
					"000": "000",
					"100": "111",
					"010": "222",
					"001": "333",
					"101": "103",
					"110": "120",
					"011": "023",
					"111": "123",
				},
				val = hash[File.channels].split("").map(i => +i),
				il = data.length,
				i = 0;
			for (; i<il; i+=4) {
				rgb = [0, data[i], data[i+1], data[i+2]];
				data[i]   = rgb[val[0]];
				data[i+1] = rgb[val[1]];
				data[i+2] = rgb[val[2]];
			}
			this.swap.ctx.putImageData(cImg, 0, 0);
			opt.imgCvs = this.swap.cvs[0];
		}

		// file canvas
		this.ctx.imageSmoothingEnabled = false;
		this.ctx.drawImage(opt.imgCvs, 0, 0, w, h);
		this.ctx.restore();

		if (Pref.grid.pixelGrid && File.scale > 12) Rule.drawPixelGrid(this);
		if (Pref.grid.show) Rule.drawGrid(this);
		if (File.rulers.guides.show && !opt.noGuideLines) Rule.drawGuides(this);
		if (File.rulers.show) Rule.render(this);
		// toggles file "quick mask" mode
		if (File.quickMask.show) this.ctx.drawImage(File.quickMask.cvs[0], oX, oY);
		// marching ants
		if (opt.ants) this.ctx.drawImage(opt.ants, oX, oY);
		// draws potential masking paths / polygons, etc
		if (opt.maskPath) this.ctx.drawImage(Mask.draw.cvs[0], oX, oY);

		// console.timeEnd("Projector Render");

		if (!opt.noEmit) {
			// emit event
			karaqu.emit("projector-update");
		}
	}
};
