
// TOOLS.brush

{
	init() {
		// default option
		this.option = "brush";
		// default preset
		this.preset = {
			name: "circle",
			size: 10,
			tip: false
		};

		this.tip = Canvas.createCanvas(this.preset.size, this.preset.size);

		// auto load preset tip
		this.dispatch({ type: "select-preset-tip", arg: this.preset.name });
	},
	dispatch(event) {
		let APP = photoshop,
			Self = TOOLS.brush,
			Drag = Self.drag,
			_canvas = Canvas,
			_round = Math.round,
			image,
			svg,
			y, x, w, h,
			y2, x2, w2, h2,
			el;

		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// reset & sync overlay canvas
				_canvas.dispatch({ type: "sync-overlay-canvas" });
				// disable image smoothing
				_canvas.overlay.ctx.imageSmoothingEnabled = false;

				// prepare paint
				Self.drag = {
					cvs: _canvas.overlay.cvs.addClass("show"), // show overlay canvas
					ctx: _canvas.overlay.ctx,
					clickX: event.offsetX,
					clickY: event.offsetY,
					scale: _canvas.scale,
					coL: _canvas.overlay.left,
					coT: _canvas.overlay.top,
					mouse: {
						x: event.offsetX - _canvas.overlay.left - Self.preset.sW,
						y: event.offsetY - _canvas.overlay.top - Self.preset.sH,
						oL: (_canvas.oX - _canvas.overlay.left) % _canvas.scale,
						oT: (_canvas.oY - _canvas.overlay.top) % _canvas.scale,
					},
					preset: {
						size: Self.preset.size,
						sW: (Self.preset.size * _canvas.scale) / 2,
						sH: (Self.preset.size * _canvas.scale) / 2,
					},
				};

				// trigger first paint
				Self.dispatch({ type: "mousemove", ...Self.drag.mouse });
				// prevent mouse from triggering mouseover
				APP.els.content.addClass("no-cursor");
				// bind event handlers
				_canvas.doc.on("mousemove mouseup", Self.dispatch);
				break;
			case "mousemove":
				// paint on overlay canvas
				if (event.offsetX) {
					Drag.mouse.x = event.offsetX - Drag.coL - Drag.preset.sW;
					Drag.mouse.y = event.offsetY - Drag.coT - Drag.preset.sH;
				}
				Drag.mouse.x -= Drag.mouse.x % _canvas.scale;
				Drag.mouse.y -= Drag.mouse.y % _canvas.scale;

				// prevents painting same are when zoomed in
				if (Drag.mouse.nX === Drag.mouse.x && Drag.mouse.nY === Drag.mouse.y) return;
				Drag.mouse.nX = Drag.mouse.x;
				Drag.mouse.nY = Drag.mouse.y;

				x = 0;
				y = 0;
				w = Drag.preset.size;
				h = Drag.preset.size;
				x2 = Drag.mouse.x + Drag.mouse.oL;
				y2 = Drag.mouse.y + Drag.mouse.oT;
				w2 = Drag.preset.sW * 2;
				h2 = Drag.preset.sH * 2;
				Drag.ctx.drawImage(Self.tip.cvs[0], x, y, w, h, x2, y2, w2, h2);
				break;
			case "mouseup":
				// transfer contents of overlay canvas to real offscreen canvas
				image = _canvas.overlay.cvs[0];
				x = 0;
				y = 0;
				w = _canvas.overlay.width;
				h = _canvas.overlay.height;
				x2 = _round(-_canvas.oX / Drag.scale) + (_canvas.aX / Drag.scale);
				y2 = _round(-_canvas.oY / Drag.scale) + (_canvas.aY / Drag.scale);
				w2 = _canvas.overlay.width / Drag.scale;
				h2 = _canvas.overlay.height / Drag.scale;
				// commit changes
				_canvas.dispatch({ type: "commit", image, x, y, w, h, x2, y2, w2, h2 });
				// hide overlay canvas
				_canvas.overlay.cvs.removeClass("show");
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
				svg = window.find("svg#brush-preset-"+ Self.preset.name)[0].xml
							.replace(/--color/ig, _canvas.fgColor);

				let tip = new Image(10, 10);
				tip.onload = () => {
					// resize tip canvas
					Self.tip.cvs.prop({ width: Self.preset.size, height: Self.preset.size });
					Self.tip.ctx.drawImage(tip, 0, 0);
					//console.log( Self.tip.cvs[0].toDataURL("png") );
				};
				tip.src = 'data:image/svg+xml;base64,'+ btoa(svg);
				break;
			case "change-mode":
				console.log(event);
				break;
			case "change-size":
				Self.preset.size = event.value;
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
