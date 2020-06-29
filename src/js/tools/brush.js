
// TOOLS.brush

{
	init() {
		this.option = "brush";
		this.preset = {
			name: "circle",
			size: 10,
			tip: false
		};

		this.dispatch({ type: "select-preset-tip", arg: "circle" });
	},
	dispatch(event) {
		let APP = photoshop,
			Cvs = Canvas,
			Ctx = Canvas.ctx,
			Self = TOOLS.brush,
			Drag = Self.drag,
			preset,
			svg,
			t, l, w, h;

		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				// use swap canvas
				Cvs.swapCvs.prop({ width: Cvs.oW, height: Cvs.oH });

				Self.drag = {
					mouse: {
						x: event.clientX - window.left - Cvs.oX,
						y: event.clientY - window.top - Cvs.oY,
					},
					clickX: event.clientX - (Cvs.oX - Cvs.cX + (Cvs.w / 2)),
					clickY: event.clientY - (Cvs.oY - Cvs.cY + (Cvs.h / 2)),
				};

				Self.dispatch({ type: "swap-paint", ...Self.drag.mouse });

				// prevent mouse from triggering mouseover
				APP.els.content.addClass("no-cursor");
				// bind event handlers
				Cvs.doc.on("mousemove mouseup", Self.dispatch);
				break;
			case "mousemove":
				Drag.x = Drag.mouse.x + event.clientX - Drag.clickX;
				Drag.y = Drag.mouse.y + event.clientY - Drag.clickY;
			case "swap-paint":
				// put swap canvas on UI canvas
				w =
				h = Self.preset.size;
				l = (Drag.x || event.x) - (w/2);
				t = (Drag.y || event.y) - (h/2);
				Cvs.swapCtx.drawImage(Self.preset.tip, l, t, w, h);
				Cvs.ctx.drawImage(Cvs.swapCvs[0], Cvs.oX, Cvs.oY);
				break;
			case "mouseup":
				// remove class
				APP.els.content.removeClass("no-cursor");
				// unbind event handlers
				Cvs.doc.off("mousemove mouseup", Self.dispatch);
				break;
			// custom events
			case "select-option":
				Self.option = event.arg || "brush";
				break;
			case "select-preset-tip":
				Self.preset.name = event.arg || "circle";
				svg = window.find("svg#brush-preset-"+ Self.preset.name)[0].xml
							.replace(/--color/ig, Cvs.fgColor);

				Self.preset.tip = new Image();
				Self.preset.tip.src = 'data:image/svg+xml;base64,'+ btoa(svg);
				break;
			case "enable":
				Cvs.cvs.on("mousedown", Self.dispatch);
				break;
			case "disable":
				Cvs.cvs.off("mousedown", Self.dispatch);
				break;
		}
	}
}
