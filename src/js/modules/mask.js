
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

		// init ants
		this.ants.init();
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
			x, y, w, h,
			data,
			image,
			el;
		switch (event.type) {
			case "select-rect":
				x = event.rect.x * File.scale;
				y = event.rect.y * File.scale;
				w = event.rect.w * File.scale;
				h = event.rect.h * File.scale;
				Self.clear(event.method);
				Self.ctx.fillRect(x, y, w, h);
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
				// broadcast event
				karaqu.emit("selection-cleared");
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
				// reset canvas
				Self.cvs.prop({ width: File.width, height: File.height, });

				Self.ctx.drawImage(File.activeLayer.cvs[0], 0, 0);
				data = Self.ctx.getImageData(0, 0, File.width, File.height).data;

				// clear marquee canvas (fastest way)
				Self.ctx.clear(event.method);

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
		let w = image.width,
			h = image.height,
			imgData = image.ctx.createImageData(w, h),
			res = imgData.data,
			data = image.mask.data,
			bounds = image.mask.bounds,
			maskW = image.mask.width,
			rgba = [0, 0, 0, 255];
		// loop pixel data
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
		// draw masked on Mask canvas
		image.ctx.putImageData(imgData, 0, 0);
		// broadcast event
		karaqu.emit("mouse-move", {
			isSelecting: true,
			x: bounds.minX.toString(),
			y: bounds.minY.toString(),
			w: bounds.maxX - bounds.minX + 1,
			h: bounds.maxY - bounds.minY + 1,
		});
	}
};
