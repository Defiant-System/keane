
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
	doMarquee(event) {
		let Self = keane.tools.marquee;
		// prevent default behaviour
		event.preventDefault();
		switch (Self.option) {
			case "magnetic":   return; /* TODO: spacial handling */
			case "lasso":      return Self.doLasso(event);
			case "polygon":    return Self.doPolygon(event);
			case "magic-wand": return Mask.dispatch({ type: "select-with-magic-wand", oX, oY });
			case "rectangle":  return Self.doRectangle(event);
			case "elliptic":   return Self.doEllipse(event);
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
					APP.els.content.addClass("cover cursor-poly-open");
					// bind event handlers
					Projector.doc.on("mousedown mousemove", Self.doPolygon);

					// halt marching ants (if any) and make sure draw canvas is cleared
					Mask.ants.halt(true);
					// reset drawing canvas
					Mask.draw.cvs.prop({ width: File.width, height: File.height });
					// update projector
					Projector.render({ maskPath: true, noEmit: true });
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
				APP.els.content.toggleClass("cursor-poly-close", dist > Self.polyCloseDist);
				// reset drawing canvas
				Mask.draw.cvs.prop({ width: File.width, height: File.height });
				// draw polygon as it is on canvas
				Mask.draw.ctx.dashedPolygon([ ...Self.polygon, oX, oY ]);
				// update projector
				Projector.render({ maskPath: true, noEmit: true });
				break;
			case "close-loop":
				// start marching ants
				Mask.dispatch({ type: "select-polygon", points: Self.polygon });
				// reset polygon
				Self.polygon = [];
				// prevent mouse from triggering mouseover
				APP.els.content.removeClass("cover cursor-poly-open cursor-poly-close");
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
	doRectangle(event) {
		let APP = keane,
			Self = APP.tools.marquee,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prepare drag object
				let option = Self.option,
					File = Projector.file,
					ctx = Mask.draw.ctx,
					_max = Math.max,
					_min = Math.min,
					width = File.width,
					height = File.height,
					offset = {
						x: event.offsetX - File.oX,
						y: event.offsetY - File.oY,
					},
					max = {
						x: _min(width - offset.x, width),
						y: _min(height - offset.y, height),
					},
					click = {
						x: event.clientX,
						y: event.clientY,
					};

				if (offset.x < 0) click.x -= offset.x;
				if (offset.y < 0) click.y -= offset.y;
				// if (offset.x > width) click.x -= offset.x;
				// if (offset.y > height) click.y -= offset.y;

				// drag object
				Self.drag = { option, ctx, offset, click, max, _max, _min };

				// reset drawing canvas
				Mask.draw.cvs.prop({ width, height });
				// prevent mouse from triggering mouseover
				APP.els.content.addClass("cover cursor-crosshair");
				// bind event handlers
				Projector.doc.on("mousemove mouseup", Self.doRectangle);
				break;
			case "mousemove":
				let x = Drag.offset.x,
					y = Drag.offset.y,
					w = event.clientX - Drag.click.x,
					h = event.clientY - Drag.click.y;

				// clear marquee canvas (fastest way)
				Drag.ctx.clear();

				if (w < 0) {
					w = Drag._min(-w, Drag.offset.x);
					x = Drag.offset.x - w;
				}
				if (h < 0) {
					h = Drag._min(-h, Drag.offset.y);
					y = Drag.offset.y - h;
				}
				Drag.ctx.dashedRect(
					Drag._max(x, 0),
					Drag._max(y, 0),
					Drag._min(w, Drag.max.x - 1),
					Drag._min(h, Drag.max.y - 1)
				);

				// update projector
				Projector.render({ maskPath: true, noEmit: true });
				break;
			case "mouseup":
				// remove class
				APP.els.content.removeClass("cover cursor-crosshair");
				// unbind event handlers
				Projector.doc.off("mousemove mouseup", Self.doRectangle);
				break;
		}
	},
	doEllipse(event) {
		let APP = keane,
			Self = APP.tools.marquee,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prepare drag object
				let option = Self.option,
					File = Projector.file,
					ctx = Mask.draw.ctx,
					_max = Math.max,
					_min = Math.min,
					width = File.width,
					height = File.height,
					offset = {
						x: event.offsetX - File.oX,
						y: event.offsetY - File.oY,
					},
					max = {
						x: _min(width - offset.x, width),
						y: _min(height - offset.y, height),
					},
					click = {
						x: event.clientX,
						y: event.clientY,
					};

				if (offset.x < 0) click.x -= offset.x;
				if (offset.y < 0) click.y -= offset.y;
				// if (offset.x > width) click.x -= offset.x;
				// if (offset.y > height) click.y -= offset.y;

				// drag object
				Self.drag = { option, ctx, offset, click, max, _max, _min };

				// reset drawing canvas
				Mask.draw.cvs.prop({ width, height });
				// prevent mouse from triggering mouseover
				APP.els.content.addClass("cover cursor-crosshair");
				// bind event handlers
				Projector.doc.on("mousemove mouseup", Self.doEllipse);
				break;
			case "mousemove":
				let x = Drag.offset.x,
					y = Drag.offset.y,
					w = event.clientX - Drag.click.x,
					h = event.clientY - Drag.click.y;

				// clear marquee canvas (fastest way)
				Drag.ctx.clear();

				// TODO: find out where shape cuts file canvas & draw lines
				//       in order to simulate closed loop
				let eW = w >> 1,
					eH = h >> 1,
					eX = x + eW,
					eY = y + eH;
				// console.log(eX, eY, Math.abs(eW), Math.abs(eH));
				Drag.ctx.dashedEllipse(eX, eY, Math.abs(eW), Math.abs(eH));

				// update projector
				Projector.render({ maskPath: true, noEmit: true });
				break;
			case "mouseup":
				// remove class
				APP.els.content.removeClass("cover cursor-crosshair");
				// unbind event handlers
				Projector.doc.off("mousemove mouseup", Self.doEllipse);
				break;
		}
	}
}
