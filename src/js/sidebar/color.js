
// keane.sidebar.color

{
	init() {
		let root = window.find(`.box-body > div[data-box="color"]`);
		// fast references
		this.doc = $(document);
		this.els = {
			root,
			colorValues: root.find(".color-values"),
			colorWheel: root.find(".color-wheel"),

			iHue: root.find(`input[name="color-hsl-hue"]`),
			iSaturation: root.find(`input[name="color-hsl-saturation"]`),
			iLightness: root.find(`input[name="color-hsl-lightness"]`),
			iRed: root.find(`input[name="color-rgb-red"]`),
			iGreen: root.find(`input[name="color-rgb-green"]`),
			iBlue: root.find(`input[name="color-rgb-blue"]`),
			iHex: root.find(`input[name="color-hex"]`),
		};

		// bind event handlers
		this.els.colorWheel.on("mousedown", this.doColorWheel);

		// subscribe to events
		karaqu.on("set-fg-color", this.dispatch);

		// temp
		setTimeout(() => window.find(`.swatches-wrapper > div:nth(0)`).trigger("click"), 500);
	},
	dispatch(event) {
		let APP = keane,
			Self = APP.sidebar.color,
			rgb,
			hsl,
			el;
		// console.log(event);
		switch (event.type) {
			// subscribed events
			case "set-fg-color":
				// console.log( event.detail );
				rgb = ColorLib.hexToRgb(event.detail.hex);
				hsl = ColorLib.rgbToHsl(rgb);
				// console.log( hsl );

				Self.els.iHue.val(hsl.h +"°");
				Self.els.iSaturation.val(hsl.s +"%");
				Self.els.iLightness.val(hsl.l +"%");

				Self.els.iRed.val(rgb.r);
				Self.els.iGreen.val(rgb.g);
				Self.els.iBlue.val(rgb.b);

				Self.els.iHex.val(event.detail.hex.slice(1,7));

				let box = Self.els.colorWheel.find(".color-shape"),
					top = +box.prop("offsetHeight") * (1-(hsl.s/100)),
					left = +box.prop("offsetWidth") * (hsl.l/100),
					boxHex = ColorLib.hslToHex({ ...hsl, s: 1, l: .5 });
console.log( hsl );
console.log( left );
				box.css({ "background-color": boxHex });

				Self.els.colorWheel.find(".box-cursor").css({ top, left });
				Self.els.colorWheel.find(".circle-cursor").css({ transform: `rotate(${hsl.h}deg)` });
				break;

			// custom events
			case "show-color-values":
				event.el.parent().find(".active").removeClass("active");
				event.el.addClass("active");

				Self.els.colorValues
					.removeClass("show-rgb show-hsl")
					.addClass(`show-${event.arg}`);
				break;
			case "color-wheel-shape":
				// TODO (!?)
				break;
		}
	},
	doColorWheel(event) {
		let APP = keane,
			Self = APP.sidebar.color,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// origin element
				let el = $(event.target);
				// handle areas
				if (el.hasClass("negative-space")) return;
				if (el.hasClass("color-shape")) return Self.doColorBox(event);

				// prepare drag object
				let shape = el.find(".color-shape"),
					cursor = el.find(".circle-cursor"),
					rect = el[0].getBoundingClientRect(),
					center = {
						x: rect.x + (+el.prop("offsetWidth") >> 1),
						y: rect.y + (+el.prop("offsetHeight") >> 1),
					};
				Self.drag = {
					cursor,
					center,
					shape,
					alpha: 1,
					sat: parseInt(Self.els.iSaturation.val(), 10) / 100,
					lgh: parseInt(Self.els.iLightness.val(), 10) / 100,
					_PI: Math.PI,
					_atan2: Math.atan2,
					_round: Math.round,
				};
				// prevent mouse from triggering mouseover
				APP.els.content.addClass("no-cursor");
				// force cursor to position to mouse
				Self.doColorWheel({ type: "mousemove", clientX: event.clientX, clientY: event.clientY });
				// bind event handlers
				Self.doc.on("mousemove mouseup", Self.doColorWheel);
				break;
			case "mousemove":
				Drag.hue = Drag._atan2(event.clientY - Drag.center.y, event.clientX - Drag.center.x) * (180 / Drag._PI);
				if (Drag.hue < 0) Drag.hue += 360;
				Drag.cursor.css({ transform: `rotate(${Drag.hue}deg)` });

				Drag.boxHex = Color.hslToHex(Drag.hue, 1, .5);
				Drag.shape.css({ "background-color": Drag.boxHex });

				Drag.hex = Color.hslToHex(Drag.hue, Drag.sat, Drag.lgh, Drag.alpha);
				Drag.rgb = Color.hexToRgb(Drag.hex);

				// rgb values
				Self.els.iRed.val(Drag.rgb[0]);
				Self.els.iGreen.val(Drag.rgb[1]);
				Self.els.iBlue.val(Drag.rgb[2]);

				// hue field
				Self.els.iHue.val(Drag._round(Drag.hue) +"°");

				// broadcast event
				karaqu.emit("set-fg-color", { hex: Drag.hex });
				break;
			case "mouseup":
				// remove class
				APP.els.content.removeClass("no-cursor");
				// unbind event handlers
				Self.doc.off("mousemove mouseup", Self.doColorWheel);
				break;
		}
	},
	doColorBox(event) {
		let APP = keane,
			Self = APP.sidebar.color,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// get elements & align cursor
				let el = $(event.target),
					cursor = el.find(".box-cursor").css({ left: event.offsetX, top: event.offsetY });
				// prepare drag object
				Self.drag = {
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
				APP.els.content.addClass("no-cursor");
				// bind event handlers
				Self.doc.on("mousemove mouseup", Self.doColorBox);
				break;
			case "mousemove":
				let left = Drag._min(Drag._max(event.clientX + Drag.clickX, Drag.min.x), Drag.max.x),
					top = Drag._min(Drag._max(event.clientY + Drag.clickY, Drag.min.y), Drag.max.y);
				Drag.cursor.css({ top, left });

				// calculate color from pos
				let hsvValue = 1 - (((top + .01) / Drag.max.y * 100) / 100),
					hsvSaturation = (left / Drag.max.x * 100) / 100;
				Drag.lgh = (hsvValue / 2) * (2 - hsvSaturation);
				Drag.sat = (hsvValue * hsvSaturation) / (1 - Drag._abs(2 * Drag.lgh - 1));

				Drag.hex = Color.hslToHex(Drag.hue, Drag.sat, Drag.lgh, Drag.alpha);
				Drag.rgb = Color.hexToRgb(Drag.hex);

				// saturation & lightness
				Self.els.iSaturation.val(Drag._round(Drag.sat * 100) +"%");
				Self.els.iLightness.val(Drag._round(Drag.lgh * 100) +"%");

				// rgb values
				Self.els.iRed.val(Drag.rgb[0]);
				Self.els.iGreen.val(Drag.rgb[1]);
				Self.els.iBlue.val(Drag.rgb[2]);

				// hex value
				Self.els.iHex.val(Drag.hex.slice(1,7));

				// broadcast event
				karaqu.emit("set-fg-color", { hex: Drag.hex });
				break;
			case "mouseup":
				// remove class
				APP.els.content.removeClass("no-cursor");
				// unbind event handlers
				Self.doc.off("mousemove mouseup", Self.doColorBox);
				break;
		}
	}
}
