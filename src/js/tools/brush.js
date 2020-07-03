
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
			mouse,
			preset,
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

				preset = {
					size: Self.preset.size,
					scaled: Self.preset.size * _canvas.scale,
				};
				mouse = {
					x: event.offsetX - _canvas.overlay.left - (preset.scaled / 2),
					y: event.offsetY - _canvas.overlay.top - (preset.scaled / 2),
					oL: (_canvas.oX - _canvas.overlay.left) % _canvas.scale,
					oT: (_canvas.oY - _canvas.overlay.top) % _canvas.scale,
				};
				mouse.x -= mouse.x % _canvas.scale;
				mouse.y -= mouse.y % _canvas.scale;

				// prepare paint
				Self.drag = {
					// show overlay canvas
					cvs: _canvas.overlay.cvs.addClass("show"),
					ctx: _canvas.overlay.ctx,
					clickX: event.offsetX,
					clickY: event.offsetY,
					mouse,
					preset,
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
				if (!event.offsetX) mouse = event;
				else {
					mouse = {
						...Drag.mouse,
						x: event.offsetX - _canvas.overlay.left - (Drag.preset.scaled / 2),
						y: event.offsetY - _canvas.overlay.top - (Drag.preset.scaled / 2),
					};
					mouse.x -= mouse.x % _canvas.scale;
					mouse.y -= mouse.y % _canvas.scale;
				}
				// prevents painting same are when zoomed in
				if (Drag.mouse.nX === mouse.x && Drag.mouse.nY === mouse.y) return;
				Drag.mouse.nX = mouse.x;
				Drag.mouse.nY = mouse.y;

				x = 0;
				y = 0;
				w = Drag.preset.size;
				h = Drag.preset.size;
				x2 = mouse.x + mouse.oL;
				y2 = mouse.y + mouse.oT;
				w2 = Drag.preset.scaled;
				h2 = Drag.preset.scaled;
				Drag.ctx.drawImage(Self.tip.cvs[0], x, y, w, h, x2, y2, w2, h2);
				break;
			case "mouseup":
				// transfer contents of overlay canvas to real canvas
			//	_canvas.osCtx.drawImage(Drag.cvs[0], 0, 0);
				// commit changes
			//	_canvas.dispatch({ type: "commit", image: _canvas.overlay.cvs[0] });
				// hide overlay canvas
			//	_canvas.overlay.cvs.removeClass("show");
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
