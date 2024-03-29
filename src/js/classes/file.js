
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
		this._channels = "111"; // rgb
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

		let xStr = `<File name="${fsFile.base}">
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

	get channels() {
		return this._channels;
	}

	set channels(val) {
		// render color channels
		let Proj = Projector,
			cImg = this.ctx.getImageData(0, 0, this.oW, this.oH),
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
			ch = hash[val].split("").map(i => +i),
			il = data.length,
			i = 0;
		// reset swap canvas
		Proj.swap.cvs.prop({ width: this.oW, height: this.oH });

		for (; i<il; i+=4) {
			rgb = [0, data[i], data[i+1], data[i+2]];
			data[i]   = rgb[ch[0]];
			data[i+1] = rgb[ch[1]];
			data[i+2] = rgb[ch[2]];
		}
		Proj.swap.ctx.putImageData(cImg, 0, 0);
		// save value
		this._channels = val;
		// trigger file render
		this.render({ imgCvs: Proj.swap.cvs[0] });
	}

	flip(dir, active) {
		if (active === "layer") this.activeLayer.flip(dir);
		else this.layers.map(layer => layer.flip(dir));
	}

	rotate(dir, active) {
		let nW, nH, deg;
		switch(dir) {
			case "rotate90cw":  nW = this.height; nH = this.width;  deg = 90;  break;
			case "rotate90ccw": nW = this.height; nH = this.width;  deg = -90; break;
			case "rotate180":   nW = this.width;  nH = this.height; deg = 180; break;
		}
		if (active === "layer") {
			this.activeLayer.rotate(dir, nH, nW, deg);
		} else {
			// signal all layers
			this.layers.map(layer => layer.rotate(dir, nW, nH, deg));
			// update internal dimensions
			this.width = this.oW = nW;
			this.height = this.oH = nH;
			this.cvs.prop({ width: nW, height: nH });
			this.quickMask.cvs.prop({ width: nW, height: nH });
			// reset scale & offset position
			this.dispatch({ type: "scale-at", scale: this.scale });
		}
		this.render();
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
			content,
			layer,
			xLayer,
			oX, oY,
			id,
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

				this.dispatch({ ...event, type: "set-canvas" });
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
				this.dispatch({ ...event, type: "scale-at" });

				// render canvas
				// this.render();
				break;
			case "scale-at":
				let newScale = event.scale,
					scaleChange = newScale - this.scale,
					zoomX = event.zoomX != undefined ? event.zoomX : ((Proj.aW * .5) - (this.oX || 0)),
					zoomY = event.zoomY != undefined ? event.zoomY : ((Proj.aH * .5) - (this.oY || 0)),
					width = Math.round(this.oW * newScale),
					height = Math.round(this.oH * newScale);
				
				oX = (zoomX / this.scale) * -scaleChange;
				oY = (zoomY / this.scale) * -scaleChange;

				this.scale = event.scale || this.scale;
				this.oX += oX;
				this.oY += oY;
				this.width = width;
				this.height = height;
				// set reference to file
				Proj.file = this;

				// constrainsts
				if (width > Proj.aW && this.oX > 0) this.oX = 0;
				if (height > Proj.aH && this.oY > 0) this.oY = 0;
				if (this.width + this.oX < Proj.aW) this.oX = Proj.aW - this.width;
				if (this.height + this.oY < Proj.aH) this.oY = Proj.aH - this.height;
				// make sure image is centered
				if (width < Proj.aW) this.oX = ((Proj.aW - width) * .5) + Proj.aX;
				if (height < Proj.aH) this.oY = ((Proj.aH - height) * .5) + Proj.aY;

				this.oX = Math.round(this.oX);
				this.oY = Math.round(this.oY);

				if (!event.noRender) {
					// render file
					this.render();
				}
				break;
			// case "set-scale":
			// 	// scaled dimension
			// 	this.scale = event.scale;
			// 	this.width = this.oW * this.scale;
			// 	this.height = this.oH * this.scale;
			// 	// origo
			// 	this.oX = Math.round(Proj.cX - (this.width >> 1));
			// 	this.oY = Math.round(Proj.cY - (this.height >> 1));

			// 	if (!event.noRender) {
			// 		// render file
			// 		this.render();
			// 	}
			// 	break;
			case "pan-canvas":
				// console.log( event );
				oX = Number.isInteger(event.left)
					? event.left
					: this.width > Proj.aW ? Proj.cX - (this.width >> 1) + event.x : false;
				oY = Number.isInteger(event.top)
					? event.top
					: this.height > Proj.aH ? Proj.cY - (this.height >> 1) + event.y : false;
				if (Number.isInteger(oX)) this.oX = oX;
				if (Number.isInteger(oY)) this.oY = oY;
				// render projector canvas
				Proj.render({ noEmit: event.noEmit });
				break;

			case "select-layer":
				this.setActiveLayer(event.id);
				break;
			case "add-layer":
				id = `l${Date.now()}`;
				content = { id, ...event.content, vector: [] };
				// add layer data to xml
				xLayer = $.nodeFromString(`<i type="${content.type}" state="visible" id="${id}"/>`);
				this.xData.selectSingleNode("Layers").appendChild(xLayer);

				// temp solution for working on shapes section of the app
				if (content.type === "vector") {
					window.bluePrint.selectNodes(`//TempShapeLayer/*`).map(xShape => xLayer.appendChild(xShape));
				}
				layer = new Layer(this, content);
				this.layers.push(layer);
				// name of the layer
				xLayer.setAttribute("name", layer.name);
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
