
let Mask = {
	ants: @import "./mask/ants.js",
	magicWand: @import "./mask/magicWand.js",
	init() {
		let { cvs, ctx } = Misc.createCanvas(1, 1);
		this.cvs = cvs;
		this.ctx = ctx;
		// used to draw "future" mask (used by polygon, lasso, etc)
		this.draw = Misc.createCanvas(1, 1);

		// defaults
		this.ctx.fillStyle = "#000";
		this.threshold = 0xC0;

		{
			let { cvs, ctx } = Misc.createCanvas(1, 1);
			this.ants.cvs = cvs;
			this.ants.ctx = ctx;
		}

		// temp
		setTimeout(() => {
			// return;
			this.dispatch({ type: "select-rect", rect: { x: 200, y: 110, w: 130, h: 210 } });
			// this.dispatch({ type: "select-rect", rect: { x: 140, y: 90, w: 150, h: 220 }, method: "subtract" });
			// this.dispatch({ type: "select-rect", rect: { x: 140, y: 90, w: 150, h: 220 }, method: "union" });
			// this.dispatch({ type: "select-elliptic", elps: { x: 300, y: 150, rX: 70, rY: 90 } });
			// this.dispatch({ type: "select-elliptic", elps: { x: 250, y: 130, rX: 120, rY: 70 }, method: "union" });
			this.dispatch({ type: "select-polygon", points: [ 50, 50, 80, 40, 190, 70, 210, 240, 160, 170, 110, 160, 30, 190 ], method: "union" });
			// return;


			setTimeout(() =>  window.find(`.tool[data-click="toggle-quick-mask-mode"]`).trigger("click"), 700);

			// setTimeout(() => keane.dispatch({ type: "edit-action", arg: "stroke,#000000,center,6" }), 300);
			
			// setTimeout(() => this.dispatch({ type: "select-none" }), 220);
			// setTimeout(() => keane.dispatch({ type: "edit-action", arg: "fill,#ff0000" }), 200);

			// this.dispatch({ type: "inverse-selection" });

			// setTimeout(() => $(".def-desktop_").trigger("mousedown").trigger("mouseup"), 200);

			// setTimeout(() => this.dispatch({ type: "select-elliptic", elps: { x: 300, y: 220, rX: 70, rY: 90 } }), 300);
		}, 600);
	},
	clear(method) {
		let Proj = Projector,
			width = Proj.file.width,
			height = Proj.file.height;
		
		switch (method) {
			case "union":
				this.ctx.globalCompositeOperation = "source-over";
				break;
			case "subtract":
				this.ctx.globalCompositeOperation = "destination-out";
				break;
			case "intersect":
				this.ctx.globalCompositeOperation = "source-in";
				break;
			default:
				// replace
				this.ctx.globalCompositeOperation = "source-over";
				this.cvs.prop({ width, height });
				Proj.swap.cvs.prop({ width, height });
		}
		// halt ants, if marching (also clears canvas from existing ants)
		this.ants.halt(true);
	},
	dispatch(event) {
		let APP = keane,
			Proj = Projector,
			File = Proj.file,
			Self = Mask,
			data,
			image,
			el;
		switch (event.type) {
			case "select-rect":
				Self.clear(event.method);
				Self.ctx.fillRect(event.rect.x, event.rect.y, event.rect.w, event.rect.h);
				Self.ctx.fill();
				Self.ants.paint(true);
				break;
			case "select-elliptic":
				Self.clear(event.method);
				let eX = event.elps.x,
					eY = event.elps.y,
					rX = event.elps.rX,
					rY = event.elps.rY;
				Self.ctx.ellipse(eX, eY, rX, rY, 0, 0, Math.PI*2);
				Self.ctx.fill();
				Self.ants.paint(true);
				break;
			case "select-lasso":
			case "select-polygon":
				Self.clear(event.method);
				Self.ctx.beginPath();
				Self.ctx.moveTo(event.points.shift(), event.points.shift());
				while (event.points.length) {
					let x = event.points.shift(),
						y = event.points.shift();
					Self.ctx.lineTo(x, y);
				}
				Self.ctx.stroke();
				Self.ctx.fill();
				Self.ants.paint(true);
				break;

			case "select-all":
				Self.clear();
				// colorize mask
				Self.ctx.fillRect(0, 0, 1e9, 1e9);
				Self.ctx.fill();
				// march little ants!
				Self.ants.paint(true);
				break;
			case "select-none":
				Self.dispatch({ type: "deselect" });
				// update projector
				Projector.render({ noEmit: true });
				break;
			case "deselect":
				Self.clear();
				Mask.ants.halt();
				break;
			case "inverse-selection":
				// stop marching ants
				Self.ants.halt(true);
				// invert mask
				Self.ctx.globalCompositeOperation = "source-out";
				Self.ctx.fillRect(0, 0, 1e9, 1e9);
				// start marching ants
				Self.ants.paint(true);
				break;
			case "select-with-magic-wand":
				Self.ctx.drawImage(File.activeLayer.cvs[0], 0, 0);
				data = Self.ctx.getImageData(0, 0, File.width, File.height).data;
				// clear marquee canvas (fastest way)
				Self.ctx.clear();
				// prepare image data for algorithm
				image = {
					data,
					ctx: Self.ctx,
					width: File.width,
					height: File.height,
					threshold: 15,
					blurRadius: 5,
					bytes: 4,
				};
				// get mask
				image.mask = Self.magicWand.floodFill(image, event.oX, event.oY, null, true);
				if (image.mask) Self.magicWand.gaussBlurOnlyBorder(image, null);

				// apply mask to mask canvas
				Self.paintMask(image);
				// start marching ants
				Self.ants.paint(true);
				break;
		}
	},
	applyCompositeMask(opt) {
		let File = Projector.file;
		// stop marching ants, if marching
		this.ants.paint();
		// applies selection to "active layer"
		File.activeLayer.applyCompositeImage({ ...opt, image: this.cvs[0] });
		// Render file
		File.render();
	},
	paintMask(image) {
		// paint mask
		let w = image.width;
		let h = image.height;
		let imgData = image.ctx.createImageData(w, h);
		let res = imgData.data;
		let data = image.mask.data;
		let bounds = image.mask.bounds;
		let maskW = image.mask.width;
		let rgba = [0, 0, 0, 255];

		for (let y=bounds.minY; y<=bounds.maxY; y++) {
			for (let x=bounds.minX; x<=bounds.maxX; x++) {
				if (data[y * maskW + x] == 0) continue;
				let k = (y * w + x) * 4;
				res[k] = rgba[0];
				res[k + 1] = rgba[1];
				res[k + 2] = rgba[2];
				res[k + 3] = rgba[3];
			}
		}

		image.ctx.putImageData(imgData, 0, 0);
	}
};
