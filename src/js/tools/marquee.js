
// keane.tools.marquee

{
	init() {
		// default values
		this.option = "rectangle";
		this.method = "replace";
		this.polygon = [];
		this.polyCloseDist = 5;

		// temp
		// setTimeout(() => window.find(`.tool-marquee-circle`).trigger("click"), 500);
		// setTimeout(() => window.find(`.tool-wand`).trigger("click"), 500);
		// setTimeout(() => window.find(`.tool-lasso`).trigger("click"), 500);
		// setTimeout(() => window.find(`.tool-lasso-polygon`).trigger("click"), 500);
		//setTimeout(() => window.find(`.tool-lasso`).trigger("click"), 500);
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
			case "select-method":
				Self.method = event.arg || "replace";
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
				if (dist < Self.polyCloseDist && Self.polygon.length > 2) return Self.doPolygon({ type: "close-loop" });

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
	doLasso(event) {
		let APP = keane,
			Self = APP.tools.marquee,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				let File = Projector.file;

				// prepare paint
				Self.drag = {
					scale: File.scale,
					coX: File.oX,
					coY: File.oY,
					lasso: [],
					_floor: Math.floor,
					// fast reference
					maskDispatch: Mask.dispatch,
				};
				// prevent mouse from triggering mouseover
				APP.els.content.addClass("no-cursor");
				// bind event handlers
				Projector.doc.on("mousemove mouseup", Self.doLasso);
				break;
			case "mousemove":
				if (event.offsetX) {
					Drag.mX = Drag._floor((event.offsetX - Drag.coX) / Drag.scale);
					Drag.mY = Drag._floor((event.offsetY - Drag.coY) / Drag.scale);
				}

				if (Drag.oldX !== Drag.mX && Drag.oldY !== Drag.mY) {
					Drag.lasso.push(Drag.mX, Drag.mY);
					// draw polygon as it is on canvas
					Drag.maskDispatch({ type: "draw-lasso", polygon: Drag.lasso });

					// save mouse point
					Drag.oldX = Drag.mX;
					Drag.oldY = Drag.mY;
				}
				break;
			case "mouseup":
				if (Drag.lasso.length > 2) {
					// draw lasso as it is on canvas
					Mask.dispatch({ type: "select-lasso", points: Drag.lasso });
				}
				// reset lasso
				Drag.lasso = [];
				// remove class
				APP.els.content.removeClass("no-cursor");
				// unbind event handlers
				Projector.doc.off("mousemove mouseup", Self.doLasso);
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
					ctx = Mask.draw.ctx,
					_max = Math.max,
					_min = Math.min,
					click = {
						x: event.clientX,
						y: event.clientY,
					},
					// oX = _min(_max(event.offsetX - File.oX, 0), File.width),
					// oY = _min(_max(event.offsetY - File.oY, 0), File.height),
					oX = event.offsetX - File.oX,
					oY = event.offsetY - File.oY,
					min = {
						x: -oX,
						y: -oY,
					},
					max = {
						x: File.width - oX,
						y: File.height - oY,
					};

				// drag object
				Self.drag = { option, ctx, click, oX, oY, max, min, _max, _min };
				// reset drawing canvas
				Mask.draw.cvs.prop({ width: File.width, height: File.height });

				switch (Self.option) {
					case "magnetic":
						// TODO: spacial handling
						return;
					case "lasso":
						return Self.doLasso(event);
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
						Drag.oW = Drag._min(Drag._max(Drag.min.x, Drag.oW), Drag.max.x);
						Drag.oH = Drag._min(Drag._max(Drag.min.y, Drag.oH), Drag.max.y);
						Drag.ctx.dashedRect(Drag.oX, Drag.oY, Drag.oW, Drag.oH);
						break;
					case "elliptic":
						let eW = Drag.oW >> 1,
							eH = Drag.oH >> 1,
							eX = Drag.oX + eW,
							eY = Drag.oY + eH;
						if (eW < 0) eW *= -1;
						if (eH < 0) eH *= -1;
						Drag.ctx.dashedEllipse(eX, eY, eW, eH);
						break;
				}

				// update projector
				Projector.render({ maskPath: true, noEmit: true });
				break;
			case "mouseup":
				/*

				// reset selection canvas
				Mask.clear();

				// paint selected area
				Drag.ctx.fill();
				// paint ants but no marching
				Mask.ants.paint();
				*/

				// // start marching if there is selection
				// if (Drag.oW && Drag.oH) Mask.ants.paint(true);
				// remove class
				APP.els.content.removeClass("cover");
				// unbind event handlers
				Projector.doc.off("mousemove mouseup", Self.doMarquee);
				break;
		}
	}
}
