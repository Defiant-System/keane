
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
				};
				mouse.x -= mouse.x % _canvas.scale;
				mouse.y -= mouse.y % _canvas.scale;
				mouse.x += (_canvas.oX - _canvas.overlay.left) % _canvas.scale;
				mouse.y += (_canvas.oY - _canvas.overlay.top) % _canvas.scale;

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
						x: event.offsetX - Drag.clickX,
						y: event.offsetY - Drag.clickY,
					};
				}

				Drag.ctx.drawImage(
					Self.tip.cvs[0],
					0, 0, Drag.preset.size, Drag.preset.size,
					mouse.x, mouse.y, Drag.preset.scaled, Drag.preset.scaled);
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
