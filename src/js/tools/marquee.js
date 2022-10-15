
// keane.tools.marquee

{
	init() {
		// default values
		this.option = "rectangle";
		this.polygon = [];
		this.polyCloseDist = 5;

		// temp
		// setTimeout(() => window.find(`.tool-marquee-circle`).trigger("click"), 500);
		// setTimeout(() => window.find(`.tool-wand`).trigger("click"), 500);
		// setTimeout(() => window.find(`.tool-lasso`).trigger("click"), 500);
		setTimeout(() => window.find(`.tool-lasso-polygon`).trigger("click"), 500);
	},
	dispatch(event) {
		let APP = keane,
			Proj = Projector,
			File = Proj.file,
			Self = APP.tools.marquee,
			Drag = Self.drag,
			_max = Math.max,
			_min = Math.min,
			color,
			mask,
			image,
			oX, oY;
		// console.log(event);
		switch (event.type) {
			// system events
			case "window.keystroke":
				break;

			// custom events
			case "select-option":
				Self.option = event.arg || "rectangle";
				break;
			case "enable":
				Proj.cvs.on("mousedown", Self.doMarquee);
				break;
			case "disable":
				Proj.cvs.off("mousedown", Self.doMarquee);
				break;
			
			// proxy event
			case "select-all":
			case "deselect":
			case "inverse-selection":
				return Mask.dispatch(event);
		}
	},
	doPolygon(event) {
		let APP = keane,
			Self = APP.tools.marquee,
			File = Projector.file,
			oX = event.offsetX - File.oX,
			oY = event.offsetY - File.oY,
			dX, dY, dist;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				if (!Self.polygon.length) {
					// prevent mouse from triggering mouseover
					APP.els.content.addClass("cover poly-open");
					// bind event handlers
					Projector.doc.on("mousedown mousemove", Self.doPolygon);
				}

				dX = Self.polygon[0] - oX;
				dY = Self.polygon[1] - oY;
				dist = Math.sqrt(dX*dX + dY*dY);
				// if distance between new point and starting point is less then 4px, close the loop
				if (dist < Self.polyCloseDist) return Self.doPolygon({ type: "close-loop" });

				// add point to array
				Self.polygon.push(oX, oY);

				break;
			case "mousemove":
				dX = Self.polygon[0] - oX;
				dY = Self.polygon[1] - oY;
				dist = Math.sqrt(dX*dX + dY*dY);
				// mouse cursor update
				APP.els.content.toggleClass("poly-close", dist > Self.polyCloseDist);
				// draw polygon as it is on canvas
				Mask.dispatch({ type: "draw-open-polygon", polygon: Self.polygon, oX, oY });
				break;
			case "close-loop":
				// start marching ants
				Mask.dispatch({ type: "select-polygon", points: Self.polygon });
				// reset polygon
				Self.polygon = [];
				// prevent mouse from triggering mouseover
				APP.els.content.removeClass("cover poly-open");
				// bind event handlers
				Projector.doc.off("mousedown mousemove", Self.doPolygon);
				break;
		}
	},
	doMarquee(event) {
		let APP = keane,
			Self = APP.tools.marquee,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				// prepare drag object
				let option = Self.option,
					File = Projector.file,
					ctx = Mask.ctx,
					click = {
						x: event.clientX,
						y: event.clientY,
					},
					oX = event.offsetX - File.oX,
					oY = event.offsetY - File.oY,
					PI2 = Math.PI * 2;

				Self.drag = { option, ctx, click, oX, oY, PI2 };
				// reset selection canvas
				Mask.clear();

				switch (Self.option) {
					case "lasso":
					case "magnetic":
						// TODO: spacial handling
						return;
					case "polygon":
						return Self.doPolygon(event);
					case "magic-wand":
						return Mask.dispatch({ type: "select-with-magic-wand", oX, oY });
					case "rectangle":
					case "elliptic":
						/* do stuff below */
				}
				
				// prevent mouse from triggering mouseover
				APP.els.content.addClass("cover");
				// bind event handlers
				Projector.doc.on("mousemove mouseup", Self.doMarquee);
				break;
			case "mousemove":
				Drag.oW = event.clientX - Drag.click.x;
				Drag.oH = event.clientY - Drag.click.y;
				
				// clear marquee canvas (fastest way)
				Drag.ctx.clear();

				switch (Self.option) {
					case "rectangle":
						Drag.ctx.fillRect(Drag.oX, Drag.oY, Drag.oW, Drag.oH);
						break;
					case "elliptic":
						let eW = Drag.oW >> 1,
							eH = Drag.oH >> 1,
							eX = Drag.oX + eW,
							eY = Drag.oY + eH;
						if (eW < 0) eW *= -1;
						if (eH < 0) eH *= -1;
						Drag.ctx.ellipse(eX, eY, eW, eH, 0, 0, Drag.PI2);
						break;
				}
				// paint selected area
		    	Drag.ctx.fill();

				// paint ants but no marching
				Mask.ants.paint();
				break;
			case "mouseup":
				// start marching if there is selection
				if (Drag.oW && Drag.oH) Mask.ants.paint(true);
				// remove class
				APP.els.content.removeClass("cover");
				// unbind event handlers
				Projector.doc.off("mousemove mouseup", Self.doMarquee);
				break;
		}
	}
}
