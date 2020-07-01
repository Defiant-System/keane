
// TOOLS.brush

{
	init() {
		// default option
		this.option = "brush";
		// default preset
		this.preset = {
			name: "circle",
			size: 15,
			tip: false
		};

		// auto load preset tip
		this.dispatch({ type: "select-preset-tip", arg: this.preset.name });
	},
	dispatch(event) {
		let APP = photoshop,
			Self = TOOLS.brush,
			Drag = Self.drag,
			_canvas = Canvas,
			preset,
			svg,
			t, l, w, h;

		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				// reset & sync overlay canvas
				_canvas.dispatch({ type: "sync-overlay-canvas" });

				// prepare paint
				Self.drag = {
					// show overlay canvas
					cvs: _canvas.olCvs.addClass("show"),
					ctx: _canvas.olCtx,
					mouse: {
						x: event.clientX - window.left - _canvas.oX,
						y: event.clientY - window.top - _canvas.oY,
					},
					clickX: event.clientX - (_canvas.oX - _canvas.cX + (_canvas.w / 2)),
					clickY: event.clientY - (_canvas.oY - _canvas.cY + (_canvas.h / 2)),
				};
				// trigger first paint
				Self.dispatch({ type: "swap-paint", ...Self.drag.mouse });
				// prevent mouse from triggering mouseover
				APP.els.content.addClass("no-cursor");
				// bind event handlers
				_canvas.doc.on("mousemove mouseup", Self.dispatch);
				break;
			case "mousemove":
				Drag.x = Drag.mouse.x + event.clientX - Drag.clickX;
				Drag.y = Drag.mouse.y + event.clientY - Drag.clickY;
				/* falls through */
			case "swap-paint":
				// put swap canvas on UI canvas
				w =
				h = Self.preset.size;
				l = (Drag.x || event.x) - (w/2);
				t = (Drag.y || event.y) - (h/2);
				Drag.ctx.drawImage(Self.preset.tip, l, t, w, h);
				break;
			case "mouseup":
				// transfer contents of overlay canvas to real canvas
				_canvas.osCtx.drawImage(Drag.cvs[0], 0, 0);
				// commit changes
				_canvas.dispatch({ type: "commit", image: _canvas.osCvs[0] });
				// hide overlay canvas
				_canvas.olCvs.removeClass("show");
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

				Self.preset.tip = new Image();
				Self.preset.tip.src = 'data:image/svg+xml;base64,'+ btoa(svg);
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
				_canvas.cvs.on("mousedown", Self.dispatch);
				break;
			case "disable":
				_canvas.cvs.off("mousedown", Self.dispatch);
				break;
		}
	}
}
