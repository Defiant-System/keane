
const Rulers = {
	t: 18, // ruler thickness
	init() {
		// fast references
		this.doc = UI.doc;
		this.content = UI.content;

		this.els = {
			rg: window.find(".ruler-guides"),
			rgTop: this.content.find(".top-over"),
			rgLeft: this.content.find(".left-over"),
			rgCorner: this.content.find(".corner-over"),
		};

		// subscribe to events
		karaqu.on("meta-key", this.dispatch);

		// bind event handlers
		this.els.rg.on("mousedown", this.dispatch);
	},
	dispatch(event) {
		let APP = keane,
			Self = Rulers,
			Proj = Projector,
			Drag = Self.drag,
			File = Proj.file;
		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				// get element & variables
				let el = $(event.target),
					type = el.prop("className").split("-")[0],
					scale = File.scale,
					screen = {
						scale,
						oY: ((Proj.aY - Self.t - File.oY) % scale) - scale,
						oX: ((Proj.aX - Self.t - File.oX) % scale) - scale,
					},
					click = {
						y: event.clientY - +el.prop("offsetTop"),
						x: event.clientX - +el.prop("offsetLeft"),
					};

				// identify type of element
				switch (type) {
					case "top":
					case "left":
						type = type === "top" ? "lineH" : "lineV";
						el = el.parent().append(`<div class="${type} new-line"></div>`);
						break;
					case "corner":
						el = el.parent().append(`<div class="lineH new-line"></div><div class="lineV new-line"></div>`);
						break;
				}
				// prepare drag object
				Self.drag = { el, type, click, screen, data: {} };

				// prevent mouse from triggering mouseover
				APP.els.content.addClass("no-cursor");
				// bind event handlers
				Self.doc.on("mousemove mouseup", Self.dispatch);
				break;
			case "mousemove":
				let left = event.clientX - Drag.click.x,
					top = event.clientY - Drag.click.y;
				// snaps (when zoomed)
				left -= Drag.screen.oX + (left % Drag.screen.scale);
				top -= Drag.screen.oY + (top % Drag.screen.scale);
				// line is going to be removed
				if (left < Self.t) left = -999;
				if (top < Self.t) top = -999;
				// drag element(s)
				switch (Drag.type) {
					case "corner":
						// save value for mouseup
						Drag.data.top = top;
						Drag.data.left = left;
						// UI update
						Drag.el.get(0).css({ top });
						Drag.el.get(1).css({ left });
						break;
					case "lineV":
						// save value for mouseup
						Drag.data.left = left;
						// UI update
						Drag.el.css({ left });
						break;
					case "lineH":
						// save value for mouseup
						Drag.data.top = top;
						// UI update
						Drag.el.css({ top });
						break;
				}
				break;
			case "mouseup":
				// possible actions
				switch (Drag.type) {
					case "corner":
						if (Drag.data.top < 0) Drag.el.get(0).remove();
						if (Drag.data.left < 0) Drag.el.get(1).remove();
						break;
					case "lineV":
						// remove element if flagged
						if (Drag.data.left < 0) Drag.el.remove();
						break;
					case "lineH":
						// remove element if flagged
						if (Drag.data.top < 0) Drag.el.remove();
						break;
				}
				if (Self.els.rg.find(".new-line").length) {
					Self.dispatch({ type: "elements-to-lines", merge: true });
				}
				// remove class
				APP.els.content.removeClass("no-cursor");
				// unbind event handlers
				Self.doc.off("mousemove mouseup", Self.dispatch);
				break;

			// subscribed events
			case "meta-key":
				if (!File || !File.rulers.guides.show) return;
				if (event.detail.state === "down") {
					// add DOM elements of guidelines
					let fileGuides = File.rulers.guides,
						oY = File.oY - Proj.aY + (File.rulers.show ? Self.t : 0),
						oX = File.oX - Proj.aX + (File.rulers.show ? Self.t : 0),
						str = [];
					fileGuides.horizontal.map(y => str.push(`<div class="lineH" style="top: ${oY + (y * File.scale)}px;"></div>`));
					fileGuides.vertical.map(x => str.push(`<div class="lineV" style="left: ${oX + (x * File.scale)}px;"></div>`));
					Self.els.rg
						.css({
							"--line-color": Pref.guides.color,
							"--ruler-width": `${Self.t}px`,
						})
						.append(str.join(""));
					// render projector without guidelines
					Proj.render({ noGuideLines: 1 });
				} else {
					Self.dispatch({ type: "elements-to-lines" });
				}
				break;
			case "elements-to-lines":
				let lines = Self.els.rg.find(".lineH, .lineV");
				if (!event.merge) {
					// reset file guide lists
					File.rulers.guides.horizontal = [];
					File.rulers.guides.vertical = [];
				}
				lines.map(elem => {
					if (elem.classList.contains("lineH")) {
						let top = +elem.offsetTop - (File.oY - Proj.aY + (File.rulers.show ? Self.t : 0));
						File.rulers.guides.horizontal.push(top / File.scale);
					} else {
						let left = +elem.offsetLeft - (File.oX - Proj.aX + (File.rulers.show ? Self.t : 0));
						File.rulers.guides.vertical.push(left / File.scale);
					}
				});
				// re-render projector with updated guidelines
				Proj.render();
				// remove DOM elements of guidelines
				lines.remove();
				break;

			// proxied events
			case "toggle-grid":
				Pref.grid.show = !Pref.grid.show;
				// re-render projector
				Proj.render();
				break;
			case "toggle-pixel-grid":
				Pref.grid.pixelGrid = !Pref.grid.pixelGrid;
				// re-render projector
				Proj.render();
				break;
			case "toggle-guides":
				Pref.guides.show =
				File.rulers.guides.show = !File.rulers.guides.show;
				// re-render projector
				Proj.render();
				break;
			case "toggle-rulers":
				File.rulers.show = event.checked === 1;
				// trigger re-calculations + re-paint
				Proj.reset(File);
				// update origo
				File.oX = Math.round(Proj.cX - (File.width >> 1));
				File.oY = Math.round(Proj.cY - (File.height >> 1));
				// render projector canvas
				Proj.render();

				APP.els.content.toggleClass("show-rulers", !File.rulers.show);
				break;
		}
	},
	render(Proj) {
		let _abs = Math.abs,
			_round = Math.round,
			g, x, y,
			p = .5,
			t = this.t,
			ctx = Proj.ctx,
			scale = Proj.file.scale,
			aX = Proj.aX,
			aY = Proj.aY,
			aW = Proj.aW,
			aH = Proj.aH,
			oX = Proj.file.oX,
			oY = Proj.file.oY,
			rG = ZOOM.find(z => z.level === scale * 100).rG,
			w = aW + 1,
			h = aH + t + t + 1,
			sX = oX - aX + t,
			sY = oY - aY + t,
			eX = aW - oX + aX + sX,
			eY = aH - oY + aY + sY + t,
			line = (p1x, p1y, p2x, p2y) => {
				ctx.beginPath();
				ctx.moveTo(p1x, p1y);
				ctx.lineTo(p2x, p2y);
				ctx.stroke();
			};

		// handles if image is smaller than canvas
		while (sX > 0) sX -= rG[0] * scale;
		while (sY > 0) sY -= rG[0] * scale;

		ctx.save();
		// ruler bg & style
		ctx.lineWidth = 1;
		ctx.fillStyle = "#112222e5";
		ctx.strokeStyle = "#0000009e";
		ctx.translate(aX - t - p, aY - t - p);
		// bg
		ctx.fillRect(0, 0, w, t);
		ctx.fillRect(0, t, t, h - t);
		line(0, t, w, t);  // top ruler bottom line
		line(t, 0, t, h);  // left ruler right line
		// ruler fg & style
		ctx.strokeStyle = "#444";
		ctx.textAlign = "left";
		ctx.fillStyle = "#666";
		ctx.font = `9px Arial`;
		// top ruler
		for (x=sX, g=rG[0]*scale || 1e9; x<eX; x+=g) if (x >= t) line(x + 1, 0,  x + 1, t);
		for (x=sX, g=rG[1]*scale || 1e9; x<eX; x+=g) if (x >= t) line(x + 1, 12, x + 1, t);
		for (x=sX, g=rG[2]*scale || 1e9; x<eX; x+=g) if (x >= t) line(x + 1, 15, x + 1, t);
		// numbers
		for (x=sX, g=rG[0]*scale || 1e9; x<eX; x+=g) {
			if (x <= t - 4)  continue;
			let nr = _round(_abs(x - oX) / scale);
			ctx.fillText(nr, x + 3, 9);
		}
		// left ruler
		for (y=sY, g=rG[0]*scale || 1e9; y<eY; y+=g) if (y >= t) line(0,  y + 1, t, y + 1);
		for (y=sY, g=rG[1]*scale || 1e9; y<eY; y+=g) if (y >= t) line(12, y + 1, t, y + 1);
		for (y=sY, g=rG[2]*scale || 1e9; y<eY; y+=g) if (y >= t) line(15, y + 1, t, y + 1);
		// numbers
		for (y=sY, g=rG[0]*scale || 1e9; y<eY; y+=g) {
			if (y <= t - 4)  continue;
			let nr = _round(_abs(y - oY - t + aY) / scale);
			nr.toString().split("").map((c, i) => ctx.fillText(c, 4, y + 1 + ((i + 1) * 9)));
		}
		ctx.restore();
	},
	drawGuides(Proj) {
		let ctx = Proj.ctx,
			File = Proj.file,
			Guides = File.rulers.guides,
			scale = File.scale,
			aX = Proj.aX,
			aY = Proj.aY,
			aW = aX + Proj.aW,
			aH = aY + Proj.aH + Rulers.t,
			hori = Guides.horizontal,
			vert = Guides.vertical;
		ctx.save();
		ctx.translate(.5, .5);
		ctx.strokeStyle = Pref.guides.color;
		ctx.lineWidth = 1;
		// vertical guides
		vert.map(x => {
			let gX = File.oX + (x * scale);
			ctx.beginPath();
			ctx.moveTo(gX, aY);
			ctx.lineTo(gX, aH);
			ctx.stroke();
		});
		// horisontal guides
		hori.map(y => {
			let gY = File.oY + (y * scale);
			ctx.beginPath();
			ctx.moveTo(aX, gY);
			ctx.lineTo(aW, gY);
			ctx.stroke();
		});
		ctx.restore();
	},
	drawGrid(Proj) {
		let cfg = {
				color: "#ffffff77",
				gap: Pref.grid.gap,
			};
		this.drawPixelGrid(Proj, cfg);
	},
	drawPixelGrid(Proj, cfg={}) {
		let ctx = Proj.ctx,
			File = Proj.file,
			rSize = Rulers.t,
			gap = cfg.gap || 1,
			scale = File.scale * gap,
			aX = Math.max(Proj.aX, File.oX),
			aY = Math.max(Proj.aY, File.oY),
			aW = Math.min(aX + Proj.aW - rSize, File.width - rSize),
			aH = Math.min(aY + Proj.aH + rSize, File.height - rSize),
			oX = scale - (aX - File.oX) % scale,
			oY = scale - (aY - File.oY) % scale,
			xl = Math.ceil((aW + rSize) / scale),
			yl = Math.ceil((aH + rSize) / scale);

		ctx.save();
		ctx.translate(.5, .5);
		ctx.strokeStyle = cfg.color || "#777777aa";
		ctx.lineWidth = 1;
		// horizontal lines
		for (let y=0; y<yl; y++) {
			let lY = aY + (y * scale) + oY;
			ctx.beginPath();
			ctx.moveTo(aX, lY);
			ctx.lineTo(aX + aW + rSize, lY);
			ctx.stroke();
		}
		// vertical lines
		for (let x=0; x<xl; x++) {
			let lX = aX + (x * scale) + oX;
			ctx.beginPath();
			ctx.moveTo(lX, aY);
			ctx.lineTo(lX, aY + aH + rSize);
			ctx.stroke();
		}
		ctx.restore();
	},
	drawCheckers(ctx, opt) {
		let cfg = {
				size: 8,
				pX: 0, pY: 0,
				oX: 0, oY: 0,
				x:  0, y:  0,
				w: 16, h: 16,
				...opt,
			},
			lX = cfg.w % cfg.size,
			lY = cfg.h % cfg.size,
			il = (cfg.w-lX) / cfg.size,
			jl = (cfg.h-lY) / cfg.size;
		ctx.save();
		if (cfg.oX < 0) {
			cfg.pX = cfg.oX % cfg.size;
			cfg.x = (cfg.pX - cfg.oX) / cfg.size;
			il = (il-lX) - cfg.x;
		}
		if (cfg.oY < 0) {
			cfg.pY = cfg.oY % cfg.size;
			cfg.y = (cfg.pY - cfg.oY) / cfg.size;
			jl = (jl-lY) - cfg.y;
		}
		for (let i=cfg.x; i<il; i++) {
			for (let j=cfg.y; j<jl; j++) {
				ctx.fillStyle = ((i + j) % 2) ? "#bbb" : "#fff";
				let x = i * cfg.size + cfg.pX,
					y = j * cfg.size + cfg.pY,
					w = cfg.size,
					h = cfg.size;
				if (i === il-1) w = lX || cfg.size;
				if (j === jl-1) h = lY || cfg.size;
				ctx.fillRect(x, y, w, h);
			}
		}
		ctx.restore();
	}
};
