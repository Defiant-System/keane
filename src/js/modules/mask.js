
let Mask = {
	ants: @import "./mask/ants.js",
	magicWand: @import "./mask/magicWand.js",
	init() {
		let { cvs, ctx } = Misc.createCanvas(1, 1);
		this.cvs = cvs;
		this.ctx = ctx;

		// defaults
		this.ctx.fillStyle = "#000";
		this.threshold = 0xC0;

		// temp
		setTimeout(() => {
			return;
			this.dispatch({ type: "select-rect", rect: { x: 100, y: 40, w: 180, h: 120 } });
			// this.dispatch({ type: "select-elliptic", rect: { x: 100, y: 50, w: 70, h: 70 } });
			// this.dispatch({ type: "select-polygon", points: [ 50, 50, 80, 40, 190, 70, 160, 170, 120, 120, 60, 110 ] });

			// window.find(`.tool[data-click="toggle-quick-mask"]`).trigger("click");
		}, 900);
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
			case "toggle-quick-mask":
				console.log(event);
				break;

			case "select-rect":
				Self.cvs.prop({ width: File.width, height: File.height });
				Proj.swap.cvs.prop({ width: File.width, height: File.height });

				// this.ants.paint();
				// this.ctx.clear();
				Self.ctx.fillRect(event.rect.x, event.rect.y, event.rect.w, event.rect.h);
				Self.ctx.fill();
				Self.ants.paint(true);
				break;
			case "select-elliptic":
				Self.cvs.prop({ width: File.width, height: File.height });
				Proj.swap.cvs.prop({ width: File.width, height: File.height });

				let eW = event.rect.w,
					eH = event.rect.h,
					eX = event.rect.x + eW,
					eY = event.rect.y + eH;
				Self.ctx.ellipse(eX, eY, eW, eH, 0, 0, Math.PI*2);
				Self.ctx.fill();
				Self.ants.paint(true);
				break;
			case "select-polygon":
				Self.cvs.prop({ width: File.width, height: File.height });
				Proj.swap.cvs.prop({ width: File.width, height: File.height });

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
				Mask.paintMask(image);
				// start marching ants
				Mask.ants.paint(true);
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