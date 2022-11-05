
class Layer {
	constructor(file, content) {
		// defaults
		this._file = file;
		this._ready = true;
		this._id = content.id || `l${Date.now()}`;
		this._blendingMode = "normal";
		this._opacity = 1;
		this._visible = true;

		this.name = content.name || "Untitled Layer";
		this.type = "layer";

		// dimensions
		this.width = file.width;
		this.height = file.height;

		let top = content.top || 0;
		let left = content.left || 0;
		let width = file.oW || file.width || 0;
		let height = file.oH || file.height || 0;

		// layer canvas
		let { cvs, ctx } = Misc.createCanvas(width, height);
		this.cvs = cvs;
		this.ctx = ctx;

		// layer contents
		switch (content.type) {
			case "fill":
				this.ctx.fillStyle = content.color;
				this.ctx.fillRect( left, top, width, height );
				requestAnimationFrame(() => this.updateThumbnail());
				break;
			case "text":
				break;
			case "vector":
				let htm = `<div class="vector-layer" style="width: ${file.oW}px; height: ${file.oH}px; top: ${file.oY}px; left: ${file.oX}px;"></div>`;
				// temp add above canvas - this will be rendered offscreen on canvas
				this.vdom = window.find(".cvs-wrapper").append(htm);
				// render SVG into virtual DOM node
				window.render({
					data: this._file.xData,
					match: `Layers/*[@id="${this._id}"]`,
					template: "vector-list-layer",
					target: this.vdom,
				});

				this.renderShapes();
				break;
			case "image":
				// prevent file render
				this._ready = false;
				// parse layer image blob
				this.parseImage(content);
				break;
		}
	}

	get id() {
		return this._id;
	}

	set id(value) {
		this._id = value;
	}

	get visible() {
		return this._visible;
	}

	set visible(value) {
		if (this._visible === !!value) return;
		this._visible = !!value;
	}

	renderShapes() {
		let shapes = this.vdom.find("svg:not(.transforming)"),
			last = shapes.length - 1;
		// clear canvas
		this.ctx.clear();
		// loop all shapes
		shapes.map((svg, index) => {
			let img = new Image,
				src = "data:image/svg+xml,"+ encodeURIComponent(svg.xml),
				w = parseInt(svg.style.width, 10),
				h = parseInt(svg.style.height, 10),
				x = parseInt(svg.style.left, 10),
				y = parseInt(svg.style.top, 10);
			// draw svg on canvas
			img.onload = () => {
				this.ctx.drawImage(img, x, y, w, h);
				if (index < last) return;
				// signal to update thumbnail
				this.updateThumbnail();
				// update file -> projector
				this._file.render();
			};
			img.src = src;
		});
	}

	flip(dir) {
		let img = this.cvs[0],
			matrix;
		switch (dir) {
			case "flipH": matrix = [-1, 0, 0, 1, img.width, 0]; break;
			case "flipV": matrix = [1, 0, 0, -1, 0, img.height]; break;
		}
		this.ctx.save();
		this.ctx.setTransform(...matrix);
		this.ctx.drawImage(img, 0, 0);
		this.ctx.restore();
		// signal to update thumbnail
		this.updateThumbnail();
		// render file
		this._file.render();
	}

	rotate(dir, nW, nH, deg) {
		let oW = this.width,
			oH = this.height,
			tmp = Misc.createCanvas(oW, oH);
		// save current canvas
		tmp.ctx.drawImage(this.cvs[0], 0, 0);
		// rotate
		this.cvs.prop({ width: nW, height: nH });
		this.ctx.translate(nW/2, nH/2);
		this.ctx.rotate(deg * Math.PI/180);
		this.ctx.drawImage(tmp.cvs[0], -oW/2, (-oH/2));
		// update dim
		this.width = nW;
		this.height = nH;
		// signal to update thumbnail
		this.updateThumbnail();
	}

	updateThumbnail() {
		// let index = this._file.activeLayerIndex;
		let thumbCvsEl = keane.sidebar.layers.els.layerList.find(".row:nth-child(1) canvas");
		let tCtx = thumbCvsEl[0].getContext("2d", { willReadFrequently: true }),
			width = thumbCvsEl.prop("offsetWidth") || 32,
			height = thumbCvsEl.prop("offsetHeight") || 32,
			ratio = this.width / this.height,
			// calculate dimensions
			tW = ratio < 1 ? (height * ratio) : width,
			tH = ratio < 1 ? height : (width / ratio),
			pX = (width - tW) >> 1,
			pY = (height - tH) >> 1;
		
		// reset thumbnail canvas
		thumbCvsEl.prop({ width, height });
		
		// checkers background
		Rulers.drawCheckers(tCtx, {
			pX, pY,
			w: Math.floor(tW + pX),
			h: Math.floor(tH + pY),
			size: 4
		});

		// transfer layer image resized to thumbnail canvas
		let opt = {
				resizeWidth: Math.ceil(tW),
				resizeHeight: Math.ceil(tH),
				resizeQuality: "medium"
			};
		createImageBitmap(this.cvs[0], opt)
			.then(img => tCtx.drawImage(img, pX, pY))
			.catch(e => null);
	}

	async parseImage(content) {
		let src = URL.createObjectURL(content.blob),
			image = await this.loadImage(src),
			top = content.top || 0,
			left = content.left || 0,
			width = image.width || file.width,
			height = image.height || file.height;

		// set image dimensions
		this.width = width;
		this.height = height;

		// dispatch event to resize file canvas
		this._file.dispatch({ type: "resize-file", width, height });
		// reset canvas
		this.cvs.prop({ width, height });
		// apply image to canvas
		this.ctx.drawImage(image, left, top, width, height);
		// set file dimensions if not set
		if (!this._file.width || !this._file.height) {
			this._file.dispatch({ type: "set-canvas", width, height });
		}
		this.bufferImageData();
		this.updateThumbnail();
		// allow file render
		this._ready = true;
		// notify layer ready state
		this._file.render();
	}

	loadImage(url) {
		return new Promise(resolve => {
			let img = new Image;
			img.src = url;
			img.onload = () => resolve(img);
		});
	}

	putImageData(opt) {
		// TODO: pass data through "mask"

		this.ctx.putImageData(opt.data, opt.x || 0, opt.y || 0);
		// render file
		Projector.file.render({ noEmit: (opt.noEmit !== undefined) ? opt.noEmit : 1 });
	}

	bufferImageData() {
		// save reference image data
		this._imgData = this.ctx.getImageData(0, 0, this.width, this.height);
	}

	addBuffer(cvs, globalAlpha=1) {
		this.ctx.putImageData(this._imgData, 0, 0);
		this.ctx.globalAlpha = globalAlpha;
		this.ctx.drawImage(cvs, 0, 0);
	}

	applyCompositeImage(opt) {
		this.ctx.globalCompositeOperation = opt.operation || "source-over";
		this.ctx.drawImage(opt.image, 0, 0);
		this.updateThumbnail();
	}
}
