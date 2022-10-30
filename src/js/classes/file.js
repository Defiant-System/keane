
class File {
	constructor(fsFile, opt={}) {
		// save reference to original FS file
		this._file = fsFile;

		// defaults
		this.scale = 1;
		this.width = opt.width || 1;
		this.height = opt.height || 1;
		this.bgColor = "#000000ff";
		this.fgColor = "#ffffffff";
		// this.lineWidth = 1;
		this.channels = "111"; // rgb
		this.rulers = {
			show: true,
			guides: {
				show: true,
				horizontal: [],
				vertical: [],
			}
		};

		// file canvas
		let { cvs, ctx } = Misc.createCanvas(this.width, this.height);
		this.cvs = cvs;
		this.ctx = ctx;
		// used as quick mask layer
		this.quickMask = Misc.createCanvas(this.width, this.height);
		this.quickMask.show = false;



		// undo history
		this.history = new window.History;

		// layers stack
		this.layers = [];

		let xStr = `<File name="${fsFile.base}" width="${this.width}" height="${this.height}" scale="${this.scale}">
					<Layers/></File>`;
		this.xData = $.xmlFromString(xStr).documentElement;

		let kind = fsFile.kind.startsWith("image/") ? fsFile.kind.split("/")[1] : fsFile.kind,
			content,
			layer,
			xLayer;

		// handle file types
		switch (kind) {
			case "jpg":
			case "jpeg":
			case "gif":
			case "png":
				content = { type: "image", blob: fsFile.blob };
				this.dispatch({ content, type: "add-layer" });
				break;
			case "psd":
				content = { type: "fill", color: opt.fill || "#ffffff" };
				this.dispatch({ content, type: "add-layer" });
				break;
		}

		// select top layer as default
		this._activeLayer = this.layers[0];
		// this.activeLayerIndex = 0;

		// initiate canvas
		this.dispatch({ type: "set-canvas", width: this.width, height: this.height });

		// render file
		this.render();
	}

	get activeLayer() {
		return this._activeLayer;
	}

	setActiveLayer(id) {
		this._activeLayer = this.layers.find(layer => layer.id === id);
	}

	get isReady() {
		return this.layers.filter(layer => !layer._ready).length === 0;
	}

	render(opt={}) {
		// don't render if layers are not ready
		if (!this.isReady) return;

		// clear canvas
		this.cvs.prop({ width: this.oW, height: this.oH });

		// re-paints layers stack
		this.layers.map(layer => {
			if (!layer.visible) return;

			switch (layer.type) {
				case "layer":
					// event object is layer - add to file canvas
					this.ctx.drawImage(layer.cvs[0], 0, 0);
					break;
			}
		});

		// render projector
		Projector.render(opt);
		// update channels
		if (!opt.noEmit) this.updateChannelThumbnails();
	}

	updateChannelThumbnails() {
		keane.sidebar.channels.els.channelsList.find("canvas").map(cvs => {
			let el = $(cvs),
				ctx = cvs.getContext("2d", { willReadFrequently: true }),
				width = cvs.offsetWidth || 32,
				height = cvs.offsetHeight || 32,
				ratio = this.width / this.height,
				// calculate dimensions
				tW = ratio < 1 ? (height * ratio) : width,
				tH = ratio < 1 ? height : (width / ratio),
				pX = (width - tW) >> 1,
				pY = (height - tH) >> 1;

			// set height & width of channel canvas
			el.prop({ width, height });
			// checkers background
			Rulers.drawCheckers(ctx, {
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
				.then(img => {
					ctx.drawImage(img, pX, pY);

					let channel = el.parents(".row").data("channel"),
						c = ["red", "green", "blue"].indexOf(channel);

					if (channel !== "rgb") {
						let cImg = ctx.getImageData(pX, pY, tW, tH),
							data = cImg.data,
							il = data.length,
							i = 0;
						for (; i<il; i+=4) {
							data[i]   = data[i+c];
							data[i+1] = data[i+c];
							data[i+2] = data[i+c];
						}
						ctx.putImageData(cImg, pX, pY);
					}
				})
				.catch(e => null); // TODO: handle errors
		});
	}

	dispatch(event) {
		let APP = keane,
			Proj = Projector,
			uniqId,
			content,
			layer,
			xLayer,
			el;
		//console.log(event);
		switch (event.type) {
			// system event
			case "window.resize":
				this.width = this.oW * this.scale;
				this.height = this.oH * this.scale;
				// origo
				this.oX = Math.round(Proj.cX - (this.width >> 1));
				this.oY = Math.round(Proj.cY - (this.height >> 1));
				break;
			// custom events
			case "resize-file":
				// set file dimension if not set
				this.width = event.width || this.width;
				this.height = event.height || this.height;

				this.dispatch({ type: "set-canvas" });
				break;
			case "set-canvas":
				// set file dimension if not set
				this.width = this.width || event.width;
				this.height = this.height || event.height;
				// original dimension
				this.oW = event.width;
				this.oH = event.height;
				this.cvs.prop({ width: this.oW, height: this.oH });
				// resize quickmask canvas
				this.quickMask.cvs.prop({ width: this.oW, height: this.oH });

				// reset projector
				Proj.reset(this);

				if (!event.scale) {
					// default to first zoom level
					event.scale = .125;
					// iterate available zoom levels
					ZOOM.filter(z => z.level <= 100)
						.map(zoom => {
							let scale = zoom.level / 100;
							if (Proj.aW > event.width * scale && Proj.aH > event.height * scale) {
								event.scale = scale;
							}
						});
				}
				// auto set scale for file; fixes framing if image is larger than available dimensions
				this.dispatch({ ...event, type: "set-scale" });

				// render canvas
				// this.render();
				break;
			case "set-scale":
				// scaled dimension
				this.scale = event.scale;
				this.width = this.oW * this.scale;
				this.height = this.oH * this.scale;
				// origo
				this.oX = Math.round(Proj.cX - (this.width >> 1));
				this.oY = Math.round(Proj.cY - (this.height >> 1));

				if (!event.noRender) {
					// render file
					this.render();
					// Proj.render();
				}
				break;
			case "pan-canvas":
				// console.log( event );
				this.oX = (Number.isInteger(event.left)
						? event.left
						: this.width > Proj.aW ? Proj.cX - (this.width >> 1) + event.x : false) || this.oX;
				this.oY = (Number.isInteger(event.top)
						? event.top
						: this.height > Proj.aH ? Proj.cY - (this.height >> 1) + event.y : false) || this.oY;
				// render projector canvas
				Proj.render({ noEmit: event.noEmit });
				break;

			case "select-layer":
				this.setActiveLayer(event.id);
				break;
			case "add-layer":
				uniqId = `l${Date.now()}`;
				content = { uniqId, ...event.content };
				layer = new Layer(this, content);
				this.layers.push(layer);
				// add layer data to xml
				xLayer = $.nodeFromString(`<i type="layer" state="visible" id="${uniqId}" name="${layer.name}"/>`);
				this.xData.selectSingleNode("Layers").appendChild(xLayer);
				// return layer
				return layer;
			case "toggle-layer-visibility":
				layer = this.layers.find(layer => layer.id === event.id);
				layer.visible = event.value;

				// render file
				this.render();
				break;
		}
	}
}
