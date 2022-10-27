
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
		
		// setTimeout(() => window.find(`.tool.icon-marquee-union`).trigger("click"), 500);
	},
	dispatch(event) {
		let APP = keane,
			Proj = Projector,
			File = Proj.file,
			Self = APP.tools.marquee,
			Drag = Self.drag,
			color,
			mask,
			image,
			oX, oY,
			el;
		// console.log(event);
		switch (event.type) {
			// subscribed events
			case "mouse-move":
				APP.els.content.toggleClass("cursor-move", !event.detail.isSelection);
				break;

			// system events
			case "window.keystroke":

				switch (event.char) {
					case "esc":
						Self.dispatch({ type: "clear-selection" });
						Mask.dispatch({ type: "deselect" });
						break;
					case "del":
					case "backspace":
						if (event.altKey || event.metaKey) {
							color = event.altKey ? File.fgColor : File.bgColor;
							APP.dispatch({ type: "edit-action", arg: `fill,${color}` });
						} else {
							APP.dispatch({ type: "edit-action", arg: `delete` });
						}
						break;
				}

				break;

			// custom events
			case "select-option":
				Self.option = event.arg || "rectangle";
				break;
			case "select-method":
				Self.method = event.arg || "replace";
				break;
			case "clear-selection":
				// halt marching ants (if any) and make sure draw canvas is cleared
				Mask.ants.halt();
				// reset drawing canvas
				Mask.draw.cvs.prop({ width: File.width, height: File.height });
				// update projector
				Projector.render({ maskPath: true, noEmit: true });
				
				if (Self.method === "replace") Mask.dispatch({ type: "deselect" });
				break;
			case "toggle-quick-mask-mode":
				// stop marching ants
				Mask.ants.halt(true);
				// toggle tool UI
				el = event.el || APP.els.toolsBar.find(".tool.icon-quick-mask");
				el.toggleClass("active", File.quickMask.show);
				// toggle file "quick mask" flag
				File.quickMask.show = !File.quickMask.show;

				if (File.quickMask.show) {
					File.quickMask.ctx.save();
					File.quickMask.ctx.globalCompositeOperation = "source-over";
					File.quickMask.ctx.drawImage(Mask.cvs[0], 0, 0);
					File.quickMask.ctx.globalCompositeOperation = "source-out";
					File.quickMask.ctx.fillStyle = Pref.quickMask.color;
					File.quickMask.ctx.fillRect(0, 0, 1e9, 1e9);
					File.quickMask.ctx.restore();
				} else {
					Mask.ants.paint(true);
				}
				// update projector
				File.render({ noEmit: true });
				break;
			case "enable":
				Proj.cvs.on("mousedown", Self.doMarquee);
				// subscribe to events
				karaqu.on("mouse-move", Self.dispatch);
				break;
			case "disable":
				Proj.cvs.off("mousedown", Self.doMarquee);
				// subscribe to events
				karaqu.off("mouse-move", Self.dispatch);
				break;
			
			// proxy event
			case "deselect":
			case "select-all":
			case "select-none":
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
			mX = event.offsetX - File.oX,
			mY = event.offsetY - File.oY,
			[oX, oY] = event.shiftKey ? Self.fast.shiftForce(mX, mY) : [mX, mY],
			dX, dY, dist;
		switch (event.type) {
			case "mousedown":
				if (!Self.polygon.length) {
					// stuff for fast reference (declared once at start)
					Self.fast = {
						shiftForce: (x, y) => {
							let l = Self.polygon.length,
								pos = [x, y];
							if (l > 1) {
								let dir = ["h", "ne", "v", "nw", "h", "ne", "v", "nw", "h"],
									lX = Self.polygon[l-2],
									lY = Self.polygon[l-1],
									deg = Math.round(Math.atan2(y-lY, x-lX) * 180 / Math.PI);
								if (deg < 0) deg += 360;
								// translate angle to direction
								switch (dir[Math.round(deg / 45)]) {
									case "v": pos[0] = lX; break;
									case "h": pos[1] = lY; break;
									case "ne": pos[0] = lX + (y - lY); break;
									case "nw": pos[0] = lX - (y - lY); break;
								}
							}
							return pos;
						},
					};
					// prevent mouse from triggering mouseover
					APP.els.content.addClass("cover cursor-poly-open");
					// bind event handlers
					Projector.doc.on("mousedown mousemove", Self.doPolygon);
					// halt marching ants (if any) and make sure draw canvas is cleared
					Self.dispatch({ type: "clear-selection" });
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
				Mask.draw.ctx.dashedPolygon([...Self.polygon, oX, oY]);
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
					ctx: Mask.draw.ctx,
					content: APP.els.content,
				};
				// halt marching ants (if any) and make sure draw canvas is cleared
				Self.dispatch({ type: "clear-selection" });
				// prevent mouse from triggering mouseover
				APP.els.content.addClass("cover cursor-poly-open");
				// bind event handlers
				Projector.doc.on("mousemove mouseup", Self.doLasso);
				break;
			case "mousemove":
				Drag.mX = Drag._floor((event.offsetX - Drag.coX) / Drag.scale);
				Drag.mY = Drag._floor((event.offsetY - Drag.coY) / Drag.scale);

				if (Drag.oldX !== Drag.mX && Drag.oldY !== Drag.mY) {
					// add point to lasso array
					Drag.lasso.push(Drag.mX, Drag.mY);
					// draw lasso as it is on canvas
					Drag.ctx.dashedPolygon([...Drag.lasso]);
					// update projector
					Projector.render({ maskPath: true, noEmit: true });
					// save mouse point
					Drag.oldX = Drag.mX;
					Drag.oldY = Drag.mY;

					if (Drag.lasso.length > 10) {
						let dX = Drag.lasso[0] - Drag.mX,
							dY = Drag.lasso[1] - Drag.mY,
							dist = Math.sqrt(dX*dX + dY*dY);
						// mouse cursor update
						Drag.content.toggleClass("cursor-poly-close", dist > Self.polyCloseDist);
					}
				}
				break;
			case "mouseup":
				if (Drag.lasso.length > 2) {
					// draw lasso as it is on canvas
					Mask.dispatch({ type: "select-lasso", points: Drag.lasso });
				}
				// remove class
				APP.els.content.removeClass("cover");
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
				let File = Projector.file,
					ctx = Mask.draw.ctx,
					antCvs = Mask.ants.cvs[0],
					width = File.width,
					height = File.height,
					_max = Math.max,
					_min = Math.min,
					_abs = Math.abs,
					_floor = Math.floor,
					_round = Math.round,
					_atan2 = Math.atan2,
					_sqrt = Math.sqrt,
					_PI = 180 / Math.PI,
					offset = {
						x: event.offsetX - File.oX,
						y: event.offsetY - File.oY,
					},
					max = {
						x: _max(_min(width - offset.x, width), 0),
						y: _max(_min(height - offset.y, height), 0),
						w: width,
						h: height,
					},
					click = {
						x: event.clientX,
						y: event.clientY,
					};
				// constraints
				if (offset.x < 0) { click.x -= offset.x; offset.x = 0; }
				if (offset.y < 0) { click.y -= offset.y; offset.y = 0; }
				if (offset.x > width)  { click.x -= offset.x - width;  offset.x = width; }
				if (offset.y > height) { click.y -= offset.y - height; offset.y = height; }
				// drag object
				Self.drag = { ctx, antCvs, offset, click, max, _min, _max, _abs, _floor, _round, _atan2, _sqrt, _PI };

				// halt marching ants (if any) and make sure draw canvas is cleared
				Self.dispatch({ type: "clear-selection" });

				// prevent mouse from triggering mouseover
				APP.els.content.addClass("cover cursor-crosshair");
				// bind event handlers
				Projector.doc.on("mousemove mouseup", Self.doRectangle);
				break;
			case "mousemove":
				let x = Drag.offset.x,
					y = Drag.offset.y,
					w = event.clientX - Drag.click.x,
					h = event.clientY - Drag.click.y,
					limit;
				// clear marquee canvas (fastest way)
				Drag.ctx.clear();

				if (event.shiftKey) {
					let // dist = Drag._round(Drag._sqrt(h*h + w*w)),
						deg = Drag._round(Drag._atan2(h, w) * Drag._PI);
					if (deg < 0) deg += 360;
					if (w < 0) w *= -1;
					if (h < 0) h *= -1;

					h = w = Drag._min(w, h);
					switch (Drag._floor(deg / 90)) {
						case 0:
							// shift key constraints
							if (w > Drag.max.x) { h = w = Drag.max.x; }
							if (h > Drag.max.y) { h = w = Drag.max.y; }
							break;
						case 1:
							x -= w;
							// shift key constraints
							if (x < 0) { x = 0; h = w = Drag.offset.x; }
							if (h > Drag.max.y) { h = w = Drag.max.y; x = Drag.offset.x - w; }
							break;
						case 2:
							y -= h;
							x -= w;
							// shift key constraints
							if (x < 0) { x = 0; h = w = Drag.offset.x; y = Drag.offset.y - h; }
							if (y < 0) { y = 0; h = w = Drag.offset.y; x = Drag.offset.x - w; }
							break;
						case 3:
							y -= h;
							// shift key constraints
							if (y < 0) { y = 0; h = w = Drag.offset.y; }
							if (w > Drag.max.x) { h = w = Drag.max.x; y = Drag.offset.y - h; }
							break;
					}
					limit = true;
				}
				if (event.altKey) {
					if (w < 0) w *= -1;
					if (h < 0) h *= -1;
					x -= w;
					y -= h;
					w *= 2;
					h *= 2;
					limit = true;
					// alt key constraints
					if (x < 0) { x = 0; w = Drag.offset.x * 2; }
					if (y < 0) { y = 0; h = Drag.offset.y * 2; }
					if (Drag._abs(w) >> 1 > Drag.max.x) { w = Drag.max.x * 2; x = Drag.offset.x - Drag.max.x; }
					if (Drag._abs(h) >> 1 > Drag.max.y) { h = Drag.max.y * 2; y = Drag.offset.y - Drag.max.y; }
				}

				if (!limit) {
					// default constraints
					if (w < 0) { x += w; w *= -1; }
					if (h < 0) { y += h; h *= -1; }
					if (x < 0) { x = 0; w = Drag.offset.x; }
					if (y < 0) { y = 0; h = Drag.offset.y; }
					if (x === Drag.offset.x && w > Drag.max.x) w = Drag.max.x;
					if (y === Drag.offset.y && h > Drag.max.y) h = Drag.max.y;
				}
				// draw rectangle lines
				Drag.ctx.dashedRect(x, y, w - 1, h - 1);
				// update projector (paint halted ants)
				Projector.render({ maskPath: true, noEmit: true });
				// save values for "mouseup"
				Drag.rect = { x, y, w, h };
				break;
			case "mouseup":
				// console.log( Drag.rect );
				if (Drag.rect) {
					// paint rectangle on mask canvas
					Mask.dispatch({ type: "select-rect", rect: Drag.rect, method: Self.method });
				}
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
				let File = Projector.file,
					ctx = Mask.draw.ctx,
					antCvs = Mask.ants.cvs[0],
					width = File.width,
					height = File.height,
					_abs = Math.abs,
					offset = {
						x: event.offsetX - File.oX,
						y: event.offsetY - File.oY,
					},
					max = {
						x: Math.min(width - offset.x, width),
						y: Math.min(height - offset.y, height),
						w: width-1,
						h: height-1,
					},
					click = {
						x: event.clientX,
						y: event.clientY,
					},
					drawHEdge = (ctx, x, y, rX, rY, yA) => {
						yA.map(lY => {
							let dX = Math.round(Math.sqrt((1 - ((lY*lY) / (rY*rY))) * (rX*rX)));
							if (dX) ctx.dashedPolygon([ x - dX, y + lY, x + dX, y + lY ]);
						});
					},
					drawVEdge = (ctx, x, y, rX, rY, xA) => {
						xA.map(lX => {
							let dY = Math.round(Math.sqrt((1 - ((lX*lX) / (rX*rX))) * (rY*rY)));
							if (dY) ctx.dashedPolygon([ x + lX, y - dY, x + lX, y + dY ]);
						});
					};
				// constraints
				if (offset.x < 0) click.x -= offset.x;
				if (offset.y < 0) click.y -= offset.y;
				// drag object
				Self.drag = { ctx, antCvs, offset, click, max, _abs, drawHEdge, drawVEdge };

				// halt marching ants (if any) and make sure draw canvas is cleared
				Self.dispatch({ type: "clear-selection" });
				// prevent mouse from triggering mouseover
				APP.els.content.addClass("cover cursor-crosshair");
				// bind event handlers
				Projector.doc.on("mousemove mouseup", Self.doEllipse);
				break;
			case "mousemove":
				let mX = Drag.offset.x,
					mY = Drag.offset.y,
					dX = event.clientX - Drag.click.x,
					dY = event.clientY - Drag.click.y;
				// clear marquee canvas (fastest way)
				Drag.ctx.clear();
				// handling shift key
				if (event.altKey) {
					mX -= dX;
					mY -= dY;
					dX *= 2;
					dY *= 2;
				}
				// constraints
				let rX = dX >> 1,
					rY = dY >> 1,
					x = mX + rX,
					y = mY + rY;
				rX = Drag._abs(rX);
				rY = Drag._abs(rY);
				Drag.ctx.dashedEllipse(x, y, rX, rY);

				// draw lasso edge
				Drag.drawHEdge(Drag.ctx, x, y, rX, rY, [-y, Drag.max.h-y]);
				Drag.drawVEdge(Drag.ctx, x, y, rX, rY, [-x, Drag.max.w-x]);

				// update projector
				Projector.render({ maskPath: true, noEmit: true });
				// save values for "mouseup"
				Drag.elps = { x, y, rX, rY };
				break;
			case "mouseup":
				// console.log( Drag.elps );
				if (Drag.elps) {
					// paint rectangle on mask canvas
					Mask.dispatch({ type: "select-elliptic", elps: Drag.elps, method: Self.method });
				}
				// remove class
				APP.els.content.removeClass("cover cursor-crosshair");
				// unbind event handlers
				Projector.doc.off("mousemove mouseup", Self.doEllipse);
				break;
		}
	}
}
