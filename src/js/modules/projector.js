
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
		this.ctx = this.cvs[0].getContext("2d");
		// publicly used swap canvas
		this.swap = Misc.createCanvas(1, 1);

		// bind event handlers
		this.cvs.on("mousemove", this.dispatch);

		// checkers background
		return new Promise(resolve => {
			let image = new Image;
			image.onload = () => {
				Projector.checkers = Projector.ctx.createPattern(image, "repeat");
				resolve();
			};
			image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMElEQVQ4T2P8////fwY8YM+ePfikGRhHDRgWYbB792686cDFxQV/Ohg1gIFx6IcBAPU7UXHPhMXmAAAAAElFTkSuQmCC";
		});
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
			case "mousemove":
				data.top = _round(_min(_max(event.offsetY - File.oY, 0), File.height) / File.scale);
				data.left = _round(_min(_max(event.offsetX - File.oX, 0), File.width) / File.scale);
				data.offsetY = _min(_max(event.offsetY, File.oY), File.oY + File.height) - Self.aY;
				data.offsetX = _min(_max(event.offsetX, File.oX), File.oX + File.width) - Self.aX;
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

		this.aX = File.showRulers ? Rulers.t : 0;
		this.aY = this.els.toolBar.height() + this.els.optionsBar.height() + (File.showRulers ? Rulers.t : 0);
		this.aW = window.width - this.aX - this.els.sideBar.width() + (File.showRulers ? Rulers.t : 0);
		this.aH = window.height - this.aY - (File.showRulers ? Rulers.t : 0); // - this.els.statusBar.height()
		// center
		this.cX = (window.width + this.aX - this.els.sideBar.width()) >> 1;
		this.cY = (window.height + this.aY - this.els.statusBar.height()) >> 1;

		// pre-render frame
		// this.renderFrame(File);

		if (this.file !== File) {
			// reference to displayed file
			this.file = File;
			// emit event
			karaqu.emit("file-selected");
		}
	},
	drawCheckers(ctx, opt) {
		let cfg = {
				size: 8,
				pX: 0,
				pY: 0,
				oX: 0,
				oY: 0,
				x: 0,
				y: 0,
				w: 16,
				h: 16,
				...opt,
			},
			lX = cfg.w % cfg.size,
			lY = cfg.h % cfg.size,
			il = (cfg.w-lX) / cfg.size,
			jl = (cfg.h-lY) / cfg.size;
		ctx.save();
		if (cfg.oX < 0) {
			cfg.pX = cfg.oX % cfg.size;
			cfg.x = (cfg.pX - cfg.oX) / cfg.size;
			il = (il-lX) - cfg.x;
		}
		if (cfg.oY < 0) {
			cfg.pY = cfg.oY % cfg.size;
			cfg.y = (cfg.pY - cfg.oY) / cfg.size;
			jl = (jl-lY) - cfg.y;
		}
		for (let i=cfg.x; i<il; i++) {
			for (let j=cfg.y; j<jl; j++) {
				ctx.fillStyle = ((i + j) % 2) ? "#bbb" : "#fff";
				let x = i * cfg.size + cfg.pX,
					y = j * cfg.size + cfg.pY,
					w = cfg.size,
					h = cfg.size;
				if (i === il-1) w = lX;
				if (j === jl-1) h = lY;
				ctx.fillRect(x, y, w, h);
			}
		}
		ctx.restore();
	},
	render(opt={}) {
		// reference to displayed file
		let File = this.file,
			w = File.width,
			h = File.height,
			oX = File.oX,
			oY = File.oY;
		opt.imgCvs = opt.imgCvs || File.cvs[0];

		console.time("Projector Render");
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
		// checkers background
		this.drawCheckers(this.ctx, { w, h, oX, oY });

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
		console.timeEnd("Projector Render");

		if (File.showRulers) {
			// Rulers.render(this);
		}
		if (!opt.noEmit) {
			// emit event
			karaqu.emit("projector-update");
		}
	}
};
