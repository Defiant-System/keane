
// keane.tools.brush

{
	init() {
		// default option
		this.option = "brush";
		// default feather options
		this.feather = {
			brush: "sketchy",
			blend: "source-over",
			pressure: 50,
			size: 1,
		};

		let xShape = window.bluePrint.selectSingleNode("//TipShapes/*");

		// default preset
		this.preset = {
			name      : xShape.getAttribute("name"),
			roundness : +xShape.getAttribute("roundness"),
			angle     : +xShape.getAttribute("angle"),
			size      : +xShape.getAttribute("size"),
			tip       : Misc.createCanvas(1, 1),
			blend     : "normal",
			opacity   : 1,
		};

		// subscribe to events
		karaqu.on("set-fg-color", this.dispatch);
	},
	dispatch(event) {
		let APP = keane,
			Proj = Projector,
			File = Proj.file,
			Self = APP.tools.brush,
			_floor = Math.floor,
			_round = Math.round,
			name,
			size,
			tip,
			image,
			width,
			height,
			roundness,
			angle,
			el;

		switch (event.type) {
			// native events
			case "mousedown":
				Self[`${Self.option}Tool`](event);
				break;

			// subscribed events
			case "set-fg-color":
				File.fgColor = event.detail.hex;
				// resize / rotate tip
				Self.dispatch({ type: "resize-rotate-tip" });
				break;

			// custom events
			case "select-color":
			case "switch-color":
			case "reset-color":
				console.log(event);
				break;
			case "select-preset-tip":
				el = APP.els.content.find(".option[data-change='select-preset-tip']");
				// get brush tip details
				name      = event.arg       ||  el.data("name")      || Self.preset.name;
				size      = event.size      || +el.data("size")      || Self.preset.size;
				roundness = event.roundness || +el.data("roundness") || Self.preset.roundness;
				angle     = event.angle     || +el.data("angle")     || Self.preset.angle;

				// prepare to load image into tip-canvas
				Self.preset.tipImage = new Image(size, size);
				Self.preset.name = name;
				Self.preset.tipImage.onload = () => {
					// resize / rotate tip
					Self.dispatch({ type: "resize-rotate-tip" });
					// callback if any
					if (event.callback) event.callback();
				};
				
				// load tip image
				Self.preset.tipImage.src = "~/icons/brush-preset-"+ Self.preset.name +".png";
				// update toolbar
				el.find(".tip-icon").css({"background-image": `url(${Self.preset.tipImage.src})`});
				el.find(".value span").html(size + el.data("suffix"));
				// update toolbar option
				el.data({ name, size, roundness, angle });
				break;
			case "resize-rotate-tip":
				// resize tip canvas
				size = Self.preset.size;
				angle = event.angle || Self.preset.angle;
				roundness = event.roundness || Self.preset.roundness;
				height = _round(size * (roundness / 100));

				let y = (size - height) >> 1,
					hS = size >> 1;
				Self.preset.tip.cvs.prop({ width: size, height: size });
				Self.preset.tip.ctx.translate(hS, hS);
				Self.preset.tip.ctx.rotate(angle * Math.PI / 180);
				Self.preset.tip.ctx.translate(-hS, -hS);
				Self.preset.tip.ctx.drawImage(Self.preset.tipImage, 0, y, size, height);
				Self.preset.tip.ctx.globalCompositeOperation = "source-atop"; // difference
				Self.preset.tip.ctx.fillStyle = File ? File.fgColor : "#fff";
				Self.preset.tip.ctx.fillRect(0, 0, size, size);
				break;
			case "change-blend-mode":
				Self.preset.blend = event.value.toLowerCase().replace(/ /g, "-");
				break;
			case "change-size":
				width =
				height =
				Self.preset.size = event.value;

				// resize tip canvas
				Self.preset.tip.cvs.prop({ width, height });
				Self.preset.tip.ctx.drawImage(Self.preset.tipImage, 0, 0, width, height);

				// update toolbar
				el = APP.els.content.find(".option[data-change='select-preset-tip']");
				el.find(".value span").html(event.value + el.data("suffix"));
				break;
			case "change-hardness":
				console.log(event);
				break;
			case "change-opacity":
				Self.preset.opacity = event.value / 100;
				break;
			case "change-flow":
				console.log(event);
				break;
			// FEATHER
			case "change-feather-mode":
				Self.feather.brush = event.value.toLowerCase();
				break;
			case "change-feather-blend-mode":
				Self.feather.blend = event.value;
				break;
			case "change-feather-size":
				Self.feather.size = event.value;
				break;
			case "change-feather-pressure":
				Self.feather.pressure = event.value;
				break;

			case "select-option":
				Self.option = event.arg || Self.option || "brush";
				break;
			case "enable":
				// auto load preset tip
				Self.dispatch({ type: "select-preset-tip", ...this.preset });

				Proj.cvs.on("mousedown", Self.dispatch);
				break;
			case "disable":
				Proj.cvs.off("mousedown", Self.dispatch);
				break;
		}
	},
	pencilTool(event) {
		return console.log("pencil", event);
	},
	brushTool(event) {
		let APP = keane,
			Proj = Projector,
			File = Proj.file,
			Self = APP.tools.brush,
			Drag = Self.drag,
			_floor = Math.floor,
			_round = Math.round,
			size,
			image;

		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// clear paint canvas
				Proj.swap.cvs.prop({ width: File.oW, height: File.oH });

				// prepare paint
				Self.drag = {
					layer: File.activeLayer,
					ctx: Proj.swap.ctx,
					cvs: Proj.swap.cvs[0],
					mX: _floor((event.offsetX - File.oX) / File.scale),
					mY: _floor((event.offsetY - File.oY) / File.scale),
					scale: File.scale,
					coX: File.oX,
					coY: File.oY,
					preset: {
						...Self.preset,
						oX: _floor(Self.preset.size >> 1),
						oY: _floor(Self.preset.size >> 1),
						image: Self.preset.tip.cvs[0],
					},
					// Bresenham's line algorithm
					line: (...args) => Misc.bresenhamLine(...args)
				};

				// set blend mode
				Self.drag.layer.ctx.globalCompositeOperation = Self.preset.blend;
				// buffer layer image data before edit
				File.activeLayer.bufferImageData();
				// trigger first paint
				Self.brushTool({ type: "mousemove" });
				// prevent mouse from triggering mouseover
				APP.els.content.addClass("no-cursor");
				// bind event handlers
				Proj.doc.on("mousemove mouseup", Self.brushTool);
				break;
			case "mousemove":
				if (event.offsetX) {
					Drag.mX = _floor((event.offsetX - Drag.coX) / Drag.scale);
					Drag.mY = _floor((event.offsetY - Drag.coY) / Drag.scale);
				}
				// center the tip
				Drag.mX -= Drag.preset.oX;
				Drag.mY -= Drag.preset.oY;

				// prevents painting same are when zoomed in
				if (Drag.oldX === Drag.mX && Drag.oldY === Drag.mY) return;

				size = Drag.preset.size;
				image = Drag.preset.image;
				Drag.line(Drag.oldX || Drag.mX, Drag.oldY || Drag.mY, Drag.mX, Drag.mY, (x, y) =>
					Drag.ctx.drawImage(image, 0, 0, size, size, x, y, size, size));

				// pass paint buffer to layer
				Drag.layer.addBuffer(Drag.cvs, Self.preset.opacity);

				// render file - noEmit = true
				File.render({ noEmit: true });

				// same mouse point
				Drag.oldX = Drag.mX;
				Drag.oldY = Drag.mY;
				break;
			case "mouseup":
				// remove class
				APP.els.content.removeClass("no-cursor");
				// unbind event handlers
				Proj.doc.off("mousemove mouseup", Self.brushTool);
				// commit changes to layer
				Drag.layer.updateThumbnail();
				// render file
				File.render();
				break;
		}
	},
	featherTool(event) {
		let APP = keane,
			Proj = Projector,
			File = Proj.file,
			Self = APP.tools.brush,
			Drag = Self.drag,
			_floor = Math.floor,
			_round = Math.round,
			size,
			image;
		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// clear paint canvas
				Proj.swap.cvs.prop({ width: File.oW, height: File.oH });

				let opt = {
						width: File.oW,
						height: File.oH,
						ctx: Proj.swap.ctx,
						cvs: Proj.swap.cvs[0],
						fgColor: File.fgColor,
						bgColor: File.bgColor,
						size: Self.feather.size,
						pressure: Self.feather.pressure,
						blend: Self.feather.blend,
					};
				// prepare paint
				Self.drag = {
					layer: File.activeLayer,
					brush: Self.featherTip(Self.feather.brush, opt),
					mX: _floor((event.offsetX - File.oX) / File.scale),
					mY: _floor((event.offsetY - File.oY) / File.scale),
					scale: File.scale,
					coX: File.oX,
					coY: File.oY,
				};
				// buffer layer image data before edit
				File.activeLayer.bufferImageData();
				// trigger first paint
				Self.drag.brush.strokeStart(Self.drag.mX, Self.drag.mY);
				// prevent mouse from triggering mouseover
				APP.els.content.addClass("no-cursor");
				// bind event handlers
				Proj.doc.on("mousemove mouseup", Self.featherTool);
				break;
			case "mousemove":
				if (event.offsetX) {
					Drag.mX = _floor((event.offsetX - Drag.coX) / Drag.scale);
					Drag.mY = _floor((event.offsetY - Drag.coY) / Drag.scale);
				}
				// paint with brush
				Drag.brush.stroke(Self.drag.mX, Self.drag.mY);
				// pass paint buffer to layer
				Drag.layer.addBuffer(Drag.brush.cvs);
				// render file - noEmit = true
				File.render({ noEmit: true });
				break;
			case "mouseup":
				// signal mouseup
				Drag.brush.strokeEnd();
				// remove class
				APP.els.content.removeClass("no-cursor");
				// unbind event handlers
				Proj.doc.off("mousemove mouseup", Self.featherTool);
				// commit changes to layer
				Drag.layer.updateThumbnail();
				// render file
				File.render();
				break;
		}
	},
	featherTip(type, opt) {
		@import "feather/chrome.js"
		@import "feather/circles.js"
		@import "feather/fur.js"
		@import "feather/grid.js"
		@import "feather/longfur.js"
		@import "feather/ribbon.js"
		@import "feather/shaded.js"
		@import "feather/simple.js"
		@import "feather/sketchy.js"
		@import "feather/squares.js"
		@import "feather/web.js"

		let tips = {
				chrome: Chrome,
				circles: Circles,
				fur: Fur,
				grid: Grid,
				longfur: Longfur,
				ribbon: Ribbon,
				shaded: Shaded,
				simple: Simple,
				sketchy: Sketchy,
				squares: Squares,
				web: Web,
			};

		return new tips[type](opt);
	}
}
