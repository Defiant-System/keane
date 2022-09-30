
const Dialogs = {
	init() {
		// fast references
		this.doc = $(document);
		this.content = window.find("content");

		let dlg = window.find(`.dialog-box[data-dlg="dlgColors"]`);
		this.els = {
			iHue: dlg.find(`input[name="color-hsl-hue"]`),
			iSaturation: dlg.find(`input[name="color-hsl-saturation"]`),
			iLightness: dlg.find(`input[name="color-hsl-lightness"]`),
			iRed: dlg.find(`input[name="color-rgb-red"]`),
			iGreen: dlg.find(`input[name="color-rgb-green"]`),
			iBlue: dlg.find(`input[name="color-rgb-blue"]`),
			iAlpha: dlg.find(`input[name="color-opacity"]`),
			iHex: dlg.find(`input[name="color-hex"]`),
		};

		// bind event handlers
		this.content.on("mousedown", "[data-dlg]", this.dispatch);
	},
	dispatch(event) {
		let APP = keane,
			Self = Dialogs,
			Drag = Self.drag,
			el;
		// console.log(event);
		switch (event.type) {
			case "mousedown":
				el = $(event.target);
				
				switch (true) {
					case el.hasClass("toggler"):
						return el.data("value") === "on"
								? el.data({ value: "off" })
								: el.data({ value: "on" });
					case el.hasClass("color-box"):
						return Self.doColorBox(event);
					case el.hasClass("hue-bar"):
						return Self.doHueBar(event);
					case el.hasClass("knob"):
						return Self.doKnob(event);
				}

				// prevent default behaviour
				event.preventDefault();

				let dlg = el.parents(".dialog-box"),
					offset = {
						y: +dlg.prop("offsetTop") - event.clientY,
						x: +dlg.prop("offsetLeft") - event.clientX,
					};

				Self.drag = {
					dlg,
					offset,
				};

				// bind event handlers
				Self.content.addClass("no-cursor");
				Self.doc.on("mousemove mouseup", Self.dispatch);
				break;
			case "mousemove":
				let top = event.clientY + Drag.offset.y,
					left = event.clientX + Drag.offset.x;
				Drag.dlg.css({ top, left });
				break;
			case "mouseup":
				// unbind event handlers
				Self.content.removeClass("no-cursor");
				Self.doc.off("mousemove mouseup", Self.dispatch);
				break;

			// custom event
			case "dlg-preview-gaussian-blur":
			case "dlg-preview-sharpen":
				console.log( event );
				break;
		}
	},
	doColorBox(event) {
		let APP = keane,
			Self = Dialogs,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// get elements & align cursor
				let el = $(event.target),
					cursor = el.find(".cursor").css({ left: event.offsetX, top: event.offsetY }),
					cEl = el.parents(".dlg-content");
				// prepare drag object
				Self.drag = {
					cEl,
					cursor,
					clickX: +cursor.prop("offsetLeft") - event.clientX,
					clickY: +cursor.prop("offsetTop") - event.clientY,
					min: { x: 0, y: 0 },
					max: {
						x: +el.prop("offsetWidth"),
						y: +el.prop("offsetHeight"),
					},
					hue: parseInt(Self.els.iHue.val(), 10),
					alpha: 1,
					_max: Math.max,
					_min: Math.min,
					_abs: Math.abs,
					_round: Math.round,
				};
				// prevent mouse from triggering mouseover
				APP.els.content.addClass("no-dlg-cursor");
				// bind event handlers
				Self.doc.on("mousemove mouseup", Self.doColorBox);
				break;
			case "mousemove":
				let left = Drag._min(Drag._max(event.clientX + Drag.clickX, Drag.min.x), Drag.max.x),
					top = Drag._min(Drag._max(event.clientY + Drag.clickY, Drag.min.y), Drag.max.y);
				Drag.cursor.css({ top, left });

				// calculate color from pos
				let hsvValue = 1 - ((top / Drag.max.y * 100) / 100),
					hsvSaturation = (left / Drag.max.x * 100) / 100;
				Drag.lgh = (hsvValue / 2) * (2 - hsvSaturation);
				Drag.sat = (hsvValue * hsvSaturation) / (1.0001 - Drag._abs(2 * Drag.lgh - 1));

				let hsl = { h: Drag.hue, s: Drag.sat, l: Drag.lgh, a: Drag.alpha };
				Drag.hex = ColorLib.hslToHex(hsl);
				Drag.rgb = ColorLib.hexToRgb(Drag.hex);

				// update color
				Drag.cEl.css({ "--color": Drag.hex });
				// saturation & lightness
				Self.els.iSaturation.val(Drag._round(Drag.sat * 100) +"%");
				Self.els.iLightness.val(Drag._round(Drag.lgh * 100) +"%");
				// rgb values
				Self.els.iRed.val(Drag.rgb.r);
				Self.els.iGreen.val(Drag.rgb.g);
				Self.els.iBlue.val(Drag.rgb.b);
				break;
			case "mouseup":
				// remove class
				APP.els.content.removeClass("no-dlg-cursor");
				// unbind event handlers
				Self.doc.off("mousemove mouseup", Self.doColorBox);
				break;
		}
	},
	doHueBar(event) {
		let APP = keane,
			Self = Dialogs,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// get elements & align cursor
				let el = $(event.target),
					cursor = el.find(".cursor").css({ top: event.offsetY }),
					cEl = el.parents(".dlg-content");
				// prepare drag object
				Self.drag = {
					cEl,
					cursor,
					clickY: +cursor.prop("offsetTop") - event.clientY,
					min: { y: 0 },
					max: { y: +el.prop("offsetHeight") },
					alpha: parseInt(Self.els.iAlpha.val(), 10) / 100,
					sat: parseInt(Self.els.iSaturation.val(), 10) / 100,
					lgh: parseInt(Self.els.iLightness.val(), 10) / 100,
					_max: Math.max,
					_min: Math.min,
					_round: Math.round,
				};
				// prevent mouse from triggering mouseover
				APP.els.content.addClass("no-dlg-cursor");
				// bind event handlers
				Self.doc.on("mousemove mouseup", Self.doHueBar);
				break;
			case "mousemove":
				let top = Drag._min(Drag._max(event.clientY + Drag.clickY, Drag.min.y), Drag.max.y),
					hue = Drag._round((1-(top / Drag.max.y)) * 360);;
				Drag.cursor.css({ top });

				Drag.hue = ColorLib.hslToHex({ h: hue, s: 1, l: .5, a: 1 });

				let hsl = { h: hue, s: Drag.sat, l: Drag.lgh, a: Drag.alpha };
				Drag.hex = ColorLib.hslToHex(hsl);
				Drag.rgb = ColorLib.hexToRgb(Drag.hex);

				// update color-box color
				Drag.cEl.css({ "--hue": Drag.hue, "--color": Drag.hex });
				// hue value
				Self.els.iHue.val(hue +"°");
				// saturation & lightness
				Self.els.iSaturation.val(Drag._round(Drag.sat * 100) +"%");
				Self.els.iLightness.val(Drag._round(Drag.lgh * 100) +"%");
				// rgb values
				Self.els.iRed.val(Drag.rgb.r);
				Self.els.iGreen.val(Drag.rgb.g);
				Self.els.iBlue.val(Drag.rgb.b);
				break;
			case "mouseup":
				// remove class
				APP.els.content.removeClass("no-dlg-cursor");
				// unbind event handlers
				Self.doc.off("mousemove mouseup", Self.doHueBar);
				break;
		}
	},
	doKnob(event) {
		let APP = keane,
			Self = Dialogs,
			Drag = Self.drag;
		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				
				let el = $(event.target),
					src = el.parent().find(".value input"),
					suffix = src.data("suffix") || "",
					min = +src.data("min"),
					max = +src.data("max"),
					click = {
						y: event.clientY,
						x: event.clientX,
					};
				Self.drag = { el, src, suffix, min, max, click };
				// bind event handlers
				Self.content.addClass("no-cursor");
				Self.doc.on("mousemove mouseup", Self.doKnob);
				break;
			case "mousemove":
				break;
			case "mouseup":

				// unbind event handlers
				Self.content.removeClass("no-cursor");
				Self.doc.off("mousemove mouseup", Self.doKnob);
				break;
			// custom events
			case "set-initial-value":
				// initial value of knob
				break;
		}
	}
};
