
// TOOLS.brush

{
	init() {
		// default option
		this.option = "brush";
		// default preset
		this.preset = {
			name: "circle",
			size: 10,
			tip: Canvas.createCanvas(1, 1),
		};

		// auto load preset tip
		this.dispatch({ type: "select-preset-tip", arg: this.preset.name });

		//this.line(0, 0, 20, 10);
	},
	dispatch(event) {
		let APP = photoshop,
			Self = TOOLS.brush,
			Drag = Self.drag,
			_floor = Math.floor,
			_canvas = Canvas,
			size,
			tip,
			image,
			width,
			height,
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
					line: (x0, y0, x1, y1, cb) => {
						let dx = Math.abs(x1 - x0),
							dy = Math.abs(y1 - y0),
							sx = (x0 < x1) ? 1 : -1,
							sy = (y0 < y1) ? 1 : -1,
							err = dx - dy;
						while(true) {
							cb(x0, y0);
							if (x0 === x1 && y0 === y1) break;
							let e2 = 2 * err;
							if (e2 > -dy) { err -= dy; x0 += sx; }
							if (e2 < dx) { err += dx; y0 += sy; }
						}
					}
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
				Self.preset.name = event.arg || "circle";
				image = window.find("svg#brush-preset-"+ Self.preset.name)[0].xml
							.replace(/--color/ig, _canvas.fgColor);

				width = Self.preset.size;
				height = Self.preset.size;
				Self.preset.tipImage = new Image(width, height);

				Self.preset.tipImage.onload = () => {
					// resize tip canvas
					Self.preset.tip.cvs.prop({ width, height });
					Self.preset.tip.ctx.drawImage(Self.preset.tipImage, 0, 0, width, height);
				};
				Self.preset.tipImage.src = 'data:image/svg+xml;base64,'+ btoa(image);
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
				break;
			case "change-opacity":
				console.log(event);
				break;
			case "change-flow":
				console.log(event);
				break;
			case "enable":
				// temp
				el = event.root.find(".option[data-change='change-size']");
				el.find(".value").html( Self.preset.size +el.data("suffix") );

				_canvas.cvs.on("mousedown", Self.dispatch);
				break;
			case "disable":
				_canvas.cvs.off("mousedown", Self.dispatch);
				break;
		}
	}
}
