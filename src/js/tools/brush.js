
// TOOLS.brush

{
	init() {
		this.option = "brush";
		this.preset = {
			name: "circle",
			size: 15,
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
				break;
			case "mouseup":
				Cvs.ctx.drawImage(Cvs.swapCvs[0], Cvs.oX, Cvs.oY);
			
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
				//Self.preset.tip.src = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAoCAYAAABw65OnAAABz0lEQVRYR+3XuYpUQRTG8d+4b7ihuC+goZEImuuDCAYGoqCJiZFv4BOIiehDmKtgZiIauMy4oLjhviEf1IWmQayacS49ciu5dPehzv+e9espE3CmJoDBANFlYYjEEInxjlzQNbEca7ACi/ALX/ABX1tnz2wisRYbkecqLMZPfMJ7vC7PapZWiLz9FmzGBqzGEvzAR7zBS7woUakCaYXYge3Yik1Yh2X4hnd4hed4ipkqAprG9krswk4EZhv2lNQkBY/wrDifxhN8rgFpiURqYHcBCcxeHMZ+PMAtPCzOA/C4tjbmCnFkBOJmHxATkY6kd7ww12MpvuNtH4UZiPEWzeeuRTOoemnRgHTDKu2ZFHXDKp2QNp33YdV13OjY7iB6Hds1rd9k09KiTRe3GA8Qg7z7r+RdS/H/1XZBd0f2RRRVdGV38l12SRZZ02mNREb0AZwo4vZs8XYOJ4uwyW45j3u1JK0QedOLOIQ7CEQiEpmf3yJ2LxQxfHq+ILp7TxVF1UUiyjtrPH8BbuASrvUNEX8HcRl3S7qyVatOazr+FImjuIozuF7lecToX0DkjoiZY7jdChD7uUDsQ7oikv/+mPMrOF4LNFuI2vur7CYC4jdO2WMpsiUYLgAAAABJRU5ErkJggg==`;
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
