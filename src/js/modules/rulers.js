
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
		karaqu.on("meta-key", this.doGuide);

		// bind event handlers
		this.els.rg.on("mousedown", this.doGuide)
	},
	doGuide(event) {
		let APP = keane,
			Self = Rulers,
			Drag = Self.drag;
		switch (event.type) {
			// subscribed events
			case "meta-key":
				if (event.detail.state === "down") {
					// add DOM elements of guidelines
					let File = Projector.file,
						fileGuides = File.rulers.guides,
						oY = File.oY - Projector.aY + (File.rulers.show ? Self.t : 0),
						oX = File.oX - Projector.aX + (File.rulers.show ? Self.t : 0),
						str = [];
					fileGuides.horizontal.map(y => str.push(`<div class="lineH" style="top: ${oY+y}px;"></div>`));
					fileGuides.vertical.map(x => str.push(`<div class="lineV" style="left: ${oX+x}px;"></div>`));
					Self.els.rg
						.css({
							"--line-color": Pref.guides.color,
							"--ruler-width": `${Self.t}px`,
						})
						.append(str.join(""));
					// render projector without guidelines
					Projector.render({ noGuideLines: 1 });

				} else {
					let File = Projector.file,
						lines = Self.els.rg.find(".lineH, .lineV");
					// reset file guide lists
					File.rulers.guides.horizontal = [];
					File.rulers.guides.vertical = [];
					lines.map(elem => {
						if (elem.classList.contains("lineH")) {
							let top = +elem.offsetTop - (File.oY - Projector.aY + (File.rulers.show ? Self.t : 0));
							File.rulers.guides.horizontal.push(top);
						} else {
							let left = +elem.offsetLeft - (File.oX - Projector.aX + (File.rulers.show ? Self.t : 0));
							File.rulers.guides.vertical.push(left);
						}
					});
					// re-render projector with updated guidelines
					Projector.render();
					// remove DOM elements of guidelines
					lines.remove();
				}
				break;
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				// get element & variables
				let el = $(event.target),
					type = el.prop("className").split("-")[0],
					click = {
						y: event.clientY - +el.prop("offsetTop"),
						x: event.clientX - +el.prop("offsetLeft"),
					};
				// identify type of element
				switch (type) {
					case "top":
					case "left":
						type = type === "top" ? "lineH" : "lineV";
						el = el.parent().append(`<div class="${type}"></div>`);
						break;
					case "corner":
						el = el.parent().append(`<div class="lineH"></div><div class="lineV"></div>`);
						break;
				}
				// prepare drag object
				Self.drag = { el, type, click, data: {} };

				// prevent mouse from triggering mouseover
				APP.els.content.addClass("no-cursor");
				// bind event handlers
				Self.doc.on("mousemove mouseup", Self.doGuide);
				break;
			case "mousemove":
				let left = event.clientX - Drag.click.x,
					top = event.clientY - Drag.click.y;
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
				// remove class
				APP.els.content.removeClass("no-cursor");
				// unbind event handlers
				Self.doc.off("mousemove mouseup", Self.doGuide);
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
			aX = Proj.aX,
			aY = Proj.aY,
			aW = Proj.aX + Proj.aW,
			aH = Proj.aY + Proj.aH + Rulers.t,
			hori = Guides.horizontal,
			vert = Guides.vertical;

		ctx.save();
		ctx.translate(.5, .5);
		ctx.strokeStyle = Pref.guides.color;
		ctx.lineWidth = 1;
		// vertical guides
		vert.map(x => {
			let gX = File.oX + x;
			ctx.beginPath();
			ctx.moveTo(gX, aY);
			ctx.lineTo(gX, aH);
			ctx.stroke();
		});
		// horisontal guides
		hori.map(y => {
			let gY = File.oY + y;
			ctx.beginPath();
			ctx.moveTo(aX, gY);
			ctx.lineTo(aW, gY);
			ctx.stroke();
		});
		ctx.restore();
	}
};
