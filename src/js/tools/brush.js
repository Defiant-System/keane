
// TOOLS.brush

{
	init() {
		// default option
		this.option = "brush";

		let xShape = window.bluePrint.selectSingleNode("//TipShapes/*");

		// default preset
		this.preset = {
			name      : xShape.getAttribute("name"),
			roundness : +xShape.getAttribute("roundness"),
			angle     : +xShape.getAttribute("angle"),
			size      : +xShape.getAttribute("size"),
			tip       : Canvas.createCanvas(1, 1),
		};
	},
	dispatch(event) {
		let APP = photoshop,
			Self = TOOLS.brush,
			Drag = Self.drag,
			_floor = Math.floor,
			_round = Math.round,
			_canvas = Canvas,
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
				// prevent default behaviour
				event.preventDefault();

				// prepare paint
				Self.drag = {
					ctx: _canvas.osCtx,
					clickX: event.offsetX,
					clickY: event.offsetY,
					mX: _floor((event.offsetX - _canvas.oX) / _canvas.scale),
					mY: _floor((event.offsetY - _canvas.oY) / _canvas.scale),
					scale: _canvas.scale,
					coX: _canvas.oX,
					coY: _canvas.oY,
					preset: {
						...Self.preset,
						oX: _floor(Self.preset.size / 2),
						oY: _floor(Self.preset.size / 2),
						image: Self.preset.tip.cvs[0],
					},
					// Bresenham's line algorithm
					line: (...args) => Misc.bresenhamLine(...args)
				};

				// trigger first paint
				Self.dispatch({ type: "mousemove" });

				// prevent mouse from triggering mouseover
				APP.els.content.addClass("no-cursor");
				// bind event handlers
				_canvas.doc.on("mousemove mouseup", Self.dispatch);
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

				// clear and transfer to canvas
				_canvas.cvs.prop({ width: window.width, height: window.height });
				_canvas.dispatch({ type: "update-canvas", noZoom: true });

				// same mouse point
				Drag.oldX = Drag.mX;
				Drag.oldY = Drag.mY;
				break;
			case "mouseup":
				// remove class
				APP.els.content.removeClass("no-cursor");
				// unbind event handlers
				_canvas.doc.off("mousemove mouseup", Self.dispatch);
				break;
			// custom events
			case "select-option":
				Self.option = event.arg || "brush";
				break;
			case "select-preset-tip":
				el = APP.els.content.find(".option[data-change='select-preset-tip']");
				// get brush tip details
				name      = event.arg       ||  el.data("name")      || Self.preset.name;
				size      = event.size      || +el.data("size")      || Self.preset.size;
				roundness = event.roundness || +el.data("roundness") || Self.preset.roundness;
				angle     = event.angle     || +el.data("angle")     || Self.preset.angle;

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

				let y = (size - height) * .5,
					hS = size / 2;
				Self.preset.tip.cvs.prop({ width: size, height: size });
				Self.preset.tip.ctx.translate(hS, hS);
				Self.preset.tip.ctx.rotate(angle * Math.PI / 180);
				Self.preset.tip.ctx.translate(-hS, -hS);
				Self.preset.tip.ctx.drawImage(Self.preset.tipImage, 0, y, size, height);
				Self.preset.tip.ctx.globalCompositeOperation = "source-atop"; // difference
				Self.preset.tip.ctx.fillStyle = _canvas.fgColor;
				Self.preset.tip.ctx.fillRect(0, 0, size, size);
				break;
			case "change-mode":
				console.log(event);
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
				console.log(event);
				break;
			case "change-flow":
				console.log(event);
				break;
			case "enable":
				// auto load preset tip
				Self.dispatch({ type: "select-preset-tip", ...this.preset });

				_canvas.cvs.on("mousedown", Self.dispatch);
				break;
			case "disable":
				_canvas.cvs.off("mousedown", Self.dispatch);
				break;
		}
	}
}
